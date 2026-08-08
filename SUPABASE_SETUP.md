# eKharayo — Supabase (naya project) setup

Repo already has full app code. You only need **database schema** on your new Supabase + **env** on Vercel.

## Step 1 — SQL (empty project)

Supabase Dashboard → **SQL Editor** → New query

### Easiest (2 runs)

1. Open and copy-paste **Run**:
   - [`supabase/bootstrap_part1.sql`](./supabase/bootstrap_part1.sql)
2. New query → copy-paste **Run**:
   - [`supabase/bootstrap_part2.sql`](./supabase/bootstrap_part2.sql)

### Alternative
Run every file inside `supabase/migrations/` **in filename order** (oldest first).

## Step 2 — Storage

Bucket **`media`** (public) should exist. Check **Storage** in Supabase.

## Step 3 — Vercel env

Project → Settings → Environment Variables:

```
VITE_SUPABASE_URL=https://YOUR_REF.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your_anon_key
```

Then **Redeploy**.

## Step 4 — Admin

Sign up once on the live site, then SQL:

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::public.app_role
FROM auth.users
WHERE email = 'YOUR@EMAIL.com'
ON CONFLICT DO NOTHING;
```

Emails `aashish46ak@gmail.com` / `ghagro2080@gmail.com` may get admin automatically via trigger.

## Notes

- This creates **empty structure + sample categories/products**, not Lovable old data.
- Old Lovable products/orders need CSV export/import if you still need them.
- AdSense script is already in `index.html`.
