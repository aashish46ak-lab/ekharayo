import { supabase } from "@/integrations/supabase/client";
import { rs } from "@/lib/media";

export interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: number;
  min_order: number;
  usage_limit: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
}

export async function validateCoupon(code: string, subtotal: number): Promise<{ coupon?: Coupon; error?: string }> {
  const { data } = await supabase.from("coupons").select("*").eq("code", code.trim().toUpperCase()).maybeSingle();
  if (!data) return { error: "Invalid coupon code" };
  const c = data as unknown as Coupon;
  if (!c.is_active) return { error: "This coupon is no longer active" };
  if (c.expires_at && new Date(c.expires_at) < new Date()) return { error: "This coupon has expired" };
  if (c.usage_limit != null && c.used_count >= c.usage_limit) return { error: "This coupon has reached its usage limit" };
  if (subtotal < Number(c.min_order)) return { error: `Minimum order of ${rs(Number(c.min_order))} required for this coupon` };
  return { coupon: c };
}

/** Returns { discount, freeShipping } */
export function couponSavings(coupon: Pick<Coupon, "type" | "value"> | null, subtotal: number) {
  if (!coupon) return { discount: 0, freeShipping: false };
  if (coupon.type === "percentage") return { discount: Math.round((subtotal * Number(coupon.value)) / 100), freeShipping: false };
  if (coupon.type === "fixed") return { discount: Math.min(Number(coupon.value), subtotal), freeShipping: false };
  return { discount: 0, freeShipping: true };
}

export function downloadCSV(filename: string, headers: string[], rows: (string | number | null)[][]) {
  const esc = (v: string | number | null) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
