"use client";

import { useRouter } from "next/navigation";

import { FileText } from "lucide-react";

import { Button } from "@/components/ui/button";

interface InvoiceEmptyStateProps {
  search?: string;
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

export function InvoiceEmptyState({
  search,
  hasFilters = false,
  onClearFilters,
}: InvoiceEmptyStateProps) {
  const router = useRouter();

  const isSearching = !!search?.trim();
  const showClearFilters = hasFilters && onClearFilters;

  return (
    <div
      className="
        flex
        flex-col
        items-center
        justify-center
        rounded-xl
        border
        border-dashed
        bg-card
        text-card-foreground
        px-6
        py-14
        text-center
      "
    >
      <div
        className="
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-full
          bg-muted
        "
      >
        <FileText className="h-7 w-7 text-muted-foreground" />
      </div>

      <h2 className="mt-4 text-lg font-semibold">
        {isSearching || hasFilters ? "No invoices found" : "No invoices yet"}
      </h2>

      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {hasFilters
          ? "Try clearing filters or choosing a different financial year or date range."
          : isSearching
          ? "Try searching with a different invoice number, customer name, or phone number."
          : "Create your first sales invoice to start managing billing history."}
      </p>

      {showClearFilters ? (
        <Button className="mt-6 cursor-pointer" variant="outline" onClick={onClearFilters}>
          Clear filters
        </Button>
      ) : !isSearching ? (
        <Button
          className="mt-6 cursor-pointer"
          onClick={() => router.push("/dashboard/invoices/new")}
        >
          Create new Invoice
        </Button>
      ) : null}
    </div>
  );
}
