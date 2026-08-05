UPDATE public.orders
SET subtotal = COALESCE(subtotal, 0),
    delivery_fee = COALESCE(delivery_fee, 0),
    shipping_charge = COALESCE(shipping_charge, 0),
    discount = COALESCE(discount, 0),
    tax = COALESCE(tax, 0),
    total = GREATEST(
      COALESCE(subtotal, 0) + COALESCE(delivery_fee, 0) + COALESCE(shipping_charge, 0) + COALESCE(tax, 0) - COALESCE(discount, 0),
      0
    );

ALTER TABLE public.orders
  ALTER COLUMN subtotal SET DEFAULT 0,
  ALTER COLUMN subtotal SET NOT NULL,
  ALTER COLUMN delivery_fee SET DEFAULT 0,
  ALTER COLUMN delivery_fee SET NOT NULL,
  ALTER COLUMN shipping_charge SET DEFAULT 0,
  ALTER COLUMN shipping_charge SET NOT NULL,
  ALTER COLUMN discount SET DEFAULT 0,
  ALTER COLUMN discount SET NOT NULL,
  ALTER COLUMN tax SET DEFAULT 0,
  ALTER COLUMN tax SET NOT NULL,
  ALTER COLUMN total SET DEFAULT 0,
  ALTER COLUMN total SET NOT NULL;

CREATE OR REPLACE FUNCTION public.calculate_order_total()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.subtotal := GREATEST(COALESCE(NEW.subtotal, 0), 0);
  NEW.delivery_fee := GREATEST(COALESCE(NEW.delivery_fee, 0), 0);
  NEW.shipping_charge := GREATEST(COALESCE(NEW.shipping_charge, 0), 0);
  NEW.discount := GREATEST(COALESCE(NEW.discount, 0), 0);
  NEW.tax := GREATEST(COALESCE(NEW.tax, 0), 0);
  NEW.total := GREATEST(
    NEW.subtotal + NEW.delivery_fee + NEW.shipping_charge + NEW.tax - NEW.discount,
    0
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_calculate_total ON public.orders;
CREATE TRIGGER orders_calculate_total
BEFORE INSERT OR UPDATE OF subtotal, delivery_fee, shipping_charge, discount, tax, total
ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.calculate_order_total();