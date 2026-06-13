"use client";

import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import { Download, Filter, Printer, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { InvoiceCard } from "./invoice-card";
import { InvoiceEmptyState } from "./invoice-empty-state";
import { InvoiceTable } from "./invoice-table";
import {Loader} from "../ui/loader";
import { useIsMobile } from "@/hooks/useIsMobile";
import { Button } from "@/components/ui/button";
import { downloadInvoiceListPdf } from "@/lib/exports/invoice-list-pdf";
import { downloadSelectedInvoicesPrintPdf } from "@/lib/exports/invoice-print-pdf";
import toast from "react-hot-toast";
import {
  getFinancialYear,
  normalizeDateInput,
  toInvoiceDate,
} from "@/lib/invoice.utils";
import { FilterModal } from "./filter-modal";
import { useDashboardData } from "@/context/dashboard-data-context";
import { PaymentMode } from "@/types/invoice.types";

interface InvoiceFilters {
  financialYear: string;
  fromDate: string;
  toDate: string;
  paymentMode: "" | PaymentMode;
}

const emptyFilters: InvoiceFilters = {
  financialYear: "",
  fromDate: "",
  toDate: "",
  paymentMode: "",
};

export function InvoiceList() {
  const { invoices, invoicesLoading } = useDashboardData();
  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<InvoiceFilters>(emptyFilters);
  const [draftFilters, setDraftFilters] =
    useState<InvoiceFilters>(emptyFilters);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
  const [printingSelected, setPrintingSelected] = useState(false);
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

      if (filters.paymentMode && invoice.paymentMode !== filters.paymentMode) {
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
        "paymentMode",
        "subtotal",
        "totalGST",
        "grandTotal",
      ],

      threshold: 0.3,
    });

    return fuse.search(search).map((result) => result.item);
  }, [filters, search, invoices]);

  const selectableInvoiceIds = useMemo(() => {
    return filteredInvoices
      .map((invoice) => invoice.id)
      .filter(Boolean) as string[];
  }, [filteredInvoices]);

  const selectedInvoices = useMemo(() => {
    const selectedIds = new Set(selectedInvoiceIds);
    return filteredInvoices.filter(
      (invoice) => invoice.id && selectedIds.has(invoice.id),
    );
  }, [filteredInvoices, selectedInvoiceIds]);

  const allFilteredInvoicesSelected =
    selectableInvoiceIds.length > 0 &&
    selectableInvoiceIds.every((id) => selectedInvoiceIds.includes(id));

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

  function handleToggleInvoiceSelection(invoiceId: string) {
    setSelectedInvoiceIds((currentIds) =>
      currentIds.includes(invoiceId)
        ? currentIds.filter((id) => id !== invoiceId)
        : [...currentIds, invoiceId],
    );
  }

  function handleToggleSelectAllInvoices() {
    setSelectedInvoiceIds(
      allFilteredInvoicesSelected ? [] : selectableInvoiceIds,
    );
  }

  function handlePrintSelectedInvoices() {
    if (!selectedInvoices.length || printingSelected) {
      return;
    }

    try {
      setPrintingSelected(true);
      downloadSelectedInvoicesPrintPdf(selectedInvoices);
      toast.success(`${selectedInvoices.length} invoice PDF downloaded`);
    } catch (error) {
      console.error(error);
      toast.error(
        `Failed to print selected invoices - ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    } finally {
      setPrintingSelected(false);
    }
  }

  if (invoicesLoading) {
    return (
        <Loader />
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2 md:flex md:items-center md:gap-2 md:space-y-0">
        <div className="relative w-full md:flex-1">
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
            className="w-full pl-9"
          />
        </div>

        <div className="grid grid-cols-3 gap-2 md:flex md:items-center md:justify-end">
          <span className="hidden rounded-md border bg-muted/30 px-2 py-1 text-xs text-muted-foreground md:inline-flex">
            {selectedInvoices.length} selected
          </span>

          <Button
            type="button"
            variant="outline"
            className="min-w-0 cursor-pointer whitespace-nowrap px-2 hover:bg-primary/10"
            onClick={handlePrintSelectedInvoices}
            disabled={!selectedInvoices.length || printingSelected}
          >
            <Printer className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {printingSelected
                ? "Printing..."
                : isMobile
                  ? "Print"
                  : "Print Selected"}
            </span>
          </Button>

          <Button
            type="button"
            variant="outline"
            className="min-w-0 cursor-pointer whitespace-nowrap border-success/30 bg-success/5 px-2 text-success hover:bg-success/20"
            onClick={handleExportInvoiceList}
            disabled={!filteredInvoices.length}
          >
            <Download className="h-4 w-4 shrink-0" />
            <span className="truncate">{isMobile ? "Export" : "Export List"}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            className="min-w-0 cursor-pointer whitespace-nowrap px-2 hover:bg-primary/10"
            onClick={handleOpenFilters}
          >
            <Filter className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {activeFilterCount ? `Filters (${activeFilterCount})` : "Filters"}
            </span>
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

      {filteredInvoices.length > 0 && isMobile ? (
        <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground md:hidden">
          <span>{selectedInvoices.length} selected</span>
          <span>{filteredInvoices.length} invoices</span>
        </div>
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
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              isSelected={Boolean(
                invoice.id && selectedInvoiceIds.includes(invoice.id),
              )}
              onToggleSelection={handleToggleInvoiceSelection}
            />
          ))}
        </div>
      ) : (
        <div className="hidden md:block">
          <InvoiceTable
            invoices={filteredInvoices}
            selectedInvoiceIds={selectedInvoiceIds}
            allInvoicesSelected={allFilteredInvoicesSelected}
            onToggleInvoiceSelection={handleToggleInvoiceSelection}
            onToggleSelectAllInvoices={handleToggleSelectAllInvoices}
          />
        </div>
      )}
    </div>
  );
}
