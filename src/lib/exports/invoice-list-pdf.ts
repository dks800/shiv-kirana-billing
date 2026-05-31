import jsPDF from "jspdf";

import { Invoice } from "@/types/invoice.types";
import { formatDate, formatIndianCurrency } from "@/lib/utils";
import { AppSettings } from "@/types/settings.types";
import { getActiveSettings } from "@/lib/settings-runtime";

const marginX = 14;
const marginTop = 14;
const rowHeight = 9;
const pageBottom = 285;

const columns = [
  { label: "FY", x: 14, width: 20, align: "left" },
  { label: "Invoice No", x: 36, width: 24, align: "left" },
  { label: "Date", x: 62, width: 24, align: "left" },
  { label: "Customer", x: 88, width: 42, align: "left" },
  { label: "Items", x: 132, width: 14, align: "right" },
  { label: "Subtotal", x: 148, width: 20, align: "right" },
  { label: "GST", x: 170, width: 16, align: "right" },
  { label: "Total", x: 188, width: 14, align: "right" },
] as const;

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3)}...`;
}

function textRight(doc: jsPDF, value: string, x: number, y: number) {
  doc.text(value, x, y, { align: "right" });
}

function drawHeader(doc: jsPDF, y: number) {
  doc.setFillColor(245, 247, 250);
  doc.rect(marginX, y - 6, 188, rowHeight, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);

  columns.forEach((column) => {
    if (column.align === "right") {
      textRight(doc, column.label, column.x + column.width, y);
      return;
    }

    doc.text(column.label, column.x, y);
  });

  doc.setDrawColor(220, 224, 230);
  doc.line(marginX, y + 3, 202, y + 3);
}

function getBusinessName(settings: AppSettings) {
  return (
    settings.businessProfile.businessName ||
    settings.general.shopName ||
    "Shiv Kirana & Provision Stores"
  );
}

function getBusinessDetailLines(settings: AppSettings) {
  const profile = settings.businessProfile;
  const location = [profile.city, profile.state, profile.pincode]
    .filter(Boolean)
    .join(", ");
  const address = [profile.address, location].filter(Boolean).join(", ");
  const registrationDetails = [
    profile.gstin ? `GSTIN: ${profile.gstin}` : "",
    profile.phone ? `Phone: ${profile.phone}` : "",
  ]
    .filter(Boolean)
    .join(" | ");

  return [
    address,
    registrationDetails,
  ].filter(Boolean);
}

function drawPageTitle(doc: jsPDF, invoices: Invoice[], settings: AppSettings) {
  const generatedAt = formatDate(new Date());
  const businessDetailLines = getBusinessDetailLines(settings);
  let y = marginTop;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(getBusinessName(settings), marginX, y);

  y += 6;

  if (businessDetailLines.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    businessDetailLines.forEach((line) => {
      const wrappedLines = doc.splitTextToSize(line, 188) as string[];
      doc.text(wrappedLines, marginX, y);
      y += wrappedLines.length * 4;
    });

    y += 2;
  }

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Sales Invoice List", marginX, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`Generated: ${generatedAt}`, marginX, y + 6);
  textRight(doc, `Invoices: ${invoices.length}`, 202, y + 6);

  return y + 14;
}

function drawFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();

  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    textRight(doc, `Page ${page} of ${pageCount}`, 202, 292);
    doc.setTextColor(0, 0, 0);
  }
}

function drawSummary(doc: jsPDF, invoices: Invoice[], y: number) {
  const totals = invoices.reduce(
    (acc, invoice) => {
      acc.items += Number(invoice.totalItems) || 0;
      acc.subtotal += Number(invoice.subtotal) || 0;
      acc.gst += Number(invoice.totalGST) || 0;
      acc.total += Number(invoice.grandTotal) || 0;
      return acc;
    },
    {
      items: 0,
      subtotal: 0,
      gst: 0,
      total: 0,
    },
  );

  doc.setDrawColor(220, 224, 230);
  doc.line(marginX, y, 202, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("Total", 88, y + 7);
  textRight(doc, String(totals.items), 146, y + 7);
  textRight(doc, formatIndianCurrency(totals.subtotal), 168, y + 7);
  textRight(doc, formatIndianCurrency(totals.gst), 186, y + 7);
  textRight(doc, formatIndianCurrency(totals.total), 202, y + 7);
}

export function downloadInvoiceListPdf(invoices: Invoice[]) {
  const settings = getActiveSettings();
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  let y = drawPageTitle(doc, invoices, settings);
  drawHeader(doc, y);
  y += rowHeight;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  invoices.forEach((invoice, index) => {
    if (y > pageBottom - 12) {
      doc.addPage();
      y = marginTop;
      drawHeader(doc, y);
      y += rowHeight;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
    }

    if (index % 2 === 1) {
      doc.setFillColor(250, 250, 250);
      doc.rect(marginX, y - 6, 188, rowHeight, "F");
    }

    doc.text(invoice.financialYear || "-", 14, y);
    doc.text(String(invoice.invoiceNumber || "-"), 36, y);
    doc.text(formatDate(invoice.invoiceDate), 62, y);
    doc.text(truncate(invoice.customerName || "-", 24), 88, y);
    textRight(doc, String(invoice.totalItems || 0), 146, y);
    textRight(doc, formatIndianCurrency(invoice.subtotal || 0), 168, y);
    textRight(doc, formatIndianCurrency(invoice.totalGST || 0), 186, y);
    textRight(doc, formatIndianCurrency(invoice.grandTotal || 0), 202, y);

    y += rowHeight;
  });

  if (y > pageBottom - 16) {
    doc.addPage();
    y = marginTop;
  }

  drawSummary(doc, invoices, y);
  drawFooter(doc);

  doc.save(`shiv-kirana-invoices-${new Date().toISOString().slice(0, 10)}.pdf`);
}
