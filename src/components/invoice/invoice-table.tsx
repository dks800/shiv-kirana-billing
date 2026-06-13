"use client";

import { useRouter } from "next/navigation";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Invoice } from "@/types/invoice.types";
import { formatDate, formatIndianCurrency } from "@/lib/utils";
import { Download, Edit, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { handleInvoiceEdit, handleInvoiceView } from "@/lib/invoice.utils";
import { DeleteProductDialog } from "../products/delete-product-dialog";
import { useState } from "react";
import { deleteInvoice } from "@/services/invoice.service";
import { downloadInvoicePrintPdf } from "@/lib/exports/invoice-print-pdf";
import toast from "react-hot-toast";
import { Checkbox } from "@/components/ui/checkbox";

interface InvoiceTableProps {
  invoices: Invoice[];
  selectedInvoiceIds: string[];
  allInvoicesSelected: boolean;
  onToggleInvoiceSelection: (invoiceId: string) => void;
  onToggleSelectAllInvoices: () => void;
}

export function InvoiceTable({
  invoices,
  selectedInvoiceIds,
  allInvoicesSelected,
  onToggleInvoiceSelection,
  onToggleSelectAllInvoices,
}: InvoiceTableProps) {
  const router = useRouter();
  const [printing, setPrinting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const handleInvoiceDelete = (e: React.MouseEvent, invoiceId: string) => {
    e.stopPropagation();
    setSelectedInvoiceId(invoiceId);
    setDeleteOpen(true);
  };

  const confirmDeleteInvoice = async () => {
    setIsDeleting(true);
    await deleteInvoice(selectedInvoiceId!);
    setIsDeleting(false);
    setSelectedInvoiceId(null);
    setDeleteOpen(false);
  };

  function handlePrintInvoice(e: React.MouseEvent<HTMLButtonElement>, invoice: Invoice) {
    e.stopPropagation();
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

  function handleRowClick(event: React.MouseEvent, invoiceId: string) {
    if (
      event.target instanceof Element &&
      event.target.closest("[data-invoice-selection]")
    ) {
      return;
    }

    handleInvoiceView(invoiceId, router);
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10 px-4">
              <Checkbox
                checked={allInvoicesSelected}
                onCheckedChange={onToggleSelectAllInvoices}
                onClick={(event) => event.stopPropagation()}
                className="cursor-pointer"
                aria-label="Select all invoices"
              />
            </TableHead>
            <TableHead>FY</TableHead>
            <TableHead>Invoice No</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Payment Mode</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Sub Total</TableHead>
            <TableHead>GST</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {invoices.map((invoice) => {
            const invoiceId = invoice.id!;
            const isSelected = selectedInvoiceIds.includes(invoiceId);

            return (
              <TableRow
                key={invoice.id}
                onClick={(event) => handleRowClick(event, invoiceId)}
                data-state={isSelected ? "selected" : undefined}
                className="
                  cursor-pointer
                  hover:bg-muted/50
                "
              >
                <TableCell
                  className="px-4"
                  data-invoice-selection
                  onClick={(event) => event.stopPropagation()}
                  onPointerDown={(event) => event.stopPropagation()}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleInvoiceSelection(invoiceId)}
                    onClick={(event) => event.stopPropagation()}
                    className="cursor-pointer"
                    aria-label={`Select invoice ${invoice.invoiceNumber}`}
                  />
                </TableCell>
                <TableCell>{invoice.financialYear}</TableCell>
                <TableCell className="font-medium">
                  {invoice.invoiceNumber}
                </TableCell>
                <TableCell>{formatDate(invoice.invoiceDate) || "-"}</TableCell>
                <TableCell>{invoice.customerName || "-"}</TableCell>
                <TableCell>{invoice.paymentMode || "-"}</TableCell>
                <TableCell className="">{invoice.totalItems}</TableCell>
                <TableCell>{formatIndianCurrency(invoice.subtotal)}</TableCell>
                <TableCell>{formatIndianCurrency(invoice.totalGST)}</TableCell>
                <TableCell className="font-semibold">
                  {formatIndianCurrency(invoice.grandTotal)}
                </TableCell>
                <TableCell className="flex items-center gap-2">
                  <Button
                    onClick={(e) => handleInvoiceEdit(e, invoice.id!, router)}
                    className="flex gap-2 items-center cursor-pointer text-primary border-primary/30 bg-primary/10 hover:text-primary hover:bg-primary/20"
                    variant="outline"
                    size="sm"
                  >
                    <Edit className="h-4 w-4" /> <span>Edit</span>
                  </Button>
                  <Button
                    onClick={(e) => handleInvoiceDelete(e, invoice.id!)}
                    className="flex gap-2 items-center cursor-pointer text-destructive border-destructive/30 bg-destructive/10 hover:text-destructive hover:bg-destructive/20"
                    variant="outline"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" /> <span>Delete</span>
                  </Button>
                  <Button
                    onClick={(e) => handlePrintInvoice(e, invoice)}
                    className="flex gap-2 items-center cursor-pointer text-success border-success/30 bg-success/5 hover:text-success hover:bg-success/20"
                    variant="outline"
                    size="sm"
                    disabled={printing}
                  >
                    <Download className="h-4 w-4" />
                    <span>{printing ? "Printing..." : "Print"}</span>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
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
    </div>
  );
}
