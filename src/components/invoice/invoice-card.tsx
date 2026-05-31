"use client";

import { useRouter } from "next/navigation";
import { useState, type MouseEvent } from "react";

import { Calendar, ReceiptText, Edit, Trash } from "lucide-react";
import { Invoice } from "@/types/invoice.types";
import { formatIndianCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { handleInvoiceEdit, handleInvoiceView } from "@/lib/invoice.utils";
import { DeleteProductDialog } from "../products/delete-product-dialog";
import { deleteInvoice } from "@/services/invoice.service";

interface InvoiceCardProps {
  invoice: Invoice;
}

export function InvoiceCard({ invoice }: InvoiceCardProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDeleteInvoice = async () => {
    setIsDeleting(true);
    await deleteInvoice(selectedInvoiceId!);
    setIsDeleting(false);
    setSelectedInvoiceId(null);
    setDeleteOpen(false);
  };

  const createdDate = formatDate(invoice?.invoiceDate);
  const handleInvoiceDelete = (
    e: MouseEvent<HTMLButtonElement>,
    invoiceId: string,
  ) => {
    e.stopPropagation();
    setSelectedInvoiceId(invoiceId);
    setDeleteOpen(true);
  };

  return (
    <>
      <div
        onClick={() => handleInvoiceView(invoice.id!, router)}
        className="
        cursor-pointer
        rounded-xl
        border
        bg-card
        text-card-foreground
        p-2 px-4
        shadow-sm
        transition
        active:scale-[0.98]
      "
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2">
                <ReceiptText className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-semibold">{invoice.invoiceNumber}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-xs text-muted-foreground">
                  {createdDate}
                </span>
              </div>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              {invoice?.customerName || invoice.totalItems + " items"}
            </p>
          </div>

          <div className="text-right">
            <p className="text-lg font-bold">
              ₹{formatIndianCurrency(invoice?.grandTotal)}
            </p>

            <p className="text-xs text-muted-foreground">
              GST ₹{formatIndianCurrency(invoice?.totalGST)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t pt-1 mt-2 items-center justify-between">
          <Button
            onClick={(e) => handleInvoiceEdit(e, invoice.id!, router)}
            className="flex gap-2 items-center text-primary p-0 hover:text-primary"
            variant="ghost"
            size="sm"
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </Button>
          <Button
            onClick={(e) => handleInvoiceDelete(e, invoice.id!)}
            className="flex gap-2 items-center text-destructive p-0 hover:text-destructive"
            variant="ghost"
            size="sm"
          >
            <Trash className="h-4 w-4" />
            <span>Delete</span>
          </Button>
        </div>
      </div>
      {deleteOpen && (
        <DeleteProductDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          onConfirm={confirmDeleteInvoice}
          isLoading={isDeleting}
          title="Delete Sales Invoice?"
          description={`Are you sure you want to delete this sales invoice? This action cannot be undone.`}
        />
      )}
    </>
  );
}
