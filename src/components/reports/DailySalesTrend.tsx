"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ReportCard } from "@/components/reports/ReportCard";
import {
  DailySalesRow,
  formatCurrency,
} from "@/lib/reports/sales-report";

export function DailySalesTrend({
  rows,
  highestSalesDay,
  lowestSalesDay,
  averageDailySales,
}: {
  rows: DailySalesRow[];
  highestSalesDay: DailySalesRow | null;
  lowestSalesDay: DailySalesRow | null;
  averageDailySales: number;
}) {
  return (
    <ReportCard
      title="Current Month Daily Sales Trend"
      filename="daily-sales"
      rows={rows.map((row) => ({
        Day: row.day,
        "Total Sales": Math.round(row.totalSales),
        "Bill Count": row.billCount,
      }))}
    >
      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="min-h-72 min-w-0">
          <ResponsiveContainer width="100%" height={288} minWidth={0}>
            <LineChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" />
              <YAxis tickFormatter={(value) => `₹${Number(value) / 1000}k`} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Line
                type="monotone"
                dataKey="totalSales"
                stroke="#0f766e"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Metric label="Highest Sales Day" value={highestSalesDay?.day ?? "-"} />
          <Metric label="Lowest Sales Day" value={lowestSalesDay?.day ?? "-"} />
          <Metric
            label="Average Daily Sales"
            value={formatCurrency(averageDailySales)}
          />
        </div>
      </div>
    </ReportCard>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
