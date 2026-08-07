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

export async function generateInvoiceImage(order: InvoiceOrder, items: InvoiceItem[], company: InvoiceCompany) {
  const width = 1240;
  const rowHeight = 56;
  const height = Math.max(1754, 930 + items.length * rowHeight);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Invoice image is unavailable");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#10b981";
  ctx.fillRect(0, 0, width, 18);
  const logo = await loadLogoDataUrl(company.logo_url);
  if (logo) {
    const image = new Image();
    await new Promise<void>((resolve) => { image.onload = () => resolve(); image.onerror = () => resolve(); image.src = logo; });
    if (image.complete && image.naturalWidth) ctx.drawImage(image, 72, 72, 112, 112);
  }
  const left = logo ? 212 : 72;
  ctx.fillStyle = "#141414";
  ctx.font = "bold 34px Arial";
  ctx.fillText(company.name || "eKharayo — Great Sagarmatha Trade Pvt. Ltd.", left, 104);
  ctx.fillStyle = "#666666";
  ctx.font = "20px Arial";
  [company.address, [company.phone1, company.phone2].filter(Boolean).join(" / "), company.email].filter(Boolean).forEach((line, index) => ctx.fillText(String(line), left, 140 + index * 27));
  ctx.strokeStyle = "#10b981";
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(72, 220); ctx.lineTo(width - 72, 220); ctx.stroke();
  ctx.fillStyle = "#10b981"; ctx.font = "bold 54px Arial"; ctx.fillText("INVOICE", 72, 300);
  ctx.fillStyle = "#141414"; ctx.font = "bold 21px Arial"; ctx.textAlign = "right";
  ctx.fillText(`Invoice: ${order.order_number}`, width - 72, 260);
  ctx.fillText(`Order ID: ${order.id}`, width - 72, 292);
  ctx.fillText(`Date: ${new Date(order.created_at).toLocaleDateString()}`, width - 72, 324);
  ctx.textAlign = "left"; ctx.font = "bold 24px Arial"; ctx.fillText("CUSTOMER", 72, 382);
  ctx.font = "20px Arial"; ctx.fillStyle = "#555555";
  ctx.fillText(order.customer_name, 72, 420);
  ctx.fillText([order.customer_phone, order.customer_email].filter(Boolean).join("  |  "), 72, 450);
  ctx.fillText([order.address_line, order.city, order.district, order.province].filter(Boolean).join(", "), 72, 480);
  let y = 530;
  ctx.fillStyle = "#10b981"; ctx.fillRect(72, y, width - 144, 52);
  ctx.fillStyle = "#ffffff"; ctx.font = "bold 20px Arial";
  ctx.fillText("PRODUCT", 92, y + 34); ctx.textAlign = "center"; ctx.fillText("QTY", 760, y + 34); ctx.fillText("UNIT PRICE", 920, y + 34); ctx.textAlign = "right"; ctx.fillText("AMOUNT", width - 92, y + 34);
  y += 52;
  items.forEach((item, index) => {
    if (index % 2 === 0) { ctx.fillStyle = "#f3f6f4"; ctx.fillRect(72, y, width - 144, rowHeight); }
    ctx.fillStyle = "#222222"; ctx.font = "20px Arial"; ctx.textAlign = "left"; ctx.fillText(item.product_name.slice(0, 48), 92, y + 36);
    ctx.textAlign = "center"; ctx.fillText(String(item.quantity), 760, y + 36); ctx.fillText(`Rs. ${Number(item.unit_price).toFixed(2)}`, 920, y + 36); ctx.textAlign = "right"; ctx.fillText(`Rs. ${Number(item.line_total).toFixed(2)}`, width - 92, y + 36);
    y += rowHeight;
  });
  y += 52; ctx.font = "20px Arial"; ctx.fillStyle = "#555555";
  const totals: [string, number][] = [["Subtotal", Number(order.subtotal)], ["Delivery charge", Number(order.delivery_fee || 0)], ["Tax", Number(order.tax || 0)], ["Discount", -Number(order.discount || 0)]];
  totals.forEach(([label, value]) => { ctx.textAlign = "left"; ctx.fillText(label, 760, y); ctx.textAlign = "right"; ctx.fillStyle = "#222222"; ctx.fillText(`Rs. ${value.toFixed(2)}`, width - 92, y); ctx.fillStyle = "#555555"; y += 40; });
  ctx.strokeStyle = "#10b981"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(760, y - 18); ctx.lineTo(width - 72, y - 18); ctx.stroke();
  ctx.font = "bold 28px Arial"; ctx.fillStyle = "#10b981"; ctx.textAlign = "left"; ctx.fillText("TOTAL", 760, y + 22); ctx.textAlign = "right"; ctx.fillText(`Rs. ${Number(order.total).toFixed(2)}`, width - 92, y + 22);
  y += 100; ctx.textAlign = "left"; ctx.fillStyle = "#222222"; ctx.font = "20px Arial";
  ctx.fillText(`Payment method: ${paymentMethodLabel(order.payment_method)}`, 72, y);
  ctx.fillText(`Payment status: ${(order.payment_status || "pending").toUpperCase()}`, 72, y + 34);
  ctx.fillText(`Order status: ${order.status.replace(/_/g, " ").toUpperCase()}`, 72, y + 68);
  ctx.textAlign = "center"; ctx.fillStyle = "#10b981"; ctx.font = "bold 22px Arial"; ctx.fillText("Thank you for shopping with eKharayo", width / 2, height - 92);
  const link = document.createElement("a");
  link.download = `invoice-${order.order_number}.png`;
  link.href = canvas.toDataURL("image/png", 1);
  link.click();
}
