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
import { Edit, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { handleInvoiceEdit, handleInvoiceView } from "@/lib/invoice.utils";
import { DeleteProductDialog } from "../products/delete-product-dialog";
import { useState } from "react";
import { deleteInvoice } from "@/services/invoice.service";

interface InvoiceTableProps {
  invoices: Invoice[];
}

export function InvoiceTable({ invoices }: InvoiceTableProps) {
  const router = useRouter();
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

  return (
    <div className="rounded-xl border bg-card text-card-foreground">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-6">FY</TableHead>
            <TableHead>Invoice No</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Sub Total</TableHead>
            <TableHead>GST</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {invoices.map((invoice) => (
            <TableRow
              key={invoice.id}
              onClick={() => handleInvoiceView(invoice.id!, router)}
              className="
                cursor-pointer
                hover:bg-muted/50
              "
            >
              <TableCell className="px-6">{invoice.financialYear}</TableCell>
              <TableCell className="font-medium">
                {invoice.invoiceNumber}
              </TableCell>
              <TableCell>{formatDate(invoice.invoiceDate) || "-"}</TableCell>
              <TableCell>{invoice.customerName || "-"}</TableCell>
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
                  <Trash className="h-4 w-4" /> <span>Delete</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
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
