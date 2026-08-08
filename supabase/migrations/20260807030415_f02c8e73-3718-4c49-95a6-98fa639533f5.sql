-- Drop triggers that depend on orders.status before changing enum type
DROP TRIGGER IF EXISTS trg_sync_cod_payment_status ON public.orders;
DROP TRIGGER IF EXISTS orders_notify ON public.orders;

ALTER TYPE public.order_status RENAME TO order_status_old;

CREATE TYPE public.order_status AS ENUM (
  'pending',
  'confirmed',
  'processing',
  'packed',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'refunded'
);

ALTER TABLE public.orders
  ALTER COLUMN status DROP DEFAULT,
  ALTER COLUMN status TYPE public.order_status
  USING (
    CASE status::text
      WHEN 'completed' THEN 'delivered'
      ELSE status::text
    END
  )::public.order_status,
  ALTER COLUMN status SET DEFAULT 'pending'::public.order_status;

DROP TYPE public.order_status_old;

CREATE OR REPLACE FUNCTION public.sync_cod_payment_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'delivered' AND NEW.payment_method = 'cod' THEN
    NEW.payment_status := 'paid';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sync_cod_payment_status
BEFORE INSERT OR UPDATE OF status, payment_method ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.sync_cod_payment_status();

-- Recreate notify trigger if function exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'notify_new_order'
  ) THEN
    DROP TRIGGER IF EXISTS orders_notify ON public.orders;
    CREATE TRIGGER orders_notify
    AFTER INSERT ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.notify_new_order();
  END IF;
END $$;
