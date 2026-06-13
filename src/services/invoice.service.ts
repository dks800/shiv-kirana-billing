import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
  doc,
  getDoc,
  DocumentData,
  QuerySnapshot,
} from "firebase/firestore";

import { Invoice } from "@/types/invoice.types";
import { getFinancialYear } from "@/lib/invoice.utils";
import { db } from "@/lib/firebase/config";
import { addRecord, deleteRecord, updateRecord } from "@/hooks/useInvoiceServices";

const INVOICE_COLLECTION = "invoices";

function mapInvoiceDocs(
  snapshot: QuerySnapshot<DocumentData, DocumentData>,
): Invoice[] {
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      invoiceNumber: data.invoiceNumber,
      financialYear: data.financialYear,
      invoiceDate: data.invoiceDate,
      customerGSTIN: data.customerGSTIN || "",
      customerName: data.customerName || "",
      customerAddress: data.customerAddress || "",
      customerPhone: data.customerPhone || "",
      paymentMode: data.paymentMode,
      totalItems: data.totalItems || 0,
      items: data.items || [],
      subtotal: data.subtotal || 0,
      totalCGST: data.totalCGST || 0,
      totalSGST: data.totalSGST || 0,
      totalGST: data.totalGST || 0,
      roundUp: data.roundUp || 0,
      grandTotal: data.grandTotal || 0,
      gstSummary: data.gstSummary || [],
    };
  });
}

function invoicesQuery() {
  const invoicesRef = collection(db, INVOICE_COLLECTION);
  return query(
    invoicesRef,
    orderBy("invoiceNumber", "desc"),
    orderBy("financialYear", "desc"),
  );
}

async function getNextSequenceForFinancialYear(financialYear: string) {
  const q = query(
    collection(db, INVOICE_COLLECTION),
    where("financialYear", "==", financialYear),
  );

  const querySnapshot = await getDocs(q);
  let maxSequence = 0;

  querySnapshot.forEach((invoiceDoc) => {
    const data = invoiceDoc.data();
    const invoiceNumberValue = data.invoiceNumber;
    if (
      typeof invoiceNumberValue === "number" &&
      invoiceNumberValue > maxSequence
    ) {
      maxSequence = invoiceNumberValue;
    }
  });

  return maxSequence + 1;
}

export async function getNextInvoiceNumberPreview(billDate: Date) {
  const financialYear = getFinancialYear(billDate);
  const nextSequence = await getNextSequenceForFinancialYear(financialYear);
  return Number(nextSequence);
}

export async function isInvoiceNumberExists(
  invoiceNumber: number,
  financialYear: string,
  excludeInvoiceId?: string,
): Promise<boolean> {
  const q = query(
    collection(db, INVOICE_COLLECTION),
    where("financialYear", "==", financialYear),
  );

  const querySnapshot = await getDocs(q);
  let exists = false;

  querySnapshot.forEach((invoiceDoc) => {
    if (excludeInvoiceId && invoiceDoc.id === excludeInvoiceId) {
      return;
    }

    const data = invoiceDoc.data();
    const invoiceNumberValue = data.invoiceNumber;
    if (typeof invoiceNumberValue === "number") {
      if (invoiceNumberValue === invoiceNumber) {
        exists = true;
      }
    }
  });

  return exists;
}

export async function createInvoice(invoice: Invoice) {
  const invoiceNumber = invoice.invoiceNumber;
  const financialYear =
    invoice.financialYear ??
    getFinancialYear(new Date(invoice.invoiceDate as Date));

  if (!invoiceNumber || !financialYear) {
    throw new Error("Invoice number and financial year are required.");
  }

  const exists = await isInvoiceNumberExists(invoiceNumber, financialYear);
  if (exists) {
    throw new Error(
      `Invoice number ${invoiceNumber} already exists for financial year ${financialYear}`,
    );
  }
  await addRecord(INVOICE_COLLECTION, invoice);
}

export async function updateInvoice(
  invoiceId: string,
  invoice: Partial<Invoice>,
) {
  const invoiceNumber = invoice.invoiceNumber;
  const financialYear =
    invoice.financialYear ??
    getFinancialYear(new Date(invoice.invoiceDate as Date));

  if (!invoiceId) {
    throw new Error("Invoice id is required.");
  }

  if (!invoiceNumber || !financialYear) {
    throw new Error("Invoice number and financial year are required.");
  }

  const exists = await isInvoiceNumberExists(
    invoiceNumber,
    financialYear,
    invoiceId,
  );

  if (exists) {
    throw new Error(
      `Invoice number ${invoiceNumber} already exists for financial year ${financialYear}`,
    );
  }

  await updateRecord<Invoice>(INVOICE_COLLECTION, invoiceId, invoice);
}

export const getInvoices = async (): Promise<Invoice[]> => {
  try {
    const snapshot = await getDocs(invoicesQuery());
    return mapInvoiceDocs(snapshot);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    throw error;
  }
};

export function subscribeToInvoices(
  onInvoices: (invoices: Invoice[]) => void,
  onError?: (error: Error) => void,
) {
  return onSnapshot(
    invoicesQuery(),
    (snapshot) => {
      onInvoices(mapInvoiceDocs(snapshot));
    },
    (error) => {
      onError?.(error);
    },
  );
}

export const deleteInvoice = async (invoiceId: string) => {
  await deleteRecord(INVOICE_COLLECTION, invoiceId);
};

export const getInvoiceById = async (invoiceId: string) => {
  try {
    const invoiceRef = doc(db, INVOICE_COLLECTION, invoiceId);
    const snapshot = await getDoc(invoiceRef);
    if (!snapshot.exists()) {
      return null;
    }
    return {
      id: snapshot.id,
      ...snapshot.data(),
    };
  } catch (error) {
    console.error("Error fetching invoice:", error);
    // toast.error(
    //   `Error fetching invoice deatils - ${error instanceof Error ? error.message : "Unknown error"}`,
    // );
    throw error;
  }
};
