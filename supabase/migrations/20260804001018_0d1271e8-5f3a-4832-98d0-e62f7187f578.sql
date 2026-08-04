INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'super_admin' FROM auth.users u
WHERE lower(u.email) IN ('aashish46ak@gmail.com','ghagro2080@gmail.com')
ON CONFLICT DO NOTHING;

DELETE FROM public.user_roles r
USING auth.users u
WHERE u.id = r.user_id
  AND lower(u.email) IN ('aashish46ak@gmail.com','ghagro2080@gmail.com')
  AND r.role = 'admin';