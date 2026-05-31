"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { ReportCard } from "@/components/reports/ReportCard";
import {
  GrowthComparison,
  formatCurrency,
  formatPercent,
} from "@/lib/reports/sales-report";

export function MonthlyGrowthComparison({
  growth,
}: {
  growth: GrowthComparison;
}) {
  const positive = growth.revenueDifference >= 0;
  const Icon = positive ? ArrowUpRight : ArrowDownRight;

  return (
    <ReportCard
      title="Monthly Growth Comparison"
      filename="monthly-growth"
      rows={[
        {
          "Current Month Revenue": Math.round(growth.currentRevenue),
          "Previous Month Revenue": Math.round(growth.previousRevenue),
          "Growth %": growth.revenueGrowthPercent.toFixed(1),
          "Revenue Difference": Math.round(growth.revenueDifference),
          "Bill Count Difference": growth.billCountDifference,
        },
      ]}
    >
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Growth</p>
          <p className="mt-2 flex items-center gap-2 text-2xl font-semibold">
            <Icon className={positive ? "text-emerald-600" : "text-red-600"} />
            {formatPercent(growth.revenueGrowthPercent)}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Revenue Difference</p>
          <p className="mt-2 text-2xl font-semibold">
            {formatCurrency(growth.revenueDifference)}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Bill Count Difference</p>
          <p className="mt-2 text-2xl font-semibold">
            {growth.billCountDifference >= 0 ? "+" : ""}
            {growth.billCountDifference}
          </p>
        </div>
      </div>
    </ReportCard>
  );
}
