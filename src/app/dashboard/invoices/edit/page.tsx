"use client";
import { InvoiceForm } from "@/components/invoice/invoice-form";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function EditInvoiceContent() {
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get("id");

  return <InvoiceForm mode="edit" invoiceId={invoiceId!} />;
}

export default function EditInvoicePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditInvoiceContent />
    </Suspense>
  );
}
