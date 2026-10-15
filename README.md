# HUMS Student Portal

## Shared Supabase database and sign-in

Student accounts and school records are stored in Supabase so a student can
sign in from another device with their student ID and password. Student
passwords are handled by Supabase Auth; they are not stored in `portal_records`.
The browser uses only the Supabase project URL and publishable/anon key. Never
put a Supabase service-role key in the frontend or in a `VITE_` environment
variable.

### One-time Supabase setup

1. Create a Supabase project, then apply
   `supabase/migrations/20261015000000_shared_portal_database.sql` using the
   Supabase CLI (`supabase link`, then `supabase db push`) or the SQL Editor.
2. Create the administrator account in **Authentication → Users**. Record its
   email and set a strong password.
3. Grant that account the portal-admin role in the SQL Editor, replacing the
   email with the administrator's actual email:

   ```sql
   insert into public.portal_admins (user_id, username)
   select id, 'admin'
   from auth.users
   where email = 'admin@example.com'
   on conflict (user_id) do update set username = excluded.username;
   ```

4. Deploy the student-account Edge Function. The function uses the server-only
   service-role key to provision Auth users; keep that key in Supabase secrets:

   ```powershell
   supabase functions deploy create-student
   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
   ```

5. Copy `.env.example` to `.env.local` and fill in the Supabase project URL,
   publishable/anon key, and administrator email. Set the same `VITE_` values
   in the hosting provider's environment settings, then rebuild and redeploy.
6. Disable public sign-ups in Supabase Auth. Administrators create students
   from the portal; each student must be given their ID and initial password.

On the first administrator sign-in, if the database is empty and this browser
has existing records, the portal imports them. Existing student
passwords must be at least eight characters so Supabase Auth can create their
accounts. If the original records are on another device, sign in to the admin
portal from that device before starting the first import.

The administrator signs in with username `admin` and the password set for the
Supabase Auth user. The old browser-only `admin` / `admin123` login is no longer
used. Admin changes to school records are written to Supabase, and the portal
refreshes shared records when a signed-in page regains focus.

### Development

```powershell
npm install
npm run dev
npm run lint
npm run build
```

Without Supabase environment values and the database migration, cloud sign-in
is intentionally unavailable rather than falling back to device-local
credentials.
