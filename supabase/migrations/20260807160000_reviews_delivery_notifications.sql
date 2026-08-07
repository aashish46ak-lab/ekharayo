-- Product reviews
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  body TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, user_id)
);
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.product_reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.product_reviews TO authenticated;
GRANT ALL ON public.product_reviews TO service_role;

DROP POLICY IF EXISTS "reviews public read" ON public.product_reviews;
CREATE POLICY "reviews public read" ON public.product_reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS "reviews own write" ON public.product_reviews;
CREATE POLICY "reviews own write" ON public.product_reviews FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "reviews own update" ON public.product_reviews;
CREATE POLICY "reviews own update" ON public.product_reviews FOR UPDATE TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "reviews own delete" ON public.product_reviews;
CREATE POLICY "reviews own delete" ON public.product_reviews FOR DELETE TO authenticated USING (user_id = auth.uid());

-- In-app + email notification log
CREATE TABLE IF NOT EXISTS public.order_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT,
  event TEXT NOT NULL,
  subject TEXT,
  body TEXT,
  channel TEXT NOT NULL DEFAULT 'email',
  status TEXT NOT NULL DEFAULT 'queued',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.order_notifications ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.order_notifications TO authenticated;
GRANT INSERT ON public.order_notifications TO authenticated;
GRANT ALL ON public.order_notifications TO service_role;

DROP POLICY IF EXISTS "notif own read" ON public.order_notifications;
CREATE POLICY "notif own read" ON public.order_notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS "notif insert auth" ON public.order_notifications;
CREATE POLICY "notif insert auth" ON public.order_notifications FOR INSERT TO authenticated WITH CHECK (true);

-- Delivery settings defaults (Morang HQ) — max delivery Rs. 350
INSERT INTO public.site_settings (key, value) VALUES
(
  'delivery_zones',
  '{
    "hq": {"name": "Patharishanishchare-5, Morang", "lat": 26.6525, "lng": 87.5389},
    "base_fee": 50,
    "free_above": 3000,
    "max_fee": 350,
    "tiers": [
      {"max_km": 10, "fee": 50},
      {"max_km": 25, "fee": 100},
      {"max_km": 50, "fee": 150},
      {"max_km": 100, "fee": 250},
      {"max_km": 150, "fee": 300},
      {"max_km": 9999, "fee": 350}
    ]
  }'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- If delivery_zones already exists, force max_fee 350 and capped tiers
UPDATE public.site_settings
SET value = '{
  "hq": {"name": "Patharishanishchare-5, Morang", "lat": 26.6525, "lng": 87.5389},
  "base_fee": 50,
  "free_above": 3000,
  "max_fee": 350,
  "tiers": [
    {"max_km": 10, "fee": 50},
    {"max_km": 25, "fee": 100},
    {"max_km": 50, "fee": 150},
    {"max_km": 100, "fee": 250},
    {"max_km": 150, "fee": 300},
    {"max_km": 9999, "fee": 350}
  ]
}'::jsonb
WHERE key = 'delivery_zones';
