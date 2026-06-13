import { Timestamp } from "firebase/firestore";

export type PaymentMode = "Cash" | "UPI";

export interface InvoiceItem {
  productId: string;
  name: string;
  barcodeNumber?: string;
  hsnCode?: string;
  quantity: number;
  unit: string;
  rate: number;
  gstRate: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  gstAmount: number;
  totalAmount: number;
}

export interface Invoice {
  id?: string;
  invoiceNumber: number;
  invoiceDate: Date | Timestamp;
  financialYear?: string;
  customerName?: string;
  customerGSTIN?: string;
  customerAddress?: string;
  customerPhone?: string;
  paymentMode?: PaymentMode;
  items: InvoiceItem[];
  subtotal: number;
  totalCGST: number;
  totalSGST: number;
  totalGST: number;
  roundUp: number;
  grandTotal: number;
  totalItems: number;
  gstSummary?: GstSummaryItem[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface GstSummaryItem {
  gstRate: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  gstAmount: number;
  totalAmount: number;
}
