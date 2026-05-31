import { InvoiceItem, GstSummaryItem } from "@/types/invoice.types";

export function calculateInvoiceItem(
  item: Pick<InvoiceItem, "quantity" | "rate" | "gstRate">,
) {
  const taxableAmount = item.quantity * item.rate;
  const gstAmount = (taxableAmount * item.gstRate) / 100;
  const cgstAmount = gstAmount / 2;
  const sgstAmount = gstAmount / 2;
  const totalAmount = taxableAmount + gstAmount;
  return {
    taxableAmount,
    gstAmount,
    cgstAmount,
    sgstAmount,
    totalAmount,
  };
}

export function calculateInvoiceTotals(items: InvoiceItem[]) {
  // Calculate overall totals
  const totals = items.reduce(
    (acc, item) => {
      acc.subtotal += item.taxableAmount;
      acc.totalCGST += item.cgstAmount;
      acc.totalSGST += item.sgstAmount;
      acc.totalGST += item.gstAmount;
      acc.grandTotal += item.totalAmount;
      acc.totalItems += item.quantity;
      return acc;
    },
    {
      subtotal: 0,
      totalCGST: 0,
      totalSGST: 0,
      totalGST: 0,
      grandTotal: 0,
      totalItems: 0,
    },
  );

  // Build GST slab-wise summary grouped by gstRate
  const gstSlabMap = new Map<number, GstSummaryItem>();

  items.forEach((item) => {
    const rate = item.gstRate;
    if (gstSlabMap.has(rate)) {
      const existing = gstSlabMap.get(rate)!;
      existing.taxableAmount += item.taxableAmount;
      existing.cgstAmount += item.cgstAmount;
      existing.sgstAmount += item.sgstAmount;
      existing.gstAmount += item.gstAmount;
      existing.totalAmount += item.totalAmount;
    } else {
      gstSlabMap.set(rate, {
        gstRate: rate,
        taxableAmount: item.taxableAmount,
        cgstAmount: item.cgstAmount,
        sgstAmount: item.sgstAmount,
        gstAmount: item.gstAmount,
        totalAmount: item.totalAmount,
      });
    }
  });

  // Convert map to sorted array by gstRate ascending
  const gstSummary = Array.from(gstSlabMap.values()).sort(
    (a, b) => a.gstRate - b.gstRate,
  );

  return {
    ...totals,
    roundUp: Math.max(0, Math.ceil(totals.grandTotal) - totals.grandTotal),
    roundedGrandTotal: Math.ceil(totals.grandTotal),
    gstSummary,
  };
}
