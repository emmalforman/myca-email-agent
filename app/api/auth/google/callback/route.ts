import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { saveGmailTokens } from '@/lib/supabase';

function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL || '';
  return url.replace(/\/$/, ''); // no trailing slash
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (error && typeof error === 'object') {
    const err = error as Record<string, unknown>;
    if (typeof err.message === 'string') return err.message;
    // Gaxios/Google API error shape
    const response = err.response as Record<string, unknown> | undefined;
    const data = response?.data as Record<string, unknown> | undefined;
    if (data) {
      const inner = data.error as Record<string, unknown> | string | undefined;
      if (typeof inner === 'string') return inner;
      if (inner && typeof inner === 'object' && typeof inner.message === 'string') return inner.message;
      if (typeof data.message === 'string') return data.message;
      if (typeof data.error_description === 'string') return data.error_description;
    }
  }
  const str = String(error);
  if (str === '[object Object]') return 'auth_error_check_vercel_logs';
  return str;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const baseUrl = getBaseUrl();

  if (!code) {
    return NextResponse.redirect(`${baseUrl}?error=no_code`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.error('OAuth callback: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing');
    return NextResponse.redirect(`${baseUrl}?error=auth_failed&reason=missing_google_credentials`);
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    `${baseUrl}/api/auth/google/callback`
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error('Failed to get tokens');
    }

    // Get user email from OAuth2 userinfo (no Gmail API call needed)
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();
    const userEmail = data.email;
    if (!userEmail) {
      throw new Error('No email in userinfo response');
    }

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
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    let reason = message.slice(0, 80).replace(/[^a-zA-Z0-9 _-]/g, '');
    if (!reason || reason === 'object Object') reason = 'auth_error_check_vercel_logs';
    console.error('OAuth callback error:', message);
    if (error && typeof error === 'object') {
      const err = error as Record<string, unknown>;
      const res = err.response as { status?: number; data?: unknown } | undefined;
      console.error('OAuth error full:', JSON.stringify({ message: err.message, code: err.code, status: res?.status, data: res?.data }));
    }
    return NextResponse.redirect(`${baseUrl}?error=auth_failed&reason=${encodeURIComponent(reason)}`);
  }
}



