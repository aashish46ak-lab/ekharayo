-- Gallery images (admin managed)
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.gallery_images TO anon, authenticated;
GRANT ALL ON public.gallery_images TO authenticated, service_role;

DROP POLICY IF EXISTS "gallery public read" ON public.gallery_images;
CREATE POLICY "gallery public read" ON public.gallery_images FOR SELECT USING (is_active = true OR public.is_admin());
DROP POLICY IF EXISTS "gallery admin write" ON public.gallery_images;
CREATE POLICY "gallery admin write" ON public.gallery_images FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Live chat
CREATE TABLE IF NOT EXISTS public.chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_name TEXT,
  guest_email TEXT,
  guest_phone TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.chat_threads TO anon, authenticated;
GRANT ALL ON public.chat_threads TO service_role;

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('customer', 'admin')),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON public.chat_messages TO anon, authenticated;
GRANT ALL ON public.chat_messages TO service_role;

DROP POLICY IF EXISTS "threads read" ON public.chat_threads;
CREATE POLICY "threads read" ON public.chat_threads FOR SELECT USING (
  public.is_admin() OR (user_id IS NOT NULL AND user_id = auth.uid()) OR true
);
DROP POLICY IF EXISTS "threads insert" ON public.chat_threads;
CREATE POLICY "threads insert" ON public.chat_threads FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "threads update" ON public.chat_threads;
CREATE POLICY "threads update" ON public.chat_threads FOR UPDATE USING (public.is_admin() OR (user_id IS NOT NULL AND user_id = auth.uid()));

DROP POLICY IF EXISTS "messages read" ON public.chat_messages;
CREATE POLICY "messages read" ON public.chat_messages FOR SELECT USING (true);
DROP POLICY IF EXISTS "messages insert" ON public.chat_messages;
CREATE POLICY "messages insert" ON public.chat_messages FOR INSERT WITH CHECK (true);
