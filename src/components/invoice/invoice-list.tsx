"use client";

import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import { Download, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { InvoiceCard } from "./invoice-card";
import { InvoiceEmptyState } from "./invoice-empty-state";
import { InvoiceTable } from "./invoice-table";
import {Loader} from "../ui/loader";
import { useIsMobile } from "@/hooks/useIsMobile";
import { Button } from "@/components/ui/button";
import { downloadInvoiceListPdf } from "@/lib/exports/invoice-list-pdf";
import toast from "react-hot-toast";
import {
  getFinancialYear,
  normalizeDateInput,
  toInvoiceDate,
} from "@/lib/invoice.utils";
import { FilterModal } from "./filter-modal";
import { useDashboardData } from "@/context/dashboard-data-context";

interface InvoiceFilters {
  financialYear: string;
  fromDate: string;
  toDate: string;
}

const emptyFilters: InvoiceFilters = {
  financialYear: "",
  fromDate: "",
  toDate: "",
};

export function InvoiceList() {
  const { invoices, invoicesLoading } = useDashboardData();
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<InvoiceFilters>(emptyFilters);
  const [draftFilters, setDraftFilters] =
    useState<InvoiceFilters>(emptyFilters);
  const isMobile = useIsMobile();

  const financialYearOptions = useMemo(() => {
    const currentFinancialYear = getFinancialYear(new Date());
    const years = new Set<string>([currentFinancialYear]);

    invoices.forEach((invoice) => {
      if (invoice.financialYear) {
        years.add(invoice.financialYear);
      }
    });

    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [invoices]);

  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(Boolean).length;
  }, [filters]);

  const filteredInvoices = useMemo(() => {
    const fromDate = normalizeDateInput(filters.fromDate);
    const toDate = normalizeDateInput(filters.toDate, true);

    const filteredByControls = invoices.filter((invoice) => {
      if (
        filters.financialYear &&
        invoice.financialYear !== filters.financialYear
      ) {
        return false;
      }

      if (fromDate || toDate) {
        const invoiceDate = toInvoiceDate(invoice.invoiceDate);

        if (!invoiceDate) {
          return false;
        }

        if (fromDate && invoiceDate < fromDate) {
          return false;
        }

        if (toDate && invoiceDate > toDate) {
          return false;
        }
      }

      return true;
    });

    if (!search.trim()) {
      return filteredByControls;
    }

    const fuse = new Fuse(filteredByControls, {
      keys: [
        "invoiceNumber",
        "customerName",
        "financialYear",
        "subtotal",
        "totalGST",
        "grandTotal",
      ],

      threshold: 0.3,
    });

    return fuse.search(search).map((result) => result.item);
  }, [filters, search, invoices]);

  function handleOpenFilters() {
    setDraftFilters(filters);
    setFilterOpen(true);
  }

  function handleApplyFilters() {
    setFilters(draftFilters);
    setFilterOpen(false);
  }

  function handleClearFilters() {
    setDraftFilters(emptyFilters);
    setFilters(emptyFilters);
    setFilterOpen(false);
  }

  function handleExportInvoiceList() {
    if (!filteredInvoices.length) {
      toast.error("No invoices available to export");
      return;
    }

    downloadInvoiceListPdf(filteredInvoices);
    toast.success("Invoice list downloaded");
  }

  if (invoicesLoading) {
    return (
        <Loader />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search
            className="
              absolute
              left-3
              top-1/2
              h-4
              w-4
              -translate-y-1/2
              text-muted-foreground
            "
          />

          <Input
            placeholder="Search invoice, customer, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer hover:bg-success/20 bg-success/5 text-success border-success/30"
            onClick={handleExportInvoiceList}
            disabled={!filteredInvoices.length}
          >
            <Download className="h-4 w-4" />
            {isMobile ? "Export" : "Export List"}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="cursor-pointer hover:bg-primary/10"
            onClick={handleOpenFilters}
          >
            <Filter className="h-4 w-4" />
            {activeFilterCount ? `Filters (${activeFilterCount})` : "Filters"}
          </Button>
        </div>
      </div>

      {filterOpen ? (
        <FilterModal
          open={filterOpen}
          onOpenChange={setFilterOpen}
          draftFilters={draftFilters}
          setDraftFilters={setDraftFilters}
          financialYearOptions={financialYearOptions}
          handleClearFilters={handleClearFilters}
          handleApplyFilters={handleApplyFilters}
        />
      ) : null}

      {filteredInvoices.length === 0 ? (
        <InvoiceEmptyState
          search={search}
          hasFilters={activeFilterCount > 0}
          onClearFilters={handleClearFilters}
        />
      ) : isMobile ? (
        <div className="space-y-3 md:hidden">
          {filteredInvoices.map((invoice) => (
            <InvoiceCard key={invoice.id} invoice={invoice} />
          ))}
        </div>
      ) : (
        <div className="hidden md:block">
          <InvoiceTable invoices={filteredInvoices} />
        </div>
      )}
    </div>
  );
}
