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

## Quick checklist

- [ ] All env vars from README added in Vercel (Settings → Environment Variables)
- [ ] `NEXT_PUBLIC_APP_URL` = your Vercel URL (e.g. `https://myca-email-agent.vercel.app`)
- [ ] Google Cloud OAuth redirect URI includes `https://YOUR_VERCEL_DOMAIN/api/auth/google/callback`
- [ ] Redeploy after changing env vars
