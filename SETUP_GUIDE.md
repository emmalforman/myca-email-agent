# Quick Setup Guide

Follow these steps in order:

## Step 1: Install Dependencies

```bash
cd myca-email-agent
npm install
```

## Step 2: Google Cloud Setup (5 minutes)

1. Go to https://console.cloud.google.com/
2. **Create Project** → Name it "myca-email-agent"
3. **Enable APIs**:
   - Search "Gmail API" → Enable
   - Search "Custom Search API" → Enable
4. **OAuth Consent Screen**:
   - External user type
   - App name: "Myca Email Agent"
   - Your email as test user
   - Scopes: `gmail.compose`, `gmail.modify`
5. **Create Credentials**:
   - OAuth 2.0 Client ID
   - Web application
   - Redirect URI: `http://localhost:3000/api/auth/google/callback`
   - **Save Client ID and Secret**

## Step 3: Google Custom Search (3 minutes)

1. Go to https://programmablesearchengine.google.com/
2. **Create Search Engine**:
   - Sites to search: `*` (entire web)
   - Name: "Myca Person Lookup"
3. **Get Search Engine ID** (CSE_ID)
4. **Get API Key**:
   - Go back to Google Cloud Console
   - APIs & Services → Credentials
   - Create API Key
   - Restrict to "Custom Search API"

## Step 4: Supabase Setup (3 minutes)

1. Go to https://supabase.com/
2. **Create Project** (free tier is fine)
3. **SQL Editor** → Run `supabase-setup.sql`
4. **Settings** → **API**:
   - Copy **Project URL**
   - Copy **Service Role Key** (keep secret!)

## Step 5: Claude API Key (1 minute)

1. Go to https://console.anthropic.com/
2. **Create API Key**
3. Copy it

## Step 6: Environment Variables

Create `.env.local`:

```bash
GOOGLE_CLIENT_ID=your_client_id_from_step_2
GOOGLE_CLIENT_SECRET=your_client_secret_from_step_2

SUPABASE_URL=your_supabase_url_from_step_4
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_from_step_4

GOOGLE_CSE_API_KEY=your_api_key_from_step_3
GOOGLE_CSE_ID=your_cse_id_from_step_3

ANTHROPIC_API_KEY=your_claude_key_from_step_5

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 7: Run It!

```bash
npm run dev
```

Open http://localhost:3000

Enter your Gmail address → Click "Connect Gmail" → Authorize → Done!

## Testing

Try these inputs:

1. **Lookup**: "Email head of brand at Athletic Brewing to invite into Myca"
2. **Direct**: "Email Sarah Kim at Athletic Brewing about joining Myca"
3. **Event**: "Invite Priya to Feb 2 caviar event"

## Troubleshooting

**"Gmail not connected"**
- Make sure you completed OAuth flow
- Check Supabase `gmail_tokens` table has your row

**"Lookup returns no results"**
- Verify Google CSE API key is correct
- Check CSE ID matches
- Try without LinkedIn restriction in lookup.ts

**"Failed to create draft"**
- Check Gmail API is enabled
- Verify OAuth scopes include `gmail.compose` and `gmail.modify`

## Next: Deploy to Vercel

1. Push to GitHub
2. Import in Vercel
3. Add all env vars
4. Update Google OAuth redirect URI to your Vercel URL
5. Deploy!


