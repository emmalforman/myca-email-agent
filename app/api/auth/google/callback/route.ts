import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { saveGmailTokens } from '@/lib/supabase';

function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL || '';
  return url.replace(/\/$/, ''); // no trailing slash
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const baseUrl = getBaseUrl();

  if (!code) {
    return NextResponse.redirect(`${baseUrl}?error=no_code`);
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${baseUrl}/api/auth/google/callback`
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error('Failed to get tokens');
    }

    // Get user email from Gmail API (we only have Gmail scopes, not userinfo)
    oauth2Client.setCredentials(tokens);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const profile = await gmail.users.getProfile({ userId: 'me' });
    const userEmail = profile.data.emailAddress!;

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

    return NextResponse.redirect(`${baseUrl}?connected=true`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('OAuth callback error:', message, error);
    // Surface a short safe reason so user can see what failed (avoid leaking secrets)
    const safeReason = encodeURIComponent(message.slice(0, 80).replace(/[^a-zA-Z0-9 _-]/g, ''));
    return NextResponse.redirect(`${baseUrl}?error=auth_failed&reason=${safeReason}`);
  }
}



