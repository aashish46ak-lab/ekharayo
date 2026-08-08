-- eKharayo bootstrap — EMPTY Supabase only
-- Prefer running each file in supabase/migrations/ in filename order.
-- This file only creates the public media bucket.

INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;
