"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { ReportCard } from "@/components/reports/ReportCard";
import {
  GstReportRow,
  formatCurrency,
} from "@/lib/reports/sales-report";

const colors = ["#64748b", "#0f766e", "#2563eb", "#dc2626", "#9333ea"];

export function GSTReport({
  rows,
  totalTaxableValue,
  totalGstCollected,
}: {
  rows: GstReportRow[];
  totalTaxableValue: number;
  totalGstCollected: number;
}) {
  const chartRows = rows.filter((row) => row.gstCollected > 0);
  const exportRows = rows.map((row) => ({
    "GST Rate": `${row.gstRate}%`,
    "Taxable Value": Math.round(row.taxableValue),
    "GST Collected": Math.round(row.gstCollected),
  }));

  return (
    <ReportCard title="GST Collection Analysis" filename="gst-report" rows={exportRows}>
      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="min-h-64 min-w-0">
          <ResponsiveContainer width="100%" height={256} minWidth={0}>
            <PieChart>
              <Pie
                data={chartRows}
                dataKey="gstCollected"
                nameKey="gstRate"
                innerRadius={52}
                outerRadius={92}
                paddingAngle={2}
                label={(entry) => `${entry.name}%`}
              >
                {chartRows.map((row, index) => (
                  <Cell key={row.gstRate} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                labelFormatter={(label) => `${label}% GST`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="min-w-0 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Total Taxable Value</p>
              <p className="mt-1 text-xl font-semibold">
                {formatCurrency(totalTaxableValue)}
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Total GST Collected</p>
              <p className="mt-1 text-xl font-semibold">
                {formatCurrency(totalGstCollected)}
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border">
            {rows.map((row) => (
              <div
                key={row.gstRate}
                className="grid grid-cols-3 gap-2 border-b p-2 text-sm last:border-b-0"
              >
                <span>{row.gstRate}%</span>
                <span>{formatCurrency(row.taxableValue)}</span>
                <span className="font-medium">
                  {formatCurrency(row.gstCollected)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ReportCard>
  );
}
