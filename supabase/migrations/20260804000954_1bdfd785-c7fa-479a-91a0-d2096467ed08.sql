-- 1. Column additions first (functions below reference them)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banned boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS sku text,
  ADD COLUMN IF NOT EXISTS barcode text,
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_new boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_bestseller boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS weight text,
  ADD COLUMN IF NOT EXISTS dimensions text,
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS low_stock_threshold integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS views integer NOT NULL DEFAULT 0;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS province text,
  ADD COLUMN IF NOT EXISTS municipality text,
  ADD COLUMN IF NOT EXISTS ward text,
  ADD COLUMN IF NOT EXISTS postal_code text,
  ADD COLUMN IF NOT EXISTS alt_phone text,
  ADD COLUMN IF NOT EXISTS delivery_method text NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS shipping_charge numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tax numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS coupon_code text,
  ADD COLUMN IF NOT EXISTS admin_notes text;

ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS user_id uuid;

-- 2. New tables
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  type text NOT NULL DEFAULT 'percentage' CHECK (type IN ('percentage','fixed','free_shipping')),
  value numeric NOT NULL DEFAULT 0,
  min_order numeric NOT NULL DEFAULT 0,
  usage_limit integer,
  used_count integer NOT NULL DEFAULT 0,
  expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coupons TO authenticated;
GRANT ALL ON public.coupons TO service_role;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "signed in users can validate coupons" ON public.coupons FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage coupons" ON public.coupons FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  image_url text,
  is_approved boolean NOT NULL DEFAULT false,
  admin_reply text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, user_id)
);
CREATE INDEX IF NOT EXISTS reviews_product_idx ON public.reviews (product_id);
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);
GRANT SELECT, INSERT, DELETE ON public.wishlist TO authenticated;
GRANT ALL ON public.wishlist TO service_role;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customers manage own wishlist" ON public.wishlist FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT 'Home',
  full_name text,
  phone text,
  province text,
  district text,
  municipality text,
  ward text,
  address_line text,
  city text,
  postal_code text,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.addresses TO authenticated;
GRANT ALL ON public.addresses TO service_role;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customers manage own addresses" ON public.addresses FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.stock_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  change integer NOT NULL,
  reason text NOT NULL DEFAULT 'manual',
  note text,
  admin_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.stock_logs TO authenticated;
GRANT ALL ON public.stock_logs TO service_role;
ALTER TABLE public.stock_logs ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.admin_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid,
  action text NOT NULL,
  detail text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.admin_activity TO authenticated;
GRANT ALL ON public.admin_activity TO service_role;
ALTER TABLE public.admin_activity ENABLE ROW LEVEL SECURITY;

-- 3. Functions (after all columns exist)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('super_admin','admin','manager','staff'))
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
$$;

CREATE OR REPLACE FUNCTION public.is_banned()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT banned FROM public.profiles WHERE id = auth.uid()), false)
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name',''), NEW.raw_user_meta_data->>'phone')
  ON CONFLICT (id) DO NOTHING;
  IF lower(NEW.email) IN ('aashish46ak@gmail.com','ghagro2080@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'super_admin') ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.protect_super_admins()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE em text;
BEGIN
  SELECT lower(email) INTO em FROM auth.users WHERE id = COALESCE(OLD.user_id, NEW.user_id);
  IF em IN ('aashish46ak@gmail.com','ghagro2080@gmail.com') THEN
    IF TG_OP = 'DELETE' AND OLD.role = 'super_admin' THEN
      RAISE EXCEPTION 'Permanent super admin cannot be removed';
    END IF;
    IF TG_OP = 'UPDATE' AND OLD.role = 'super_admin' AND NEW.role <> 'super_admin' THEN
      RAISE EXCEPTION 'Permanent super admin cannot be demoted';
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.redeem_coupon(_code text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.coupons SET used_count = used_count + 1 WHERE code = upper(_code) AND is_active;
END;
$$;
GRANT EXECUTE ON FUNCTION public.redeem_coupon(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.decrement_stock()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.products SET stock = GREATEST(stock - NEW.quantity, 0) WHERE id = NEW.product_id;
  INSERT INTO public.stock_logs (product_id, change, reason) VALUES (NEW.product_id, -NEW.quantity, 'order');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_order_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status AND NEW.user_id IS NOT NULL THEN
    INSERT INTO public.notifications (title, message, type, link, user_id)
    VALUES ('Order ' || NEW.order_number || ' updated', 'Your order status is now: ' || NEW.status, 'order', '/account', NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_new_review()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications (title, message, type, link)
  VALUES ('New review', 'A customer left a ' || NEW.rating || '-star review awaiting approval.', 'review', '/admin/reviews');
  RETURN NEW;
END;
$$;

-- 4. Policies (after functions)
GRANT INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
CREATE POLICY "super admins manage roles" ON public.user_roles FOR ALL TO authenticated
  USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

CREATE POLICY "admins can update profiles" ON public.profiles FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "orders own insert" ON public.orders;
CREATE POLICY "orders own insert" ON public.orders FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND NOT public.is_banned());

CREATE POLICY "public reads approved reviews" ON public.reviews FOR SELECT
  USING (is_approved OR user_id = auth.uid() OR public.is_admin());
CREATE POLICY "customers add own reviews" ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "admins moderate reviews" ON public.reviews FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "users delete own or admin deletes" ON public.reviews FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "admins view addresses" ON public.addresses FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY "admins read stock logs" ON public.stock_logs FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "admins add stock logs" ON public.stock_logs FOR INSERT TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "admins read activity" ON public.admin_activity FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "admins log activity" ON public.admin_activity FOR INSERT TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "users read own notifications" ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "users update own notifications" ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 5. Triggers
DROP TRIGGER IF EXISTS protect_super_admin_roles ON public.user_roles;
CREATE TRIGGER protect_super_admin_roles BEFORE UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.protect_super_admins();

DROP TRIGGER IF EXISTS trg_decrement_stock ON public.order_items;
CREATE TRIGGER trg_decrement_stock AFTER INSERT ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.decrement_stock();

DROP TRIGGER IF EXISTS trg_notify_order_status ON public.orders;
CREATE TRIGGER trg_notify_order_status AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.notify_order_status();

DROP TRIGGER IF EXISTS trg_notify_new_review ON public.reviews;
CREATE TRIGGER trg_notify_new_review AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_review();

-- 6. Data updates
UPDATE public.site_settings
SET value = replace(value::text, 'Great Sagarmatha Traders PVT LTD', 'Great Sagarmatha Trade Pvt. Ltd.')::jsonb
WHERE value::text LIKE '%Great Sagarmatha Traders%';

INSERT INTO public.site_settings (key, value) VALUES
 ('owner', '{"name":"Founder","position":"Founder & CEO","company":"Great Sagarmatha Trade Pvt. Ltd.","bio":"","phone1":"9852049458","phone2":"9802749458","email":"ghagro2080@gmail.com","address":"Patharishanishchare-5, Morang, Nepal","map_url":"","photo_url":"","cover_url":"","welcome":"","facebook":"","instagram":"","tiktok":"","website":""}'::jsonb),
 ('announcement', '{"text":"","is_active":false}'::jsonb),
 ('payments', '{"cod":true,"esewa":false,"khalti":false,"fonepay":false,"imepay":false}'::jsonb)
ON CONFLICT (key) DO NOTHING;