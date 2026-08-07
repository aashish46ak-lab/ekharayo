import { supabase } from "@/integrations/supabase/client";

export type OrderEvent =
  | "order_placed"
  | "order_confirmed"
  | "order_processing"
  | "order_packed"
  | "order_shipped"
  | "out_for_delivery"
  | "order_delivered"
  | "order_cancelled";

const SUBJECTS: Record<OrderEvent, string> = {
  order_placed: "Order received — eKharayo",
  order_confirmed: "Order confirmed — eKharayo",
  order_processing: "Your order is being prepared",
  order_packed: "Order packed — eKharayo",
  order_shipped: "Order shipped — eKharayo",
  out_for_delivery: "Out for delivery — eKharayo",
  order_delivered: "Delivered — thank you for ordering eKharayo",
  order_cancelled: "Order cancelled — eKharayo",
};

function bodyFor(event: OrderEvent, orderNumber: string, total?: number) {
  const totalLine = total != null ? ` Total: Rs. ${Number(total).toLocaleString("en-IN")}.` : "";
  const map: Record<OrderEvent, string> = {
    order_placed: `We received your order ${orderNumber}.${totalLine} Our team will confirm it shortly.`,
    order_confirmed: `Order ${orderNumber} is confirmed.${totalLine} We will start preparing your items.`,
    order_processing: `Order ${orderNumber} is now being processed at our Morang facility.`,
    order_packed: `Order ${orderNumber} has been packed and is ready for dispatch.`,
    order_shipped: `Order ${orderNumber} is on the way. Track status anytime in My Orders.`,
    out_for_delivery: `Order ${orderNumber} is out for delivery. Please keep your phone reachable.`,
    order_delivered: `Order ${orderNumber} was delivered. Thank you for shopping with eKharayo — Great Sagarmatha Trade Pvt. Ltd.`,
    order_cancelled: `Order ${orderNumber} was cancelled. Contact us if you need help.`,
  };
  return map[event];
}

/** Queue an email/in-app notification row (actual SMTP can be wired via Edge Function + Resend later). */
export async function queueOrderNotification(opts: {
  orderId: string;
  userId?: string | null;
  email?: string | null;
  orderNumber: string;
  event: OrderEvent;
  total?: number;
}) {
  const subject = SUBJECTS[opts.event];
  const body = bodyFor(opts.event, opts.orderNumber, opts.total);
  const { error } = await supabase.from("order_notifications" as never).insert({
    order_id: opts.orderId,
    user_id: opts.userId ?? null,
    email: opts.email ?? null,
    event: opts.event,
    subject,
    body,
    channel: "email",
    status: "queued",
  } as never);
  return { error, subject, body };
}

export const TRACKING_STEPS = [
  { key: "pending", label: "Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "Processing" },
  { key: "packed", label: "Packed" },
  { key: "shipped", label: "Shipped" },
  { key: "out_for_delivery", label: "Out for delivery" },
  { key: "delivered", label: "Delivered" },
] as const;

export function stepIndex(status: string): number {
  if (status === "cancelled") return -1;
  const i = TRACKING_STEPS.findIndex((s) => s.key === status);
  return i >= 0 ? i : 0;
}
