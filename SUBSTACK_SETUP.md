# Substack Integration Setup

## How to Get Your Substack API Key

Substack doesn't have a traditional "API key" in their dashboard. You need to:

### Option 1: Use Substack's API (Requires Access)

1. Go to your Substack publication
2. Go to **Settings** → **API** (if available)
3. Generate an API key

**Note**: Substack's public API is limited. Most publications don't have direct API access.

### Option 2: Use Substack's Web Interface (Recommended)

Since Substack's API access is limited, I've built the integration to work with their API, but you may need to:

1. **Get your Publication ID**:
   - Go to your Substack publication
   - Look at the URL: `https://yourname.substack.com`
   - The publication ID is usually in the settings or can be found via their API

2. **Get API Access**:
   - Contact Substack support to request API access
   - Or use their web interface to manually create drafts

### Option 3: Alternative - Export and Import

If API access isn't available, we can:
1. Generate the post content
2. Copy it to clipboard
3. You paste it into Substack manually

## Current Implementation

The app is set up to:
- Draft posts using Claude
- Create drafts via Substack API (if you have access)
- Show preview before creating

## If You Don't Have API Access

I can modify the flow to:
1. Generate the post
2. Show preview
3. Provide "Copy to Clipboard" button
4. You paste into Substack manually

Would you like me to add that fallback option?

## Testing

Once you have your API key and publication ID:
1. Enter them in the Substack tab
2. Write an idea
3. Click "Draft Substack Post"
4. Review the preview
5. Click "Create Substack Draft"

The draft will appear in your Substack dashboard.


