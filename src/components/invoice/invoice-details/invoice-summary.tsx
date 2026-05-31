import { formatIndianCurrency } from "@/lib/utils";
import { Invoice } from "@/types/invoice.types";

interface InvoiceSummaryProps {
  invoice: Invoice;
}

export function InvoiceSummary({ invoice }: InvoiceSummaryProps) {
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
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Invoice Summary</h2>

        <p className="text-sm text-muted-foreground">
          Final invoice totals and tax summary
        </p>
      </div>

      <div className="space-y-3">
        {/* Subtotal */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Sub Total</p>

          <p className="font-medium">
            {formatIndianCurrency(invoice.subtotal)}
          </p>
        </div>

        {/* CGST */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">CGST</p>

          <p className="font-medium">
            {formatIndianCurrency(invoice.totalCGST)}
          </p>
        </div>

        {/* SGST */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">SGST</p>

          <p className="font-medium">
            {formatIndianCurrency(invoice.totalSGST)}
          </p>
        </div>

        {/* Total GST */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Total GST</p>

          <p className="font-medium">
            {formatIndianCurrency(invoice.totalGST)}
          </p>
        </div>

        {/* Round Off */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Round Off</p>

          <p className="font-medium">
            {formatIndianCurrency(invoice.roundUp || 0)}
          </p>
        </div>

        {/* Divider */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mt-2">
            <p className="text-lg font-semibold">Grand Total</p>

            <p className="text-2xl font-bold">
              {formatIndianCurrency(invoice.grandTotal || invoice.grandTotal)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
