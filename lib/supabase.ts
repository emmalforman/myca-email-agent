import { createClient } from '@supabase/supabase-js';
import type { GmailTokens } from '@/types';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function saveGmailTokens(
  userEmail: string,
  accessToken: string,
  refreshToken: string,
  expiryDate: number
) {
  const { error } = await supabase
    .from('gmail_tokens')
    .upsert({
      user_email: userEmail,
      access_token: accessToken,
      refresh_token: refreshToken,
      expiry_date: expiryDate,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_email',
      ignoreDuplicates: false,
    });

  if (error) {
    console.error('Supabase error:', error);
    throw error;
  }
}

export async function getGmailTokens(userEmail: string): Promise<GmailTokens | null> {
  const { data, error } = await supabase
    .from('gmail_tokens')
    .select('*')
    .eq('user_email', userEmail)
    .single();

  if (error || !data) return null;

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expiry_date: data.expiry_date,
    user_email: data.user_email,
  };
}

