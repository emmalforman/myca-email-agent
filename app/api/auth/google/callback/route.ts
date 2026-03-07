import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { saveGmailTokens } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=no_code`);
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error('Failed to get tokens');
    }

    // Get user email
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const userEmail = userInfo.data.email!;

    // Save tokens (ensure expiry_date is a number for Supabase BIGINT)
    let expiryDate: number;
    if (typeof tokens.expiry_date === 'number') {
      expiryDate = tokens.expiry_date;
    } else if (tokens.expiry_date && Object.prototype.toString.call(tokens.expiry_date) === '[object Date]') {
      expiryDate = (tokens.expiry_date as Date).getTime();
    } else {
      expiryDate = Date.now() + 3600000;
    }
    await saveGmailTokens(
      userEmail,
      tokens.access_token,
      tokens.refresh_token,
      expiryDate
    );

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?connected=true`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('OAuth callback error:', message, error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=auth_failed`);
  }
}



