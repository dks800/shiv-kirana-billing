"use client";
import { InvoiceList } from "@/components/invoice/invoice-list";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/useIsMobile";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function InvoicesPage() {
  const router = useRouter();
  const isMobile = useIsMobile();

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex gap-2 items-center justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Sales Invoices</h1>
          <p className="text-sm text-muted-foreground">
            View and manage invoice history.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Button
            className="cursor-pointer hover:bg-primary/80"
            onClick={() => router.push("/dashboard/invoices/new")}
          >
            <PlusCircle className="h-4 w-4" />
            {isMobile ? "Invoice" : "Create Invoice"}
          </Button>
        </div>
      </div>
      <InvoiceList />
    </div>
  );
}
