"use client";

import { FileText, Receipt, TrendingUp, WalletCards } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { BillAnalysis, formatCurrency } from "@/lib/reports/sales-report";

export function ReportsSummaryCards({
  totalSales,
  totalGst,
  billAnalysis,
  growthPercent,
}: {
  totalSales: number;
  totalGst: number;
  billAnalysis: BillAnalysis;
  growthPercent: number;
}) {
  const cards = [
    {
      label: "Total Sales",
      value: formatCurrency(totalSales),
      icon: WalletCards,
    },
    {
      label: "Bills",
      value: String(billAnalysis.totalBills),
      icon: FileText,
    },
    {
      label: "Average Bill",
      value: formatCurrency(billAnalysis.averageBillValue),
      icon: TrendingUp,
    },
    {
      label: "GST Collected",
      value: formatCurrency(totalGst),
      icon: Receipt,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card key={card.label} className="rounded-lg">
            <CardContent className="flex items-start justify-between px-4">
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="mt-2 text-2xl font-semibold">{card.value}</p>
                {card.label === "Total Sales" ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {growthPercent >= 0 ? "+" : ""}
                    {growthPercent.toFixed(1)}% vs previous month
                  </p>
                ) : null}
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Icon className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
