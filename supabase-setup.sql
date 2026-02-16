-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS gmail_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT UNIQUE NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expiry_date BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_gmail_tokens_user_email ON gmail_tokens(user_email);

-- Optional: Enable RLS (Row Level Security) if you want additional security
-- ALTER TABLE gmail_tokens ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "Users can only access their own tokens"
--   ON gmail_tokens
--   FOR ALL
--   USING (auth.uid()::text = user_email);


