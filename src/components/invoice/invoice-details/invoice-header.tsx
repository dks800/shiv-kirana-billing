"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, Edit } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Invoice } from "@/types/invoice.types";
import { formatDate } from "@/lib/utils";
import { handleInvoiceEdit } from "@/lib/invoice.utils";
import { downloadInvoicePrintPdf } from "@/lib/exports/invoice-print-pdf";

interface InvoiceHeaderProps {
  invoice: Invoice;
}

export function InvoiceHeader({ invoice }: InvoiceHeaderProps) {
  const router = useRouter();
  const [printing, setPrinting] = useState(false);

  function handlePrintInvoice() {
    try {
      setPrinting(true);
      downloadInvoicePrintPdf(invoice);
      toast.success("Invoice PDF downloaded");
    } catch (error) {
      console.error(error);
      toast.error(
        `Failed to print invoice - ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    } finally {
      setPrinting(false);
    }
  }

  return (
    <div
      className="
        rounded-xl
        border
        bg-card
        text-card-foreground
        p-4
        md:p-6
      "
    >
      <div
        className="
          flex
          flex-row
          gap-4
          justify-between
          items-start
        "
      >
        <div className="space-y-3">
          <Button
            variant="ghost"
            className="w-fit cursor-pointer"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">
                Invoice No: {invoice.invoiceNumber}
              </h1>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Date: {formatDate(invoice.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={handlePrintInvoice}
            disabled={printing}
          >
            <Download className="h-4 w-4" />
            {printing ? "Printing..." : "Print"}
          </Button>
          <Button
            className="cursor-pointer"
            variant="outline"
            onClick={(e) => handleInvoiceEdit(e, invoice.id!, router)}
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>
    </div>
  );
}
