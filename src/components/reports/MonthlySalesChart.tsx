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
  MonthlySalesRow,
  formatCurrency,
} from "@/lib/reports/sales-report";

export function MonthlySalesChart({ rows }: { rows: MonthlySalesRow[] }) {
  return (
    <ReportCard
      title="Month-wise Sales Analysis"
      filename="monthly-sales"
      rows={rows.map((row) => ({
        Month: row.month,
        "Total Sales": Math.round(row.totalSales),
        "Bill Count": row.billCount,
        "Average Bill Value": Math.round(row.averageBillValue),
      }))}
    >
      <div className="min-h-72 min-w-0">
        <ResponsiveContainer width="100%" height={288} minWidth={0}>
          <BarChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `₹${Number(value) / 1000}k`} />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Bar dataKey="totalSales" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ReportCard>
  );
}
