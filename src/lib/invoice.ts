import { jsPDF } from "jspdf";

export interface InvoiceOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email?: string | null;
  customer_phone: string;
  address_line?: string | null;
  city?: string | null;
  province?: string | null;
  district?: string | null;
  municipality?: string | null;
  ward?: string | null;
  postal_code?: string | null;
  payment_method: string;
  payment_status?: string | null;
  delivery_method?: string | null;
  status: string;
  subtotal: number;
  delivery_fee?: number | null;
  shipping_charge?: number | null;
  tax?: number | null;
  discount?: number | null;
  total: number;
  created_at: string;
}

export interface InvoiceItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface InvoiceCompany {
  name?: string;
  logo_url?: string | null;
  phone1?: string | null;
  phone2?: string | null;
  email?: string | null;
  address?: string | null;
}

const EMERALD: [number, number, number] = [16, 185, 129];
const DARK: [number, number, number] = [20, 20, 20];
const GRAY: [number, number, number] = [110, 110, 110];

function paymentMethodLabel(method: string) {
  const map: Record<string, string> = {
    cod: "Cash on Delivery",
    esewa: "eSewa",
    khalti: "Khalti",
    fonepay: "Fonepay",
    imepay: "IME Pay",
  };
  return map[method] ?? method;
}

async function loadLogoDataUrl(url?: string | null): Promise<string | null> {
  if (!url) return null;
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    const loaded = await new Promise<HTMLImageElement | null>((resolve) => {
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = url;
      setTimeout(() => resolve(null), 4000);
    });
    if (!loaded) return null;
    const canvas = document.createElement("canvas");
    canvas.width = loaded.naturalWidth || 200;
    canvas.height = loaded.naturalHeight || 200;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(loaded, 0, 0);
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

export async function generateInvoicePdf(order: InvoiceOrder, items: InvoiceItem[], company: InvoiceCompany) {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let y = 18;

  const companyName = company.name || "eKharayo — Great Sagarmatha Trade Pvt. Ltd.";
  const logoDataUrl = await loadLogoDataUrl(company.logo_url);

  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, "PNG", margin, y - 4, 18, 18);
    } catch {
      // ignore logo failure
    }
  }

  const textX = logoDataUrl ? margin + 22 : margin;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...DARK);
  doc.text(companyName, textX, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  y += 6;
  const contactLines = [company.address, [company.phone1, company.phone2].filter(Boolean).join(" / "), company.email]
    .filter(Boolean) as string[];
  contactLines.forEach((line) => {
    doc.text(line, textX, y);
    y += 4.5;
  });

  y = Math.max(y, 32);
  doc.setDrawColor(...EMERALD);
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...EMERALD);
  doc.text("INVOICE", margin, y);

  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.text(`Order #: ${order.order_number}`, pageWidth - margin, y - 6, { align: "right" });
  doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, pageWidth - margin, y, { align: "right" });
  doc.text(`Status: ${order.status.toUpperCase()}`, pageWidth - margin, y + 6, { align: "right" });

  y += 16;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Bill To", margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...GRAY);
  doc.text(order.customer_name, margin, y);
  y += 5;
  const contactBits = [order.customer_phone, order.customer_email].filter(Boolean).join(" | ");
  if (contactBits) {
    doc.text(contactBits, margin, y);
    y += 5;
  }
  const addressParts = [
    order.address_line,
    order.ward ? `Ward ${order.ward}` : "",
    order.municipality,
    order.district,
    order.province,
    order.city,
    order.postal_code,
  ].filter(Boolean);
  if (addressParts.length) {
    const addrText = doc.splitTextToSize(addressParts.join(", "), pageWidth - margin * 2);
    doc.text(addrText, margin, y);
    y += addrText.length * 5;
  }

  y += 6;

  const colX = { idx: margin, item: margin + 12, qty: pageWidth - margin - 55, unit: pageWidth - margin - 38, amount: pageWidth - margin };
  doc.setFillColor(...EMERALD);
  doc.rect(margin, y, pageWidth - margin * 2, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("#", colX.idx + 2, y + 5.5);
  doc.text("Item", colX.item, y + 5.5);
  doc.text("Qty", colX.qty, y + 5.5, { align: "right" });
  doc.text("Unit", colX.unit, y + 5.5, { align: "right" });
  doc.text("Amount", colX.amount, y + 5.5, { align: "right" });
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...DARK);
  items.forEach((it, i) => {
    const rowH = 8;
    if (i % 2 === 0) {
      doc.setFillColor(245, 247, 246);
      doc.rect(margin, y, pageWidth - margin * 2, rowH, "F");
    }
    doc.setFontSize(9);
    doc.text(String(i + 1), colX.idx + 2, y + 5.5);
    const nameLines = doc.splitTextToSize(it.product_name, colX.qty - colX.item - 5);
    doc.text(nameLines[0] ?? "", colX.item, y + 5.5);
    doc.text(String(it.quantity), colX.qty, y + 5.5, { align: "right" });
    doc.text(`Rs. ${Number(it.unit_price).toFixed(2)}`, colX.unit, y + 5.5, { align: "right" });
    doc.text(`Rs. ${Number(it.line_total).toFixed(2)}`, colX.amount, y + 5.5, { align: "right" });
    y += rowH;
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
  });

  y += 8;
  const totalsX = pageWidth - margin;
  const labelX = pageWidth - margin - 60;
  const totalRows: [string, number][] = [
    ["Subtotal", Number(order.subtotal || 0)],
    ["Delivery", Number(order.delivery_fee || 0)],
    ["Shipping", Number(order.shipping_charge || 0)],
    ["Tax", Number(order.tax || 0)],
    ["Discount", -Number(order.discount || 0)],
  ];
  doc.setFontSize(9.5);
  totalRows.forEach(([label, val]) => {
    doc.setTextColor(...GRAY);
    doc.text(label, labelX, y);
    doc.setTextColor(...DARK);
    doc.text(`Rs. ${val.toFixed(2)}`, totalsX, y, { align: "right" });
    y += 6;
  });
  doc.setDrawColor(...EMERALD);
  doc.line(labelX, y, totalsX, y);
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...EMERALD);
  doc.text("Grand Total", labelX, y);
  doc.text(`Rs. ${Number(order.total).toFixed(2)}`, totalsX, y, { align: "right" });

  y += 12;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...DARK);
  doc.text(`Payment method: ${paymentMethodLabel(order.payment_method)}`, margin, y);
  y += 5.5;
  doc.text(`Payment status: ${(order.payment_status ?? "pending").toUpperCase()}`, margin, y);

  const footerY = 285;
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, footerY - 8, pageWidth - margin, footerY - 8);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...EMERALD);
  doc.text("Thank you for shopping with eKharayo", pageWidth / 2, footerY - 2, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text(contactLines.join("  |  "), pageWidth / 2, footerY + 3, { align: "center" });

  doc.save(`invoice-${order.order_number}.pdf`);
}
