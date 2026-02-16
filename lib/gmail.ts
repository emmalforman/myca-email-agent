import { google } from 'googleapis';
import type { GmailTokens } from '@/types';
import { saveGmailTokens } from './supabase';

export async function getGmailClient(tokens: GmailTokens) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`
  );

  oauth2Client.setCredentials({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
  });

  // Refresh token if expired
  if (Date.now() >= tokens.expiry_date) {
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      if (credentials.access_token && credentials.refresh_token) {
        // Update tokens in database
        // expiry_date can be Date or number (timestamp in ms)
        let newExpiry: number;
        if (credentials.expiry_date) {
          if (typeof credentials.expiry_date === 'number') {
            newExpiry = credentials.expiry_date;
          } else {
            newExpiry = credentials.expiry_date.getTime();
          }
        } else {
          newExpiry = Date.now() + 3600000;
        }
        await saveGmailTokens(
          tokens.user_email,
          credentials.access_token,
          credentials.refresh_token!,
          newExpiry
        );
        oauth2Client.setCredentials(credentials);
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  return google.gmail({ version: 'v1', auth: oauth2Client });
}

export async function ensureLabelExists(gmail: any, labelName: string): Promise<string> {
  const labels = await gmail.users.labels.list({ userId: 'me' });
  const existing = labels.data.labels?.find((l: any) => l.name === labelName);
  
  if (existing) return existing.id;

  const newLabel = await gmail.users.labels.create({
    userId: 'me',
    requestBody: {
      name: labelName,
      labelListVisibility: 'labelShow',
      messageListVisibility: 'show',
    },
  });

  return newLabel.data.id!;
}

export async function createDraft(
  tokens: GmailTokens,
  to: string,
  subject: string,
  body: string,
  tag: string
) {
  const gmail = await getGmailClient(tokens);

  // Create MIME message
  const message = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset=utf-8',
    '',
    body,
  ].join('\n');

  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  // Create draft
  const draft = await gmail.users.drafts.create({
    userId: 'me',
    requestBody: {
      message: {
        raw: encodedMessage,
      },
    },
  });

  // Apply label
  if (draft.data.message?.id) {
    const labelId = await ensureLabelExists(gmail, tag);
    await gmail.users.messages.modify({
      userId: 'me',
      id: draft.data.message.id,
      requestBody: {
        addLabelIds: [labelId],
      },
    });
  }

  return draft.data;
}

