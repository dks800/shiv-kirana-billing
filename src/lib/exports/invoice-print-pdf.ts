import jsPDF from "jspdf";

import { Invoice, InvoiceItem } from "@/types/invoice.types";
import { amountToWords, formatDate, formatIndianCurrency } from "@/lib/utils";
import { AppSettings } from "@/types/settings.types";
import { getActiveSettings } from "@/lib/settings-runtime";

const page = {
  width: 210,
  height: 297,
  marginX: 10,
  footerY: 286,
  bottom: 272,
};

const tableColumns = [
  { label: "No", x: 12, width: 9, align: "left" },
  { label: "Particulars", x: 23, width: 61, align: "left" },
  { label: "HSNC", x: 86, width: 18, align: "left" },
  { label: "Qty", x: 106, width: 15, align: "right" },
  { label: "Rate", x: 123, width: 18, align: "right" },
  { label: "Taxable", x: 143, width: 21, align: "right" },
  { label: "GST", x: 166, width: 13, align: "right" },
  { label: "Amount", x: 181, width: 17, align: "right" },
] as const;

function money(value: number) {
  return formatIndianCurrency(Number(value) || 0);
}

function rightText(doc: jsPDF, value: string, x: number, y: number) {
  doc.text(value, x, y, { align: "right" });
}

function hasCustomerDetails(invoice: Invoice) {
  return Boolean(
    invoice.customerName ||
    invoice.customerPhone ||
    invoice.customerGSTIN ||
    invoice.customerAddress,
  );
}

function drawBorder(doc: jsPDF) {
  doc.setDrawColor(40, 40, 40);
  doc.setLineWidth(0.2);
  doc.rect(page.marginX, 10, page.width - page.marginX * 2, 274);
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

function drawCompanyHeader(doc: jsPDF, invoice: Invoice, settings: AppSettings) {
  const invoiceDate = invoice.invoiceDate || invoice.createdAt;
  const customerAvailable = hasCustomerDetails(invoice);
  const businessName = getBusinessName(settings);
  const businessDetailLines = getBusinessDetailLines(settings);
  let y = 31;

  drawBorder(doc);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`TAX INVOICE (${invoice.financialYear})`, page.width / 2, 16, {
    align: "center",
  });

  doc.setFontSize(15);
  doc.text(businessName, page.width / 2, 25, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  businessDetailLines.forEach((line) => {
    const wrappedLines = doc.splitTextToSize(line, 160) as string[];
    wrappedLines.forEach((wrappedLine) => {
      doc.text(wrappedLine, page.width / 2, y, { align: "center" });
      y += 4;
    });
  });

  if (!businessDetailLines.length) {
    doc.text("GST Billing & Invoice Management", page.width / 2, y, {
      align: "center",
    });
    y += 4;
  }

  const invoiceMetaTop = Math.max(36, y + 2);
  const invoiceMetaTextY = invoiceMetaTop + 7;
  const invoiceMetaBottom = invoiceMetaTop + 13;

  doc.line(page.marginX, invoiceMetaTop, page.width - page.marginX, invoiceMetaTop);

  doc.setFont("helvetica", "bold");
  doc.text("Invoice No.", 13, invoiceMetaTextY);
  doc.text("Date", 112, invoiceMetaTextY);
  doc.text("Financial Year", 158, invoiceMetaTextY);

  doc.setFont("helvetica", "normal");
  doc.text(String(invoice.invoiceNumber || "-"), 39, invoiceMetaTextY);
  doc.text(formatDate(invoiceDate), 126, invoiceMetaTextY);
  doc.text(invoice.financialYear || "-", 183, invoiceMetaTextY);

  doc.line(page.marginX, invoiceMetaBottom, page.width - page.marginX, invoiceMetaBottom);

  if (customerAvailable) {
    const customerStartY = invoiceMetaBottom + 7;
    let customerY = customerStartY;

    doc.setFont("helvetica", "bold");
    doc.text("Buyer", 13, customerStartY);

    doc.setFont("helvetica", "normal");
    const customerLines = [
      invoice.customerName,
      invoice.customerPhone ? `Phone: ${invoice.customerPhone}` : "",
      invoice.customerGSTIN ? `GSTIN: ${invoice.customerGSTIN}` : "",
      invoice.customerAddress,
    ].filter(Boolean) as string[];

    customerLines.forEach((line) => {
      const wrappedLines = doc.splitTextToSize(line, 130) as string[];
      wrappedLines.forEach((wrappedLine) => {
        doc.text(wrappedLine, 31, customerY);
        customerY += 5;
      });
    });

    const customerBlockBottom = Math.max(customerY + 4, customerStartY + 19);
    doc.line(
      page.marginX,
      customerBlockBottom,
      page.width - page.marginX,
      customerBlockBottom,
    );

    return customerBlockBottom;
  }

  return invoiceMetaBottom + 7;
}

function drawTableHeader(doc: jsPDF, y: number) {
  doc.setDrawColor(40, 40, 40);

  doc.rect(page.marginX, y, page.width - page.marginX * 2, 8);

  doc.line(page.marginX, y, page.width - page.marginX, y);
  doc.line(page.marginX, y + 8, page.width - page.marginX, y + 8);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(0, 0, 0);

  tableColumns.forEach((column) => {
    if (column.align === "right") {
      rightText(doc, column.label, column.x + column.width, y + 5.5);
      return;
    }

    doc.text(column.label, column.x, y + 5.5);
  });
}

function drawFooter(doc: jsPDF, pageNumber: number, pageCount: number) {
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Page ${pageNumber} of ${pageCount}`,
    page.width - 12,
    page.footerY+5,
    {
      align: "right",
    },
  );

  const parts = [
    { text: "Made with love by ", color: [100, 100, 100], font: "normal" },
    { text: "Murly", color: [234, 88, 12], font: "bolditalic" },
  ] as const;

  doc.setFontSize(8);
  const totalWidth = parts.reduce((width, part) => {
    doc.setFont("helvetica", part.font);
    return width + doc.getTextWidth(part.text);
  }, 0);

  let x = page.width / 2 - totalWidth / 2;
  parts.forEach((part) => {
    doc.setFont("helvetica", part.font);
    doc.setTextColor(part.color[0], part.color[1], part.color[2]);
    doc.text(part.text, x, page.footerY+5);
    x += doc.getTextWidth(part.text);
  });

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
}

function drawPageScaffold(doc: jsPDF, invoice: Invoice, settings: AppSettings) {
  const headerBottom = drawCompanyHeader(doc, invoice, settings);
  const tableHeaderY = headerBottom + 4;
  drawTableHeader(doc, tableHeaderY);
  return tableHeaderY + 12;
}

function getItemRowHeight(doc: jsPDF, item: InvoiceItem) {
  const nameLines = doc.splitTextToSize(item.name || "-", 60) as string[];
  return Math.max(8, nameLines.length * 4.5 + 3);
}

function drawItemRow(
  doc: jsPDF,
  item: InvoiceItem,
  index: number,
  y: number,
  height: number,
) {
  const nameLines = doc.splitTextToSize(item.name || "-", 60) as string[];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.line(page.marginX, y + height, page.width - page.marginX, y + height);

  doc.text(String(index + 1), 12, y + 5);
  doc.text(nameLines, 23, y + 5);
  doc.text(item.hsnCode || "-", 86, y + 5);
  rightText(doc, `${item.quantity} ${item.unit || ""}`.trim(), 121, y + 5);
  rightText(doc, money(item.rate), 141, y + 5);
  rightText(doc, money(item.taxableAmount), 164, y + 5);
  rightText(doc, `${item.gstRate}%`, 179, y + 5);
  rightText(doc, money(item.totalAmount), 198, y + 5);
}

function drawQuantityTotalRow(doc: jsPDF, invoice: Invoice, startY: number) {
  const totalQuantity = invoice.items.reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0,
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.line(page.marginX, startY, page.width - page.marginX, startY);
  rightText(doc, `${totalQuantity} items`, 121, startY + 6);
  doc.setFont("helvetica", "bold");
  rightText(doc, money(invoice.subtotal), 198, startY + 6);
  doc.setFont("helvetica", "normal");
  return startY + 8;
}

function drawGstSummaryTable(
  doc: jsPDF,
  invoice: Invoice,
  x: number,
  y: number,
) {
  const width = 123;
  const gstSummary = invoice.gstSummary || [];
  const rowCount = Math.max(gstSummary.length, 1);
  const height = 21 + rowCount * 6;
  let rowY = y + 14;

  doc.setDrawColor(40, 40, 40);
  doc.rect(x, y, width, height);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("GST Summary", x + 3, y + 6);
  doc.line(x, y + 9, x + width, y + 9);

  doc.setFontSize(7.2);
  doc.text("Class", x + 3, rowY);
  rightText(doc, "Taxable", x + 48, rowY);
  rightText(doc, "CGST", x + 72, rowY);
  rightText(doc, "SGST", x + 96, rowY);
  rightText(doc, "Total GST", x + width - 3, rowY);
  doc.line(x, rowY + 2, x + width, rowY + 2);
  rowY += 8;

  doc.setFont("helvetica", "normal");
  if (gstSummary.length) {
    gstSummary.forEach((summary) => {
      doc.text(`${summary.gstRate}%`, x + 3, rowY);
      rightText(doc, money(summary.taxableAmount), x + 48, rowY);
      rightText(doc, money(summary.cgstAmount), x + 72, rowY);
      rightText(doc, money(summary.sgstAmount), x + 96, rowY);
      rightText(doc, money(summary.gstAmount), x + width - 3, rowY);
      rowY += 6;
    });
  } else {
    doc.text("No GST summary available", x + 3, rowY);
    rowY += 6;
  }

  return y + height;
}

function drawTotalsPanel(doc: jsPDF, invoice: Invoice, x: number, y: number) {
  const width = 67;
  const totals = [
    ["Sub Total", money(invoice.subtotal)],
    ["CGST", money(invoice.totalCGST)],
    ["SGST", money(invoice.totalSGST)],
    ["Round Up", money(invoice.roundUp || 0)],
  ];
  let rowY = y + 15;

  doc.setDrawColor(40, 40, 40);
  doc.rect(x, y, width, 48);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("Totals", x + 3, y + 6);
  doc.line(x, y + 9, x + width, y + 9);

  totals.forEach(([label, value]) => {
    doc.setFont("helvetica", "normal");
    doc.text(label, x + 3, rowY);
    rightText(doc, value, x + width - 3, rowY);
    rowY += 7;
  });

  doc.line(x, rowY - 2, x + width, rowY - 2);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);

  doc.text("Grand Total", x + 3, rowY + 3);
  rightText(doc, money(invoice.grandTotal), x + width - 3, rowY + 3);

  doc.setFontSize(8);

  return y + 48;
}

function drawTotals(
  doc: jsPDF,
  invoice: Invoice,
  startY: number,
  settings: AppSettings,
) {
  let y = startY;
  const gstRows = Math.max(invoice.gstSummary?.length || 0, 1);
  const summaryHeight = settings.pdf.showGSTSummary
    ? Math.max(56, 21 + gstRows * 6)
    : 56;

  if (y + summaryHeight > 222) {
    doc.addPage();
    y = drawPageScaffold(doc, invoice, settings);
  }

  // doc.line(page.marginX, y, page.width - page.marginX, y);
  // y += 4;

  const gstBottom = settings.pdf.showGSTSummary
    ? drawGstSummaryTable(doc, invoice, 10, y)
    : y;
  const totalsBottom = drawTotalsPanel(doc, invoice, 133, y);
  y = Math.max(gstBottom, totalsBottom) + 5;

  if (settings.pdf.showAmountInWords) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const amountWords = doc.splitTextToSize(
      `In words: ${amountToWords(invoice.grandTotal)}`,
      185,
    ) as string[];
    doc.text(amountWords, 13, y);
    y += amountWords.length * 4.5 + 4;
  }

  doc.line(page.marginX, y, page.width - page.marginX, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text(
    "Declaration: We declare that this invoice shows the actual price of the goods described.",
    13,
    y + 7,
  );
  doc.setFont("helvetica", "bold");
  doc.text("For, SHIV KIRANA & PROVISION STORES", 198, y + 10, { align: "right" });
  doc.text("Authorised Signatory", 198, y + 38, { align: "right" });
}

export function downloadInvoicePrintPdf(invoice: Invoice) {
  const settings = getActiveSettings();
  const businessName = getBusinessName(settings);
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  doc.setProperties({
    title: `Invoice ${invoice.invoiceNumber}`,
    subject: "Tax Invoice",
    creator: businessName,
  });

  let y = drawPageScaffold(doc, invoice, settings);

  invoice.items.forEach((item, index) => {
    const rowHeight = getItemRowHeight(doc, item);

    if (y + rowHeight > page.bottom) {
      doc.addPage();
      y = drawPageScaffold(doc, invoice, settings);
    }

    drawItemRow(doc, item, index, y, rowHeight);
    y += rowHeight;
  });

  if (y + 11 > page.bottom) {
    doc.addPage();
    y = drawPageScaffold(doc, invoice, settings);
  }

  y = drawQuantityTotalRow(doc, invoice, y);
  drawTotals(doc, invoice, y + 2, settings);

  const pageCount = doc.getNumberOfPages();
  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
    doc.setPage(pageNumber);
    drawFooter(doc, pageNumber, pageCount);
  }

  doc.save(`invoice-${invoice.invoiceNumber || "print"}.pdf`);
}
