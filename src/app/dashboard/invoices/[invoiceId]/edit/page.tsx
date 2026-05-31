import { InvoiceForm } from "@/components/invoice/invoice-form";

interface EditInvoicePageProps {
  params: Promise<{
    invoiceId: string;
  }>;
}

export default async function EditInvoicePage({ params }: EditInvoicePageProps) {
  const { invoiceId } = await params;

  return <InvoiceForm mode="edit" invoiceId={invoiceId} />;
}
