import { Invoice } from "@/types/invoice.types";
import { Timestamp } from "firebase/firestore";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export function getFinancialYear(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const startYear = month >= 4 ? year : year - 1;
  const endYear = startYear + 1;
  const formatTwoDigits = (value: number) => String(value).slice(-2);
  return `${formatTwoDigits(startYear)}-${formatTwoDigits(endYear)}`;
}

export const handleInvoiceEdit = (
  e: React.MouseEvent,
  invoiceId: string,
  router: AppRouterInstance,
) => {
  e.stopPropagation();
  router.push(`/dashboard/invoices/${invoiceId}/edit`);
};

export const handleInvoiceView = (id: string, router: AppRouterInstance) => {
  if (!id?.trim()) return router.push(`/dashboard`);
  return router.push(`/dashboard/invoices/${id}`);
};


export function toInvoiceDate(value: Invoice["invoiceDate"]) {
  if (!value) {
    return null;
  }

  if (value instanceof Timestamp) {
    return value.toDate();
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function normalizeDateInput(value: string, endOfDay = false) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  } else {
    date.setHours(0, 0, 0, 0);
  }

  return date;
}