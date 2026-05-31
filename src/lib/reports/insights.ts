import {
  BillAnalysis,
  GrowthComparison,
  ProductSalesRow,
  WeekdaySalesRow,
  formatCurrency,
  formatPercent,
} from "@/lib/reports/sales-report";

export function buildSalesInsights({
  growth,
  productRows,
  weekdayRows,
  billAnalysis,
}: {
  growth: GrowthComparison;
  productRows: ProductSalesRow[];
  weekdayRows: WeekdaySalesRow[];
  billAnalysis: BillAnalysis;
}) {
  const insights: string[] = [];
  const topProduct = productRows[0];
  const bestDay = [...weekdayRows].sort((a, b) => b.revenue - a.revenue)[0];
  const topFiveContribution = productRows
    .slice(0, 5)
    .reduce((total, row) => total + row.contribution, 0);

  if (growth.revenueDifference !== 0) {
    insights.push(
      `Sales ${
        growth.revenueDifference > 0 ? "increased" : "decreased"
      } ${formatPercent(Math.abs(growth.revenueGrowthPercent))} compared to previous month.`,
    );
  }

  if (topProduct) {
    insights.push(
      `${topProduct.productName} is the top revenue product with ${formatCurrency(
        topProduct.revenue,
      )} in sales.`,
    );
  }

  if (bestDay?.revenue) {
    insights.push(`${bestDay.day} generates the highest revenue.`);
  }

  if (productRows.length) {
    insights.push(
      `Top 5 products contribute ${formatPercent(topFiveContribution)} of product revenue.`,
    );
  }

  if (billAnalysis.averageBillValue) {
    insights.push(
      `Average bill value is ${formatCurrency(billAnalysis.averageBillValue)} for the selected range.`,
    );
  }

  return insights.length
    ? insights
    : ["No report insights are available for the selected date range yet."];
}
