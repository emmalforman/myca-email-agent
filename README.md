# Myca Email Agent

AI-powered email drafting assistant that creates Gmail drafts in your voice, with automatic person lookup and strategic question-asking.

## Features

- ✅ Drafts emails in Emma's voice using Claude
- ✅ Creates Gmail drafts with automatic labeling
- ✅ Finds the right person to email (lookup "Head of Brand at X" → 5 candidates)
- ✅ Asks strategic questions only when needed
- ✅ Remembers bad drafts and avoids repeating mistakes
- ✅ Supports 5 email modes: existing member, new member, event, person of interest, brand

## Setup Instructions

### 1. Install Dependencies

```bash
cd myca-email-agent
npm install
```

### 2. Set Up Google Cloud (Gmail API)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (e.g., "myca-email-agent")
3. Enable **Gmail API**
4. Go to **APIs & Services** → **Credentials**
5. Create **OAuth 2.0 Client ID**:
   - Application type: Web application
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/google/callback` (dev)
     - `https://YOURDOMAIN.vercel.app/api/auth/google/callback` (prod)
6. Copy **Client ID** and **Client Secret**

### 3. Set Up Google Custom Search (for person lookup)

1. Go to [Google Custom Search](https://programmablesearchengine.google.com/)
2. Create a new search engine
3. Set it to search the entire web (or limit to LinkedIn + company sites)
4. Get your **Search Engine ID** (CSE_ID)
5. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
6. Create an **API Key** for Custom Search API
7. Enable **Custom Search API** in your project

### 4. Set Up Supabase (for token storage)

1. Go to [Supabase](https://supabase.com/) and create a project
2. Go to **SQL Editor** and run:

```sql
CREATE TABLE gmail_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT UNIQUE NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expiry_date BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optional: Add RLS if you want row-level security
ALTER TABLE gmail_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own tokens"
  ON gmail_tokens
  FOR ALL
  USING (auth.uid()::text = user_email);
```

3. Go to **Settings** → **API**
4. Copy **Project URL** and **Service Role Key** (keep this secret!)

### 5. Get Claude API Key

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create an API key
3. Copy it

### 6. Configure Environment Variables

Create `.env.local`:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Google Custom Search
GOOGLE_CSE_API_KEY=your_cse_api_key_here
GOOGLE_CSE_ID=your_cse_id_here

# Claude
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Notion (Optional - for logging all drafts)
NOTION_API_KEY=your_notion_api_key_here
NOTION_DATABASE_ID=your_notion_database_id_here
```

### 7. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 8. Connect Gmail

1. Enter your Gmail address when prompted
2. Click "Connect Gmail"
3. Authorize the app
4. You're done!

## Usage

### Basic Usage

Type in the text box:
```
Email head of brand at Athletic Brewing to invite into Myca
```

The agent will:
1. Look up 5 likely candidates
2. You select one
3. Ask 1 strategic question if needed
4. Show draft preview
5. Create Gmail draft with label

### Direct Email (no lookup)

```
Email Sarah Kim at Athletic Brewing about joining Myca
```

### Event Invite

```
Invite Priya to Feb 2 caviar event at Bankok Supper Club
```

### Existing Member

```
Email Meredith to grab time next week
```

## Deployment to Vercel

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com/)
3. Add all environment variables
4. Update Google OAuth redirect URI to your Vercel URL
5. Deploy!

## Project Structure

```
myca-email-agent/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── google/        # OAuth endpoints
│   │   ├── agent/
│   │   │   ├── start/         # Classify + lookup detection
│   │   │   └── choose/        # User selection + drafting
│   │   └── gmail/
│   │       └── createDraft/   # Create Gmail draft
│   ├── page.tsx               # Main UI
│   └── layout.tsx
├── lib/
│   ├── claude.ts              # Claude API wrapper
│   ├── gmail.ts               # Gmail API wrapper
│   ├── lookup.ts              # Person lookup
│   └── supabase.ts            # Supabase client
├── types/
│   └── index.ts               # TypeScript types
└── package.json
```

## Troubleshooting

### "Gmail not connected"
- Make sure you've completed OAuth flow
- Check Supabase table has your tokens
- Try disconnecting and reconnecting

### Lookup returns no results
- Check Google CSE API key is valid
- Verify CSE ID is correct
- Try searching without LinkedIn restriction

### Drafts not appearing in Gmail
- Check Gmail API permissions
- Verify labels are being created
- Check browser console for errors

## Cost Estimates

- **Claude API**: ~$0.01-0.03 per draft (very cheap)
- **Google CSE**: Free tier: 100 queries/day, then $5 per 1,000
- **Supabase**: Free tier: 500MB database, 2GB bandwidth
- **Vercel**: Free tier: 100GB bandwidth/month

Total: ~$0-10/month for personal use.

## Notion Integration (Optional)

To log all your email drafts to Notion:

1. Follow `NOTION_SETUP.md` for step-by-step instructions
2. Create a Notion integration and database
3. Add `NOTION_API_KEY` and `NOTION_DATABASE_ID` to `.env.local`
4. Every draft will automatically be logged to Notion

This gives you a searchable archive of all your email drafts, including:
- Original request
- Final draft
- Selected person (if lookup was used)
- Questions asked/answered
- Metadata (mode, tag, date)

## Next Steps

- Add email examples to system prompt for better voice matching
- Build retrieval system to pull from your sent emails
- Add WhatsApp/Slack integration
- Add batch processing for multiple emails

