# Vercel deployment troubleshooting

## If the build fails

1. **Check the build logs** in Vercel: Project → Deployments → click the failed deployment → Building.

2. **Common fixes:**
   - **"Cannot find module"** → Ensure all dependencies are in `dependencies` (not only `devDependencies`) in `package.json`. Things like `zod`, `googleapis`, `@anthropic-ai/sdk` must be in `dependencies`.
   - **TypeScript errors** → Run `npm run build` locally and fix any TS errors; Vercel runs the same build.
   - **Node version** → This project sets `"engines": { "node": ">=18.x" }`. In Vercel: Settings → General → Node.js Version → 18.x (or leave default).
   - **Missing lock file** → If you see install warnings, run `npm install` locally, commit `package-lock.json`, and push so Vercel uses the same versions.

3. **Environment variables at build time:**  
   Only `NEXT_PUBLIC_*` vars are inlined at build. Other env vars are read at runtime. If the build fails on missing env, the error will name the variable.

## If the app deploys but doesn’t work at runtime

- **Gmail connect fails / redirect error** → Add the exact Vercel URL to Google OAuth redirect URIs:  
  `https://YOUR_VERCEL_DOMAIN/api/auth/google/callback`  
  And set `NEXT_PUBLIC_APP_URL` in Vercel to `https://YOUR_VERCEL_DOMAIN` (no trailing slash).
- **500 on API routes** → Check Vercel’s Function logs (Deployments → failed request → Logs). Often a missing or wrong env var (e.g. `ANTHROPIC_API_KEY`, `SUPABASE_URL`).

## Debugging "Connect Gmail" / auth_failed

When you end up at `?error=auth_failed&reason=...` after clicking Connect Gmail, the failure happens in the **OAuth callback** (token exchange, Gmail profile, or Supabase save). To see the real error:

1. **Open Vercel** → your project → **Logs** (top nav, or Deployments → latest → **Logs**).
2. **Trigger the failure**: open your app, click Connect Gmail, complete Google sign-in so you get redirected back with `auth_failed`.
3. **In Logs**, filter or scroll to the time of that request. Look for:
   - **`OAuth callback error:`** – short message we extracted.
   - **`OAuth error full:`** – JSON with `message`, `code`, `status`, and **`data`** (Google or Supabase error body). This is the actual failure reason.
4. **Interpret:**
   - **Missing/wrong credentials** → `message` or `data` will mention invalid_grant, 401, or "missing authentication credential". Fix **GOOGLE_CLIENT_ID** / **GOOGLE_CLIENT_SECRET** in Vercel (must match Google Cloud, no extra spaces).
   - **Supabase** → `data` might show "relation gmail_tokens does not exist" or JWT/RLS errors. Fix table (run `supabase-setup.sql`) or **SUPABASE_URL** / **SUPABASE_SERVICE_ROLE_KEY**.
   - **Gmail API** → e.g. "Request is missing required authentication credential" often means the token exchange failed (wrong client secret) or a scope issue.

After changing env vars or code, **redeploy** and try Connect Gmail again.

## Quick checklist

- [ ] All env vars from README added in Vercel (Settings → Environment Variables)
- [ ] `NEXT_PUBLIC_APP_URL` = your Vercel **production** URL, no trailing slash (e.g. `https://myca-email-agent.vercel.app`)
- [ ] Google Cloud OAuth redirect URI includes **exactly** `https://myca-email-agent.vercel.app/api/auth/google/callback` (must match `NEXT_PUBLIC_APP_URL` + `/api/auth/google/callback`)
- [ ] Redeploy after changing env vars
- [ ] Open the app at that same production URL when connecting Gmail (don’t use preview deployment URLs for OAuth)
