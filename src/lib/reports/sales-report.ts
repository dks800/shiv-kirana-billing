import { Invoice } from "@/types/invoice.types";
import { Product } from "@/types/product.types";
import { toInvoiceDate } from "@/lib/invoice.utils";

export type ReportRangePreset =
  | "today"
  | "week"
  | "month"
  | "year"
  | "custom";

export type ReportDateRange = {
  preset: ReportRangePreset;
  from: Date;
  to: Date;
};

export type ProductSalesRow = {
  productId: string;
  productName: string;
  category: string;
  quantitySold: number;
  revenue: number;
  billCount: number;
  contribution: number;
};

export type CategorySalesRow = {
  category: string;
  quantitySold: number;
  revenue: number;
  contribution: number;
};

export type GstReportRow = {
  gstRate: number;
  taxableValue: number;
  gstCollected: number;
};

export type MonthlySalesRow = {
  month: string;
  totalSales: number;
  billCount: number;
  averageBillValue: number;
};

export type DailySalesRow = {
  day: string;
  date: Date;
  totalSales: number;
  billCount: number;
};

export type WeekdaySalesRow = {
  day: string;
  revenue: number;
  billCount: number;
};

export type BillAnalysis = {
  totalBills: number;
  averageBillValue: number;
  highestBill: number;
  lowestBill: number;
};

export type GrowthComparison = {
  currentRevenue: number;
  previousRevenue: number;
  revenueDifference: number;
  revenueGrowthPercent: number;
  currentBillCount: number;
  previousBillCount: number;
  billCountDifference: number;
};

const monthLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const weekdayLabels = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function getDefaultReportRange(): ReportDateRange {
  const now = new Date();
  return {
    preset: "month",
    from: startOfMonth(now),
    to: endOfDay(now),
  };
}

export function buildReportRange(
  preset: ReportRangePreset,
  customFrom?: string,
  customTo?: string,
): ReportDateRange {
  const now = new Date();

  if (preset === "today") {
    return { preset, from: startOfDay(now), to: endOfDay(now) };
  }

  if (preset === "week") {
    return { preset, from: startOfWeek(now), to: endOfDay(now) };
  }

  if (preset === "year") {
    return { preset, from: startOfYear(now), to: endOfDay(now) };
  }

  if (preset === "custom") {
    return {
      preset,
      from: customFrom ? startOfDay(new Date(customFrom)) : startOfMonth(now),
      to: customTo ? endOfDay(new Date(customTo)) : endOfDay(now),
    };
  }

  return { preset, from: startOfMonth(now), to: endOfDay(now) };
}

export function filterInvoicesByRange(
  invoices: Invoice[],
  range: ReportDateRange,
) {
  return invoices.filter((invoice) => {
    const invoiceDate = toInvoiceDate(invoice.invoiceDate);

    if (!invoiceDate) {
      return false;
    }

    return invoiceDate >= range.from && invoiceDate <= range.to;
  });
}

export function getGstReport(invoices: Invoice[]) {
  const rates = [0, 5, 12, 18, 28];
  const rows = new Map<number, GstReportRow>();

  rates.forEach((gstRate) => {
    rows.set(gstRate, { gstRate, taxableValue: 0, gstCollected: 0 });
  });

  invoices.forEach((invoice) => {
    invoice.items?.forEach((item) => {
      const gstRate = Number(item.gstRate || 0);
      const row = rows.get(gstRate) ?? {
        gstRate,
        taxableValue: 0,
        gstCollected: 0,
      };

      row.taxableValue += Number(item.taxableAmount || 0);
      row.gstCollected += Number(item.gstAmount || 0);
      rows.set(gstRate, row);
    });
  });

  const breakdown = Array.from(rows.values()).sort(
    (first, second) => first.gstRate - second.gstRate,
  );

  return {
    breakdown,
    totalTaxableValue: sumBy(breakdown, (row) => row.taxableValue),
    totalGstCollected: sumBy(breakdown, (row) => row.gstCollected),
  };
}

export function getMonthlySales(invoices: Invoice[], year = new Date().getFullYear()) {
  const rows: MonthlySalesRow[] = monthLabels.map((month) => ({
    month,
    totalSales: 0,
    billCount: 0,
    averageBillValue: 0,
  }));

  invoices.forEach((invoice) => {
    const invoiceDate = toInvoiceDate(invoice.invoiceDate);

    if (!invoiceDate || invoiceDate.getFullYear() !== year) {
      return;
    }

    const row = rows[invoiceDate.getMonth()];
    row.totalSales += Number(invoice.grandTotal || 0);
    row.billCount += 1;
  });

  return rows.map((row) => ({
    ...row,
    averageBillValue: row.billCount ? row.totalSales / row.billCount : 0,
  }));
}

export function getDailySalesTrend(invoices: Invoice[], anchorDate = new Date()) {
  const daysInMonth = new Date(
    anchorDate.getFullYear(),
    anchorDate.getMonth() + 1,
    0,
  ).getDate();

  const rows: DailySalesRow[] = Array.from({ length: daysInMonth }, (_, index) => {
    const date = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), index + 1);
    return {
      day: String(index + 1),
      date,
      totalSales: 0,
      billCount: 0,
    };
  });

  invoices.forEach((invoice) => {
    const invoiceDate = toInvoiceDate(invoice.invoiceDate);

    if (
      !invoiceDate ||
      invoiceDate.getFullYear() !== anchorDate.getFullYear() ||
      invoiceDate.getMonth() !== anchorDate.getMonth()
    ) {
      return;
    }

    const row = rows[invoiceDate.getDate() - 1];
    row.totalSales += Number(invoice.grandTotal || 0);
    row.billCount += 1;
  });

  const activeDays = rows.filter((row) => row.billCount > 0);

  return {
    rows,
    highestSalesDay: maxBy(activeDays, (row) => row.totalSales),
    lowestSalesDay: minBy(activeDays, (row) => row.totalSales),
    averageDailySales: activeDays.length
      ? sumBy(activeDays, (row) => row.totalSales) / activeDays.length
      : 0,
  };
}

export function getProductSales(invoices: Invoice[], products: Product[]) {
  const productsById = new Map(products.map((product) => [product.id, product]));
  const rows = new Map<string, ProductSalesRow>();

  invoices.forEach((invoice) => {
    const billProducts = new Set<string>();

    invoice.items?.forEach((item) => {
      const key = item.productId || item.name;
      const product = productsById.get(item.productId);
      const existing = rows.get(key) ?? {
        productId: key,
        productName: item.name,
        category: getCategory(product, item),
        quantitySold: 0,
        revenue: 0,
        billCount: 0,
        contribution: 0,
      };

      existing.quantitySold += Number(item.quantity || 0);
      existing.revenue += Number(item.totalAmount || 0);
      billProducts.add(key);
      rows.set(key, existing);
    });

    billProducts.forEach((key) => {
      const row = rows.get(key);

      if (row) {
        row.billCount += 1;
      }
    });
  });

  const reportRows = Array.from(rows.values()).sort(
    (first, second) => second.revenue - first.revenue,
  );
  const totalRevenue = sumBy(reportRows, (row) => row.revenue);

  return reportRows.map((row) => ({
    ...row,
    contribution: totalRevenue ? (row.revenue / totalRevenue) * 100 : 0,
  }));
}

export function getCategorySales(productRows: ProductSalesRow[]) {
  const rows = new Map<string, CategorySalesRow>();

  productRows.forEach((product) => {
    const existing = rows.get(product.category) ?? {
      category: product.category,
      quantitySold: 0,
      revenue: 0,
      contribution: 0,
    };

    existing.quantitySold += product.quantitySold;
    existing.revenue += product.revenue;
    rows.set(product.category, existing);
  });

  const reportRows = Array.from(rows.values()).sort(
    (first, second) => second.revenue - first.revenue,
  );
  const totalRevenue = sumBy(reportRows, (row) => row.revenue);

  return reportRows.map((row) => ({
    ...row,
    contribution: totalRevenue ? (row.revenue / totalRevenue) * 100 : 0,
  }));
}

export function getWeekdaySales(invoices: Invoice[]) {
  const rows = weekdayLabels.map((day) => ({
    day,
    revenue: 0,
    billCount: 0,
  }));

  invoices.forEach((invoice) => {
    const invoiceDate = toInvoiceDate(invoice.invoiceDate);

    if (!invoiceDate) {
      return;
    }

    const dayIndex = (invoiceDate.getDay() + 6) % 7;
    rows[dayIndex].revenue += Number(invoice.grandTotal || 0);
    rows[dayIndex].billCount += 1;
  });

  return rows;
}

export function getBillAnalysis(invoices: Invoice[]): BillAnalysis {
  const values = invoices.map((invoice) => Number(invoice.grandTotal || 0));
  const total = sumBy(values, (value) => value);

  return {
    totalBills: invoices.length,
    averageBillValue: invoices.length ? total / invoices.length : 0,
    highestBill: values.length ? Math.max(...values) : 0,
    lowestBill: values.length ? Math.min(...values) : 0,
  };
}

export function getGrowthComparison(invoices: Invoice[]): GrowthComparison {
  const now = new Date();
  const currentFrom = startOfMonth(now);
  const currentTo = endOfDay(now);
  const previousAnchor = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousFrom = startOfMonth(previousAnchor);
  const previousTo = endOfMonth(previousAnchor);

  const currentInvoices = filterInvoicesByRange(invoices, {
    preset: "month",
    from: currentFrom,
    to: currentTo,
  });
  const previousInvoices = filterInvoicesByRange(invoices, {
    preset: "month",
    from: previousFrom,
    to: previousTo,
  });
  const currentRevenue = sumBy(currentInvoices, (invoice) =>
    Number(invoice.grandTotal || 0),
  );
  const previousRevenue = sumBy(previousInvoices, (invoice) =>
    Number(invoice.grandTotal || 0),
  );
  const revenueDifference = currentRevenue - previousRevenue;

  return {
    currentRevenue,
    previousRevenue,
    revenueDifference,
    revenueGrowthPercent: previousRevenue
      ? (revenueDifference / previousRevenue) * 100
      : currentRevenue
        ? 100
        : 0,
    currentBillCount: currentInvoices.length,
    previousBillCount: previousInvoices.length,
    billCountDifference: currentInvoices.length - previousInvoices.length,
  };
}

export function getDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function formatPercent(value: number) {
  return `${(value || 0).toFixed(1)}%`;
}

function getCategory(product: Product | undefined, item: unknown) {
  const productData = product as Record<string, unknown> | undefined;
  const itemData = item as Record<string, unknown>;
  const category =
    productData?.category ||
    productData?.categoryName ||
    itemData.category ||
    itemData.categoryName;

  return typeof category === "string" && category.trim()
    ? category
    : "Uncategorized";
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function startOfWeek(date: Date) {
  const next = startOfDay(date);
  const offset = (next.getDay() + 6) % 7;
  next.setDate(next.getDate() - offset);
  return next;
}

function startOfMonth(date: Date) {
  return startOfDay(new Date(date.getFullYear(), date.getMonth(), 1));
}

function endOfMonth(date: Date) {
  return endOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

function startOfYear(date: Date) {
  return startOfDay(new Date(date.getFullYear(), 0, 1));
}

function sumBy<T>(rows: T[], getValue: (row: T) => number) {
  return rows.reduce((total, row) => total + getValue(row), 0);
}

function maxBy<T>(rows: T[], getValue: (row: T) => number) {
  return rows.reduce<T | null>((best, row) => {
    if (!best || getValue(row) > getValue(best)) {
      return row;
    }

    return best;
  }, null);
}

function minBy<T>(rows: T[], getValue: (row: T) => number) {
  return rows.reduce<T | null>((best, row) => {
    if (!best || getValue(row) < getValue(best)) {
      return row;
    }

    return best;
  }, null);
}
