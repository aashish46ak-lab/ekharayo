
DROP POLICY "notifications insert any auth" ON public.notifications;
CREATE POLICY "notifications admin insert" ON public.notifications FOR INSERT TO authenticated WITH CHECK (public.is_admin());
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_new_order() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_new_customer() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_low_stock() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
