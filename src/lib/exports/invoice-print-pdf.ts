import jsPDF from "jspdf";

import { Invoice, InvoiceItem } from "@/types/invoice.types";
import { amountToWords, formatDate, formatIndianCurrency } from "@/lib/utils";
import { AppSettings } from "@/types/settings.types";
import { getActiveSettings } from "@/lib/settings-runtime";

const page = {
  width: 210,
  height: 297,
  marginX: 6,
  top: 3,
  bottom: 294,
  footerY: 295,
};

const invoiceGap = 2;
const blockWidth = page.width - page.marginX * 2;
const invoiceHeaderHeight = 13;
const invoiceDetailsHeight = 9;
const tableHeaderHeight = 5.8;
const quantityTotalHeight = 5;
const amountInWordsHeight = 4;
const bankDetailsHeight = 8;
const minimumSummaryHeight = 20;

const tableColumns = [
  { label: "SN.", x: 0, width: 7, align: "center" },
  { label: "DESCRIPTION", x: 7, width: 69, align: "left" },
  { label: "HSN", x: 76, width: 14, align: "center" },
  { label: "QTY", x: 90, width: 14, align: "right" },
  { label: "RATE", x: 104, width: 17, align: "right" },
  { label: "AMOUNT", x: 121, width: 21, align: "right" },
  { label: "GST%", x: 142, width: 9, align: "center" },
  { label: "GST AMT.", x: 151, width: 20, align: "right" },
  { label: "NET AMT.", x: 171, width: 23, align: "right" },
] as const;

const tableColumnRight = {
  sn: 6,
  hsn: 88.5,
  qty: 102.5,
  rate: 119.5,
  amount: 140.5,
  gstRate: 149.5,
  gstAmount: 169.5,
  netAmount: 192.5,
} as const;

function money(value: number) {
  return formatIndianCurrency(Number(value) || 0);
}

function rightText(doc: jsPDF, value: string, x: number, y: number) {
  doc.text(value, x, y, { align: "right" });
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
  const contact = [
    profile.phone ? `Phone: ${profile.phone}` : "",
    profile.email ? `E-Mail: ${profile.email}` : "",
  ]
    .filter(Boolean)
    .join(" | ");

  return [
    address,
    profile.gstin ? `GSTIN: ${profile.gstin} | ${contact}` : "",
  ].filter(Boolean);
}

function drawFooter(doc: jsPDF, pageNumber: number, pageCount: number) {
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  rightText(
    doc,
    `Page ${pageNumber} of ${pageCount}`,
    page.width - 8,
    page.footerY,
  );
  doc.setTextColor(0, 0, 0);
}

function getItemRowHeight(doc: jsPDF, item: InvoiceItem) {
  const nameLines = doc.splitTextToSize(item.name || "-", 66) as string[];
  return Math.max(4.4, nameLines.length * 3 + 1.4);
}

function getBankLine(settings: AppSettings) {
  const bank = settings.bankAccount;
  return [
    bank.bankName ? `${bank.bankName?.toUpperCase()} (${bank.branch})` : "",
    bank.accountNumber ? `A/c No. - ${bank.accountNumber}` : "",
    bank.ifscCode ? `IFSC - ${bank.ifscCode}` : "",
  ].filter(Boolean);
}

function getGstSummaryHeight(invoice: Invoice, settings: AppSettings) {
  if (!settings.pdf.showGSTSummary) {
    return minimumSummaryHeight;
  }

  return 7 + Math.max(invoice.gstSummary?.length || 0, 1) * 4;
}

function getInvoiceBlockHeight(
  doc: jsPDF,
  invoice: Invoice,
  settings: AppSettings,
) {
  const rowsHeight = invoice.items.reduce(
    (height, item) => height + getItemRowHeight(doc, item),
    0,
  );
  const wordsHeight = settings.pdf.showAmountInWords ? amountInWordsHeight : 0;

  return (
    invoiceHeaderHeight +
    invoiceDetailsHeight +
    tableHeaderHeight +
    rowsHeight +
    quantityTotalHeight +
    Math.max(getGstSummaryHeight(invoice, settings), minimumSummaryHeight) +
    wordsHeight +
    bankDetailsHeight
  );
}

function drawSingleLineCellText(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  maxWidth: number,
) {
  doc.setFont("helvetica", "bold");
  doc.text(label, x, y);
  doc.setFont("helvetica", "normal");
  const lines = doc.splitTextToSize(value || "-", maxWidth) as string[];
  doc.text(lines.slice(0, 1), x + 17, y);
}

function drawInvoiceNumberCell(
  doc: jsPDF,
  value: string,
  x: number,
  y: number,
) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("Invoice No.:", x, y);
  doc.setFontSize(11);
  doc.text(value || "-", x + 18, y + 0.7);
  doc.setFontSize(7);
}

function drawInvoiceHeader(
  doc: jsPDF,
  invoice: Invoice,
  settings: AppSettings,
  x: number,
  y: number,
  continued = false,
) {
  const businessName = getBusinessName(settings);
  const detailLines = getBusinessDetailLines(settings);
  const invoiceDate = invoice.invoiceDate || invoice.createdAt;
  const headerRightX = x + blockWidth - 8;

  doc.setDrawColor(25, 25, 25);
  doc.setLineWidth(0.25);
  doc.rect(x, y, blockWidth, invoiceHeaderHeight);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(businessName, x + blockWidth / 2, y + 4.8, { align: "center" });

  doc.setFontSize(6.7);
  detailLines.slice(0, 4).forEach((line, index) => {
    doc.setFont("helvetica", index === 1 ? "bold" : "normal");
    doc.text(line, x + blockWidth / 2, y + 8.5 + index * 2.6, {
      align: "center",
    });
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  rightText(doc, "GST INVOICE", headerRightX, y + 4.2);
  doc.setFont("helvetica", "normal");
  rightText(
    doc,
    continued ? "Continued" : "Original for Buyer",
    headerRightX,
    y + 7.6,
  );

  const detailsTop = y + invoiceHeaderHeight;
  const customerColWidth = 128;
  const dividerX = x + customerColWidth;

  doc.rect(x, detailsTop, blockWidth, invoiceDetailsHeight);
  doc.line(dividerX, detailsTop, dividerX, detailsTop + invoiceDetailsHeight);

  doc.setFontSize(7);
  const customerGstPhone =
    [
      invoice.customerGSTIN ? `GSTIN: ${invoice.customerGSTIN}` : "",
      invoice.customerPhone ? `Ph: ${invoice.customerPhone}` : "",
    ]
      .filter(Boolean)
      .join(" | ") || "-";

  drawSingleLineCellText(
    doc,
    "To,",
    `${invoice.customerName || "-"}   ${customerGstPhone}`,
    x + 2,
    detailsTop + 3.7,
    104,
  );
  drawSingleLineCellText(
    doc,
    "Address:",
    invoice.customerAddress || "-",
    x + 2,
    detailsTop + 7.3,
    104,
  );

  const invoiceX = x + customerColWidth + 2;
  drawInvoiceNumberCell(
    doc,
    String(invoice.invoiceNumber || "-"),
    invoiceX,
    detailsTop + 3.7,
  );
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("Date:", invoiceX + 34, detailsTop + 3.7);
  doc.setFont("helvetica", "normal");
  doc.text(formatDate(invoiceDate), invoiceX + 46, detailsTop + 3.7);

  drawSingleLineCellText(
    doc,
    "Payment:",
    invoice.paymentMode || "-",
    invoiceX,
    detailsTop + 7.3,
    26,
  );

  return detailsTop + invoiceDetailsHeight;
}

function drawTableHeader(doc: jsPDF, x: number, y: number) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.8);
  doc.rect(x, y, blockWidth, tableHeaderHeight);

  tableColumns.forEach((column, index) => {
    if (index > 0) {
      doc.line(x + column.x, y, x + column.x, y + tableHeaderHeight);
    }

    if (column.align === "right") {
      rightText(doc, column.label, x + column.x + column.width - 1.2, y + 4);
      return;
    }

    if (column.align === "center") {
      doc.text(column.label, x + column.x + column.width / 2, y + 4, {
        align: "center",
      });
      return;
    }

    doc.text(column.label, x + column.x + 1.2, y + 4);
  });

  return y + tableHeaderHeight;
}

function drawItemRow(
  doc: jsPDF,
  item: InvoiceItem,
  index: number,
  x: number,
  y: number,
  height: number,
) {
  const nameLines = doc.splitTextToSize(item.name || "-", 66) as string[];
  const hsnCode = String(item.hsnCode || "-").slice(0, 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.6);
  doc.rect(x, y, blockWidth, height);

  tableColumns.forEach((column, columnIndex) => {
    if (columnIndex > 0) {
      doc.line(x + column.x, y, x + column.x, y + height);
    }
  });

  rightText(doc, String(index + 1), x + tableColumnRight.sn, y + 3.3);
  doc.text(nameLines, x + 8.5, y + 3.3);
  doc.text(hsnCode, x + tableColumnRight.hsn, y + 3.3, {
    align: "right",
  });
  rightText(
    doc,
    `${item.quantity} ${item.unit || ""}`.trim(),
    x + tableColumnRight.qty,
    y + 3.3,
  );
  rightText(doc, money(item.rate), x + tableColumnRight.rate, y + 3.3);
  rightText(doc, money(item.taxableAmount), x + tableColumnRight.amount, y + 3.3);
  rightText(doc, `${item.gstRate}%`, x + tableColumnRight.gstRate, y + 3.3);
  rightText(doc, money(item.gstAmount), x + tableColumnRight.gstAmount, y + 3.3);
  rightText(doc, money(item.totalAmount), x + tableColumnRight.netAmount, y + 3.3);
}

function drawQuantityTotalRow(
  doc: jsPDF,
  invoice: Invoice,
  x: number,
  y: number,
) {
  const totalQuantity = invoice.items.reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0,
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.rect(x, y, blockWidth, quantityTotalHeight);
  doc.text("TOTAL :", x + 5, y + 3.6);
  rightText(doc, String(totalQuantity), x + tableColumnRight.qty, y + 3.6);
  rightText(doc, money(invoice.subtotal), x + tableColumnRight.amount, y + 3.6);
  rightText(doc, money(invoice.totalGST), x + tableColumnRight.gstAmount, y + 3.6);
  rightText(doc, money(invoice.grandTotal), x + tableColumnRight.netAmount, y + 3.6);

  return y + quantityTotalHeight;
}

function drawGstSummary(
  doc: jsPDF,
  invoice: Invoice,
  x: number,
  y: number,
  height: number,
) {
  const summary = invoice.gstSummary || [];
  const rows = summary.length ? summary : [];
  const width = 120;
  let rowY = y + 8.8;

  doc.rect(x, y, width, height);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.8);
  doc.text("CLASS", x + 3, y + 4.5);
  rightText(doc, "SGST", x + 42, y + 4.5);
  rightText(doc, "CGST", x + 68, y + 4.5);
  rightText(doc, "TOTAL GST", x + 94, y + 4.5);
  rightText(doc, "SALE AMT.", x + width - 4, y + 4.5);
  doc.line(x, y + 6, x + width, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.6);

  if (!rows.length) {
    doc.text("No GST summary available", x + 3, rowY);
    return;
  }

  rows.forEach((row) => {
    doc.text(`${row.gstRate}%`, x + 3, rowY);
    rightText(doc, money(row.sgstAmount), x + 42, rowY);
    rightText(doc, money(row.cgstAmount), x + 68, rowY);
    rightText(doc, money(row.gstAmount), x + 94, rowY);
    rightText(doc, money(row.taxableAmount), x + width - 4, rowY);
    rowY += 4;
  });
}

function drawTotalsPanel(
  doc: jsPDF,
  invoice: Invoice,
  x: number,
  y: number,
  height: number,
) {
  const width = blockWidth - 120;
  const rows = [
    ["Sub Total", money(invoice.subtotal)],
    ["SGST Amount", money(invoice.totalSGST)],
    ["CGST Amount", money(invoice.totalCGST)],
    ["Round Off (+/-)", money(invoice.roundUp || 0)],
  ];
  let rowY = y + 3.2;

  doc.rect(x, y, width, height);
  doc.setFontSize(6.6);

  rows.forEach(([label, value]) => {
    doc.setFont("helvetica", "normal");
    doc.text(label, x + 3, rowY);
    rightText(doc, value, x + width - 3, rowY);
    rowY += 3;
  });

  const grandTotalTop = y + height - 6.6;
  const grandTotalTextY = grandTotalTop + 4.8;

  doc.line(x, grandTotalTop, x + width, grandTotalTop);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("GRAND TOTAL", x + 3, grandTotalTextY);
  rightText(doc, money(invoice.grandTotal), x + width - 3, grandTotalTextY);
}

function drawBankDetails(
  doc: jsPDF,
  settings: AppSettings,
  x: number,
  y: number,
) {
  const bankLine = getBankLine(settings);
  const signatureX = x + 120;
  const signatureWidth = blockWidth - 120;
  const businessName = getBusinessName(settings);

  doc.rect(x, y, blockWidth, bankDetailsHeight);
  doc.line(signatureX, y, signatureX, y + bankDetailsHeight);

  doc.setFont("helvetica", "bolditalic");
  doc.setFontSize(7.4);
  doc.text("BANK DETAILS", x + 2, y + 3.4);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.7);
  const lines = doc.splitTextToSize(bankLine.join("   "), 116) as string[];
  doc.text(lines.slice(0, 2), x + 2, y + 6.4);

  doc.setFontSize(7.2);
  const signatureNameLines = doc.splitTextToSize(
    `For, ${businessName}`,
    signatureWidth - 4,
  ) as string[];
  doc.text(signatureNameLines.slice(0, 1), signatureX + signatureWidth / 2, y + 3.2, {
    align: "center",
  });
  doc.text("Authorised Signatory", signatureX + signatureWidth / 2, y + 6.8, {
    align: "center",
  });

  return y + bankDetailsHeight;
}

function drawInvoiceSummary(
  doc: jsPDF,
  invoice: Invoice,
  settings: AppSettings,
  x: number,
  y: number,
) {
  const panelHeight = Math.max(
    getGstSummaryHeight(invoice, settings),
    minimumSummaryHeight,
  );

  if (settings.pdf.showGSTSummary) {
    drawGstSummary(doc, invoice, x, y, panelHeight);
  } else {
    doc.rect(x, y, 120, panelHeight);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.3);
    doc.text("GST Summary hidden", x + 3, y + 6);
  }

  drawTotalsPanel(doc, invoice, x + 120, y, panelHeight);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.4);
  let nextY = y + panelHeight;

  if (settings.pdf.showAmountInWords) {
    const amountWords = doc.splitTextToSize(
      `In words: ${amountToWords(invoice.grandTotal)}`,
      blockWidth - 4,
    ) as string[];

    doc.rect(x, nextY, blockWidth, amountInWordsHeight);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.6);
    doc.text(amountWords.slice(0, 1), x + 2, nextY + 2.9);
    nextY += amountInWordsHeight;
  }

  return nextY;
}

function drawCompactInvoiceBlock(
  doc: jsPDF,
  invoice: Invoice,
  settings: AppSettings,
  startY: number,
  options: { addPages: boolean; continued?: boolean },
) {
  const x = page.marginX;
  let y = startY;
  let itemStartIndex = 0;

  while (itemStartIndex < invoice.items.length) {
    y = drawInvoiceHeader(
      doc,
      invoice,
      settings,
      x,
      y,
      options.continued || itemStartIndex > 0,
    );
    y = drawTableHeader(doc, x, y);

    for (; itemStartIndex < invoice.items.length; itemStartIndex += 1) {
      const item = invoice.items[itemStartIndex];
      const rowHeight = getItemRowHeight(doc, item);
      const reserveForSummary =
        quantityTotalHeight +
        Math.max(getGstSummaryHeight(invoice, settings), minimumSummaryHeight) +
        bankDetailsHeight;

      if (
        options.addPages &&
        itemStartIndex > 0 &&
        y + rowHeight + reserveForSummary > page.bottom
      ) {
        doc.addPage();
        y = page.top;
        break;
      }

      drawItemRow(doc, item, itemStartIndex, x, y, rowHeight);
      y += rowHeight;
    }
  }

  y = drawQuantityTotalRow(doc, invoice, x, y);

  const summaryHeight =
    Math.max(getGstSummaryHeight(invoice, settings), minimumSummaryHeight) +
    (settings.pdf.showAmountInWords ? amountInWordsHeight : 0) +
    bankDetailsHeight;

  if (options.addPages && y + summaryHeight > page.bottom) {
    doc.addPage();
    y = drawInvoiceHeader(doc, invoice, settings, x, page.top, true);
    y = drawTableHeader(doc, x, y);
    y = drawQuantityTotalRow(doc, invoice, x, y);
  }

  y = drawInvoiceSummary(doc, invoice, settings, x, y);
  y = drawBankDetails(doc, settings, x, y);

  return y;
}

function createInvoicePdf(settings: AppSettings) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  doc.setProperties({
    subject: "Tax Invoice",
    creator: getBusinessName(settings),
  });

  doc.setDrawColor(25, 25, 25);
  doc.setTextColor(0, 0, 0);

  return doc;
}

function addPageFooters(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
    doc.setPage(pageNumber);
    drawFooter(doc, pageNumber, pageCount);
  }
}

export function downloadInvoicePrintPdf(invoice: Invoice) {
  const settings = getActiveSettings();
  const doc = createInvoicePdf(settings);

  doc.setProperties({
    title: `Invoice ${invoice.invoiceNumber}`,
  });

  drawCompactInvoiceBlock(doc, invoice, settings, page.top, { addPages: true });
  addPageFooters(doc);
  doc.save(`invoice-${invoice.invoiceNumber || "print"}.pdf`);
}

export function downloadSelectedInvoicesPrintPdf(invoices: Invoice[]) {
  if (!invoices.length) {
    return;
  }

  const settings = getActiveSettings();
  const doc = createInvoicePdf(settings);
  let y = page.top;

  doc.setProperties({
    title: `Selected Invoices (${invoices.length})`,
  });

  invoices.forEach((invoice, index) => {
    const invoiceHeight = getInvoiceBlockHeight(doc, invoice, settings);

    if (index > 0 && y + invoiceHeight > page.bottom) {
      doc.addPage();
      y = page.top;
    }

    y = drawCompactInvoiceBlock(doc, invoice, settings, y, { addPages: true });
    y += invoiceGap;
  });

  addPageFooters(doc);
  doc.save(`selected-invoices-${new Date().toISOString().slice(0, 10)}.pdf`);
}
