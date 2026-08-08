-- Run once on Supabase SQL Editor so super_admin can use admin features / RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $f$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('super_admin', 'admin', 'manager', 'staff')
  );
$f$;

-- Ensure owner email is super_admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'
FROM auth.users
WHERE lower(email) = 'aashish46ak@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
