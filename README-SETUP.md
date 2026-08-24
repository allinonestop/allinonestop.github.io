# AllInOneStop — Supabase + Google Drive

This version changes the backend architecture to:

- **Supabase:** retailer accounts, authentication, services, customer/application data, payment data, status, remarks and document metadata.
- **Google Drive:** **documents only**. Each application gets its own Drive folder.
- **GitHub Pages:** frontend only.
- **Supabase Edge Functions:** secure retailer creation, application submission + Drive upload orchestration, and public TR tracking.

Your uploaded UI is kept as the base for `index.html`, `retailer.html`, `admin.html`, and `tracking.html`.

## 1. Supabase SQL

Open Supabase → SQL Editor and run:

`supabase/schema.sql`

Then create the first admin in Supabase Auth:

1. Authentication → Users → Add user.
2. Create the admin email/password.
3. Copy the user's UUID.
4. Run:

```sql
insert into public.profiles(id, full_name, role)
values ('YOUR_AUTH_USER_UUID', 'Admin', 'admin');
```

## 2. Services

The old service list/amounts are not present in the files you supplied. Therefore this package does **not invent service prices**.

Add your real services to `public.services`.

Example:

```sql
insert into public.services
(id, name, amount, without_ration_amount, fields)
values
(
  'ration_card',
  'Ration Card Service',
  100,
  150,
  '["ration_pdf","aadhaar_pdf","photo","signature"]'::jsonb
);
```

You can add as many services as required. The retailer page reads services directly from Supabase.

## 3. Google Drive

Create one main Drive folder, for example:

`AllInOneStop Documents`

Copy its Folder ID from the Drive URL.

Open Google Apps Script and create a project. Paste:

`google-drive/Code.gs`

In Script Properties add:

- `DRIVE_ROOT_FOLDER_ID` = your Drive folder ID
- `DRIVE_UPLOAD_TOKEN` = a long random secret

Do **not** put this token in GitHub or in frontend JavaScript.

Deploy → New deployment → Web app:

- Execute as: **Me**
- Who has access: **Anyone**

Copy the deployed Web App URL.

## 4. Supabase Edge Functions

Deploy these three functions:

- `admin-create-retailer`
- `submit-application`
- `track-application`

Using Supabase CLI:

```bash
supabase functions deploy admin-create-retailer
supabase functions deploy submit-application
supabase functions deploy track-application --no-verify-jwt
```

Set these function secrets:

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
supabase secrets set GOOGLE_DRIVE_WEBAPP_URL="YOUR_APPS_SCRIPT_WEB_APP_URL"
supabase secrets set GOOGLE_DRIVE_TOKEN="SAME_TOKEN_AS_APPS_SCRIPT"
```

Never put `SUPABASE_SERVICE_ROLE_KEY` in HTML, GitHub, or `config.js`.

## 5. Frontend configuration

`config.js` contains only:

- Supabase project URL
- Supabase publishable key

These are browser-safe when RLS is correctly configured.

If you change Supabase project/key, edit only:

`config.js`

## 6. Retailer login

The retailer ID remains like:

`RET-K4CFYQ`

The system creates an internal Supabase Auth email:

`ret-k4cfyq@retailer.allinonestop.local`

The retailer still enters only:

- Retailer ID
- Password

The internal email is never shown as the login credential.

## 7. Application submission flow

1. Retailer logs in with Supabase Auth.
2. Retailer selects a service from Supabase.
3. Customer/application fields are sent to `submit-application`.
4. Application row is created in Supabase.
5. Documents are sent to Google Drive.
6. A folder is created:

`TR-YYYYMMDD-XXXXXX-XXXXXX - Applicant Name`

7. File metadata + Drive folder URL are saved back in Supabase.
8. Retailer receives the TR Number.

So **customer/payment/application data is not stored in Google Drive**.

## 8. Tracking

`tracking.html` calls the `track-application` Edge Function.

It returns only the tracking fields required by the page, and the customer mobile number is masked.

## 9. GitHub Pages

Upload these files:

- `index.html`
- `retailer.html`
- `admin.html`
- `tracking.html`
- `config.js`

Do not upload:

- service-role keys
- Drive upload token
- Supabase secrets
- Google credentials

## Important

The files you supplied contain the old Google Apps Script API URL and an older database schema. This package removes that API dependency from the retailer/tracking frontend and moves the application database to Supabase.

The only remaining Google backend is the small Drive-only Apps Script used for document files.
