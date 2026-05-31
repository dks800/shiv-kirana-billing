"use client";

import { Input } from "@/components/ui/input";
import {
  ReportRangePreset,
  getDateInputValue,
} from "@/lib/reports/sales-report";

const presets: { label: string; value: ReportRangePreset }[] = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "This Year", value: "year" },
  { label: "Custom", value: "custom" },
];

export function ReportsFilters({
  preset,
  from,
  to,
  onPresetChange,
  onFromChange,
  onToChange,
}: {
  preset: ReportRangePreset;
  from: Date;
  to: Date;
  onPresetChange: (preset: ReportRangePreset) => void;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Sales, GST, product, and billing analysis from invoices.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="grid gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            Period
          </label>
          <select
            value={preset}
            onChange={(event) =>
              onPresetChange(event.target.value as ReportRangePreset)
            }
            className="h-9 rounded-lg border bg-background text-sm p-2"
          >
            {presets.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            From
          </label>
          <Input
            type="date"
            value={getDateInputValue(from)}
            disabled={preset !== "custom"}
            onChange={(event) => onFromChange(event.target.value)}
          />
        </div>

        <div className="grid gap-1">
          <label className="text-xs font-medium text-muted-foreground">To</label>
          <Input
            type="date"
            value={getDateInputValue(to)}
            disabled={preset !== "custom"}
            onChange={(event) => onToChange(event.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
