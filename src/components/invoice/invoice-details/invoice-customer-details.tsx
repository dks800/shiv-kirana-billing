import { Invoice } from "@/types/invoice.types";

interface InvoiceCustomerDetailsProps {
  invoice: Invoice;
}

export function InvoiceCustomerDetails({
  invoice,
}: InvoiceCustomerDetailsProps) {
  const hasCustomerDetails =
    invoice.customerName ||
    invoice.customerPhone ||
    invoice.customerGSTIN ||
    invoice.customerAddress;

  if (!hasCustomerDetails) return null;

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
        <h2 className="text-lg font-semibold">Customer Details</h2>

        <p className="text-sm text-muted-foreground">
          Billing customer information
        </p>
      </div>
      <div
        className="
            grid
            gap-4
            sm:grid-cols-2
          "
      >
        {/* Customer Name */}
        <div>
          <p className="text-sm text-muted-foreground">Customer Name</p>

          <p className="mt-1 font-medium">{invoice.customerName || "-"}</p>
        </div>

        {/* Phone */}
        <div>
          <p className="text-sm text-muted-foreground">Phone Number</p>

          <p className="mt-1 font-medium">{invoice.customerPhone || "-"}</p>
        </div>

        {/* GSTIN */}
        <div>
          <p className="text-sm text-muted-foreground">GSTIN</p>

          <p className="mt-1 font-medium break-all">
            {invoice.customerGSTIN || "-"}
          </p>
        </div>

        {/* Address */}
        <div>
          <p className="text-sm text-muted-foreground">Address</p>

          <p className="mt-1 font-medium whitespace-pre-line">
            {invoice.customerAddress || "-"}
          </p>
        </div>
      </div>
    </div>
  );
}
