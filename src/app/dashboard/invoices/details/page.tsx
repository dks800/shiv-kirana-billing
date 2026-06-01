"use client";
import { InvoiceDetails } from "@/components/invoice/invoice-details/invoice-details";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function InvoiceDetailContent() {
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get("id");

  return (
    <div className="p-4 md:p-6">
      <InvoiceDetails invoiceId={invoiceId!} />
    </div>
  );
}

export default function InvoiceDetailsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InvoiceDetailContent />
    </Suspense>
  );
}
