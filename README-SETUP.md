# AllInOneStop real backend setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in SQL Editor.
3. Create the first admin user in Supabase Auth (email/password), then insert that user's UUID into `public.profiles` with role `admin`.
4. Put your Supabase project URL and Publishable key into the `config_js` block in `retailer.html`, `admin.html`, and `tracking.html`.
5. Deploy the two Edge Functions in `supabase/functions/`.
6. Add these Supabase Function secrets:
   - `SUPABASE_SERVICE_ROLE_KEY` (or adapt the function to the current Supabase secret-key mechanism)
   - `RESEND_API_KEY`
   - `MAIL_FROM`
   - `RETAILER_LOGIN_URL=https://YOUR-GITHUB-USER.github.io/YOUR-REPO/retailer.html`
7. Do not commit any secret key to GitHub. Supabase documents publishable keys as browser-safe when RLS is enabled, while secret/service-role keys must stay server-side.
8. Upload `index.html`, `retailer.html`, `admin.html`, and `tracking.html` to GitHub Pages.

Tracking uses the `track-application` Edge Function, so the applications table does not need a public read policy. Mobile numbers are masked in tracking. Deploy all three Edge Functions.
