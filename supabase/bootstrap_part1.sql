-- eKharayo bootstrap PART 1 — run on EMPTY Supabase SQL Editor first
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true) ON CONFLICT (id) DO NOTHING;
