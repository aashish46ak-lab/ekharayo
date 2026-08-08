# eKharayo — Supabase setup

## SQL (empty project) — 13 Raw links, order ma Run

Supabase → SQL Editor → each link open → copy all → Run

0. https://raw.githubusercontent.com/aashish46ak-lab/ekharayo/main/supabase/bootstrap_part1.sql

1. https://raw.githubusercontent.com/aashish46ak-lab/ekharayo/main/supabase/migrations/20260803130915_29602464-3701-49ca-a729-8c9807f01b63.sql

2. https://raw.githubusercontent.com/aashish46ak-lab/ekharayo/main/supabase/migrations/20260803130945_6a946f10-f33c-44e8-bec3-983473ba3ea8.sql

3. https://raw.githubusercontent.com/aashish46ak-lab/ekharayo/main/supabase/migrations/20260803131033_61c5325c-f764-418e-a950-162cd0aa6cd4.sql

4. https://raw.githubusercontent.com/aashish46ak-lab/ekharayo/main/supabase/migrations/20260803131109_90e37bdd-a44e-4d06-9207-2ca1a1f5dda7.sql

5. https://raw.githubusercontent.com/aashish46ak-lab/ekharayo/main/supabase/migrations/20260804000820_cfdd9535-4b02-42b3-8ae0-3675f130b900.sql

6. https://raw.githubusercontent.com/aashish46ak-lab/ekharayo/main/supabase/migrations/20260804000954_1bdfd785-c7fa-479a-91a0-d2096467ed08.sql

7. https://raw.githubusercontent.com/aashish46ak-lab/ekharayo/main/supabase/migrations/20260804001018_0d1271e8-5f3a-4832-98d0-e62f7187f578.sql

8. https://raw.githubusercontent.com/aashish46ak-lab/ekharayo/main/supabase/migrations/20260805024153_d815a5f2-6aa2-482a-88bb-5be46bf47481.sql

9. https://raw.githubusercontent.com/aashish46ak-lab/ekharayo/main/supabase/migrations/20260807030415_f02c8e73-3718-4c49-95a6-98fa639533f5.sql

10. https://raw.githubusercontent.com/aashish46ak-lab/ekharayo/main/supabase/migrations/20260807160000_reviews_delivery_notifications.sql

11. https://raw.githubusercontent.com/aashish46ak-lab/ekharayo/main/supabase/migrations/20260807170000_gallery_chat.sql

12. https://raw.githubusercontent.com/aashish46ak-lab/ekharayo/main/supabase/migrations/20260807180000_site_reviews.sql

### Seed (last)

```sql
INSERT INTO public.site_settings (key, value) VALUES
('delivery_zones', '{"hq":{"name":"Itahari-20, Sunsari","lat":26.755,"lng":87.28},"base_fee":50,"free_above":3000,"max_fee":350,"tiers":[{"max_km":10,"fee":50},{"max_km":25,"fee":100},{"max_km":50,"fee":150},{"max_km":100,"fee":250},{"max_km":150,"fee":300},{"max_km":9999,"fee":350}]}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO public.site_settings (key, value)
VALUES ('copy', '{"en":{},"ne":{}}'::jsonb)
ON CONFLICT (key) DO NOTHING;
```

## Vercel env

```
VITE_SUPABASE_URL=https://YOUR_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

Redeploy.

## Admin

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin' FROM auth.users WHERE email = 'YOUR@EMAIL.com'
ON CONFLICT DO NOTHING;
```
