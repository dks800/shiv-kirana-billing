"use client";
import { Invoice } from "@/types/invoice.types";
import { InvoiceHeader } from "./invoice-header";
import { InvoiceCustomerDetails } from "./invoice-customer-details";
import { InvoiceDetaisItemsTable } from "./invoice-details-items-table";
import { InvoiceSummary } from "./invoice-summary";
import { InvoiceGSTSummary } from "./invoice-gst-summary";
import { getInvoiceById } from "@/services/invoice.service";
import { useEffect, useState } from "react";
import { Loader } from "@/components/ui/loader";
interface InvoiceDetailsProps {
  invoiceId: string;
}

export function InvoiceDetails({ invoiceId }: InvoiceDetailsProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const data = await getInvoiceById(invoiceId);
        setInvoice(data as Invoice);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId]);

  if (loading) {
    return <Loader />
  }

  if (!invoice) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        Invoice not found
      </div>
    );
  }

  return (
    <div
      className="mx-auto space-y-6 rounded-xl"
    >
      <InvoiceHeader invoice={invoice!} />
      <InvoiceCustomerDetails invoice={invoice!} />
      <InvoiceDetaisItemsTable invoice={invoice!} />
      <div
        className="
          grid
          gap-6
          lg:grid-cols-2
        "
      >
        <InvoiceGSTSummary invoice={invoice!} />
        <InvoiceSummary invoice={invoice!} />
      </div>
    </div>
  );
}
