import { InvoiceDetails } from "@/components/invoice/invoice-details/invoice-details";

interface InvoiceDetailsPageProps {
  params: Promise<{
    invoiceId: string;
  }>;
}

export default async function InvoiceDetailsPage({
  params,
}: InvoiceDetailsPageProps) {
  const { invoiceId } = await params;

  return (
    <div className="p-4 md:p-6">
      <InvoiceDetails invoiceId={invoiceId} />
    </div>
  );
}
