import { type Dispatch, type SetStateAction } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { PaymentMode } from "@/types/invoice.types";

interface FilterState {
  financialYear: string;
  fromDate: string;
  toDate: string;
  paymentMode: "" | PaymentMode;
}

interface FilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draftFilters: FilterState;
  setDraftFilters: Dispatch<SetStateAction<FilterState>>;
  financialYearOptions: string[];
  handleClearFilters: () => void;
  handleApplyFilters: () => void;
}

export const FilterModal = ({
  open,
  onOpenChange,
  draftFilters,
  setDraftFilters,
  financialYearOptions,
  handleClearFilters,
  handleApplyFilters,
}: FilterModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl">
        <DialogTitle>Filter invoices</DialogTitle>
        <div className="space-y-4">
          <label className="space-y-1 text-sm">
            <span>Financial year</span>
            <select
              value={draftFilters.financialYear}
              onChange={(event) =>
                setDraftFilters((prev) => ({
                  ...prev,
                  financialYear: event.target.value,
                }))
              }
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">All</option>
              {financialYearOptions.map((financialYear) => (
                <option key={financialYear} value={financialYear}>
                  {financialYear}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span>Payment Mode</span>
            <select
              value={draftFilters.paymentMode}
              onChange={(event) =>
                setDraftFilters((prev) => ({
                  ...prev,
                  paymentMode: event.target.value as "" | PaymentMode,
                }))
              }
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="">All</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
            </select>
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span>From date</span>
              <Input
                type="date"
                value={draftFilters.fromDate}
                onChange={(event) =>
                  setDraftFilters((prev) => ({
                    ...prev,
                    fromDate: event.target.value,
                  }))
                }
              />
            </label>

            <label className="space-y-1 text-sm">
              <span>To date</span>
              <Input
                type="date"
                value={draftFilters.toDate}
                min={draftFilters.fromDate || undefined}
                onChange={(event) =>
                  setDraftFilters((prev) => ({
                    ...prev,
                    toDate: event.target.value,
                  }))
                }
              />
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={handleClearFilters}
          >
            Clear
          </Button>
          <Button
            type="button"
            className="cursor-pointer"
            onClick={handleApplyFilters}
          >
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
