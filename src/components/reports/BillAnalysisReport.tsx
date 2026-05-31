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
  BillAnalysis,
  DailySalesRow,
  formatCurrency,
} from "@/lib/reports/sales-report";

export function BillAnalysisReport({
  analysis,
  trendRows,
}: {
  analysis: BillAnalysis;
  trendRows: DailySalesRow[];
}) {
  const metrics = [
    ["Total Bills", analysis.totalBills.toLocaleString("en-IN")],
    ["Average Bill", formatCurrency(analysis.averageBillValue)],
    ["Highest Bill", formatCurrency(analysis.highestBill)],
    ["Lowest Bill", formatCurrency(analysis.lowestBill)],
  ];

  return (
    <ReportCard
      title="Bill Analysis Report"
      filename="bill-analysis"
      rows={[
        {
          "Total Bills": analysis.totalBills,
          "Average Bill Value": Math.round(analysis.averageBillValue),
          "Highest Bill": Math.round(analysis.highestBill),
          "Lowest Bill": Math.round(analysis.lowestBill),
        },
      ]}
    >
      <div className="grid min-w-0 gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {metrics.map(([label, value]) => (
            <div key={label} className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 text-lg font-semibold">{value}</p>
            </div>
          ))}
        </div>

        <div className="min-h-64 min-w-0">
          <ResponsiveContainer width="100%" height={256} minWidth={0}>
            <LineChart data={trendRows}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="billCount"
                stroke="#dc2626"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ReportCard>
  );
}
