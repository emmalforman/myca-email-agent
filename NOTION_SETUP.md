# Notion Integration Setup

This will log all your email drafts to a Notion database so you have a record of everything.

## Step 1: Create Notion Integration

1. Go to https://www.notion.so/my-integrations
2. Click **"+ New integration"**
3. Name it: "Myca Email Agent"
4. Select your workspace
5. Under **Capabilities**, enable:
   - ✅ Read content
   - ✅ Insert content
   - ✅ Update content
6. Click **Submit**
7. **Copy the "Internal Integration Token"** (starts with `secret_`)

## Step 2: Create Notion Database

1. Create a new page in Notion (or use an existing one)
2. Type `/database` and select **"Table - Inline"**
3. Name it: "Email Drafts" (or whatever you want)
4. Add these properties (click the `+` button):

   - **Name** (Title) - Already exists
   - **Status** (Select) - Options: `Draft`, `Sent`, `Cancelled`
   - **Mode** (Select) - Options: `existing_myca_member`, `new_myca_member`, `event_outreach`, `person_of_interest`, `brand_of_interest`
   - **Tag** (Select) - Options: `MYCA-EXISTING`, `MYCA-NEW`, `EVENT`, `POI`, `BRAND`, `UNVERIFIED`
   - **Recipient** (Text) - The email address
   - **Date** (Date) - When the draft was created

## Step 3: Share Database with Integration

1. Click the **"..."** menu in the top right of your database
2. Click **"Connections"**
3. Search for **"Myca Email Agent"** (your integration)
4. Click it to connect

## Step 4: Get Database ID

1. Open your database page
2. Look at the URL: `https://www.notion.so/your-workspace/DATABASE_ID?v=...`
3. The **DATABASE_ID** is the long string between the last `/` and the `?`
4. It looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
5. **Copy this ID**

## Step 5: Add to Environment Variables

Add to your `.env.local`:

```bash
NOTION_API_KEY=secret_your_integration_token_from_step_1
NOTION_DATABASE_ID=your_database_id_from_step_4
```

## Step 6: Restart Your App

```bash
npm run dev
```

## What Gets Logged

Each email draft will create a page in your Notion database with:

- **Original request** (what you typed)
- **Email draft** (subject, body, recipient)
- **Selected person** (if lookup was used)
- **Questions asked** (if any)
- **Answers given** (if any)
- **Metadata** (mode, tag, date, status)

## Optional: Customize Properties

You can add more properties to your Notion database:

- **Company** (Text)
- **Event Date** (Date)
- **Follow-up Needed** (Checkbox)
- **Response Received** (Checkbox)
- **Notes** (Text)

The integration will still work - it just won't populate those fields automatically.

## Troubleshooting

**"Notion logging error" in console**
- Check your API key is correct
- Verify database is shared with integration
- Make sure database ID is correct

**Drafts not appearing in Notion**
- Check browser console for errors
- Verify environment variables are set
- Make sure integration has write access

**Properties don't match**
- The property names must match exactly:
  - `Name` (Title)
  - `Status` (Select)
  - `Mode` (Select)
  - `Tag` (Select)
  - `Recipient` (Text)
  - `Date` (Date)

If you use different names, update `lib/notion.ts` to match your property names.



