"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ReportCard } from "@/components/reports/ReportCard";
import {
  WeekdaySalesRow,
  formatCurrency,
} from "@/lib/reports/sales-report";

export function SalesByDayReport({ rows }: { rows: WeekdaySalesRow[] }) {
  const bestDay = [...rows].sort((a, b) => b.revenue - a.revenue)[0];
  const worstDay = [...rows].sort((a, b) => a.revenue - b.revenue)[0];

  return (
    <ReportCard
      title="Sales by Day of Week"
      filename="sales-by-day"
      rows={rows.map((row) => ({
        Day: row.day,
        Revenue: Math.round(row.revenue),
        "Bill Count": row.billCount,
      }))}
    >
      <div className="min-h-64 min-w-0">
        <ResponsiveContainer width="100%" height={256} minWidth={0}>
          <BarChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="day" />
            <YAxis tickFormatter={(value) => `₹${Number(value) / 1000}k`} />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Bar dataKey="revenue" fill="#9333ea" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border p-3 text-sm">
          Best Sales Day: <span className="font-semibold">{bestDay?.day ?? "-"}</span>
        </div>
        <div className="rounded-lg border p-3 text-sm">
          Worst Sales Day: <span className="font-semibold">{worstDay?.day ?? "-"}</span>
        </div>
      </div>
    </ReportCard>
  );
}
