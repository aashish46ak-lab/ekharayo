-- Public homepage reviews (star + like)
CREATE TABLE IF NOT EXISTS public.site_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  display_name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 3 AND 1000),
  likes_count INT NOT NULL DEFAULT 0,
  is_approved BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.site_review_likes (
  review_id UUID NOT NULL REFERENCES public.site_reviews(id) ON DELETE CASCADE,
  liker_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (review_id, liker_key)
);

ALTER TABLE public.site_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_review_likes ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON public.site_reviews TO anon, authenticated;
GRANT UPDATE ON public.site_reviews TO authenticated, service_role;
GRANT ALL ON public.site_reviews TO service_role;

GRANT SELECT, INSERT ON public.site_review_likes TO anon, authenticated;
GRANT ALL ON public.site_review_likes TO service_role;

DROP POLICY IF EXISTS "site reviews read" ON public.site_reviews;
CREATE POLICY "site reviews read" ON public.site_reviews
  FOR SELECT USING (is_approved = true OR public.is_admin());

DROP POLICY IF EXISTS "site reviews insert" ON public.site_reviews;
CREATE POLICY "site reviews insert" ON public.site_reviews
  FOR INSERT WITH CHECK (char_length(trim(body)) >= 3 AND rating BETWEEN 1 AND 5);

DROP POLICY IF EXISTS "site reviews admin" ON public.site_reviews;
CREATE POLICY "site reviews admin" ON public.site_reviews
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "site review likes read" ON public.site_review_likes;
CREATE POLICY "site review likes read" ON public.site_review_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "site review likes insert" ON public.site_review_likes;
CREATE POLICY "site review likes insert" ON public.site_review_likes FOR INSERT WITH CHECK (true);

-- Atomic like increment
CREATE OR REPLACE FUNCTION public.like_site_review(p_review_id UUID, p_liker_key TEXT)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count INT;
BEGIN
  INSERT INTO public.site_review_likes (review_id, liker_key)
  VALUES (p_review_id, p_liker_key)
  ON CONFLICT DO NOTHING;

  IF FOUND THEN
    UPDATE public.site_reviews
    SET likes_count = likes_count + 1
    WHERE id = p_review_id
    RETURNING likes_count INTO new_count;
  ELSE
    SELECT likes_count INTO new_count FROM public.site_reviews WHERE id = p_review_id;
  END IF;

  RETURN COALESCE(new_count, 0);
END;
$$;

GRANT EXECUTE ON FUNCTION public.like_site_review(UUID, TEXT) TO anon, authenticated;
