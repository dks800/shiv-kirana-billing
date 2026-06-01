"use client";

import { useMemo, useState } from "react";

import { BillAnalysisReport } from "@/components/reports/BillAnalysisReport";
import { DailySalesTrend } from "@/components/reports/DailySalesTrend";
import { GSTReport } from "@/components/reports/GSTReport";
import { MonthlyGrowthComparison } from "@/components/reports/MonthlyGrowthComparison";
import { MonthlySalesChart } from "@/components/reports/MonthlySalesChart";
import { ProductSalesReport } from "@/components/reports/ProductSalesReport";
import { ReportsFilters } from "@/components/reports/ReportsFilters";
import { ReportsSummaryCards } from "@/components/reports/ReportsSummaryCards";
import { SalesByDayReport } from "@/components/reports/SalesByDayReport";
import { SalesInsights } from "@/components/reports/SalesInsights";
import { Loader } from "@/components/ui/loader";
import { useDashboardData } from "@/context/dashboard-data-context";
import { buildSalesInsights } from "@/lib/reports/insights";
import {
  ReportRangePreset,
  buildReportRange,
  filterInvoicesByRange,
  formatCurrency,
  getBillAnalysis,
  getDailySalesTrend,
  getDefaultReportRange,
  getGrowthComparison,
  getGstReport,
  getMonthlySales,
  getProductSales,
  getWeekdaySales,
} from "@/lib/reports/sales-report";

export function ReportsPageContent() {
  const { invoices, invoicesLoading, products, productsLoading } =
    useDashboardData();
  const defaultRange = useMemo(() => getDefaultReportRange(), []);
  const [preset, setPreset] = useState<ReportRangePreset>(defaultRange.preset);
  const [customFrom, setCustomFrom] = useState(
    defaultRange.from.toISOString().slice(0, 10),
  );
  const [customTo, setCustomTo] = useState(
    defaultRange.to.toISOString().slice(0, 10),
  );

  const range = useMemo(
    () => buildReportRange(preset, customFrom, customTo),
    [preset, customFrom, customTo],
  );

  const reportData = useMemo(() => {
    const filteredInvoices = filterInvoicesByRange(invoices, range);
    const gstReport = getGstReport(filteredInvoices);
    const productRows = getProductSales(filteredInvoices, products);
    const dailyTrend = getDailySalesTrend(filteredInvoices);
    const weekdayRows = getWeekdaySales(filteredInvoices);
    const billAnalysis = getBillAnalysis(filteredInvoices);
    const growth = getGrowthComparison(invoices);
    const totalSales = filteredInvoices.reduce(
      (total, invoice) => total + Number(invoice.grandTotal || 0),
      0,
    );

    return {
      filteredInvoices,
      gstReport,
      monthlyRows: getMonthlySales(invoices),
      dailyTrend,
      productRows,
      weekdayRows,
      billAnalysis,
      growth,
      totalSales,
      insights: buildSalesInsights({
        growth,
        productRows,
        weekdayRows,
        billAnalysis,
      }),
    };
  }, [invoices, products, range]);

  const loading = invoicesLoading || productsLoading;

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-5 pb-12">
      <ReportsFilters
        preset={preset}
        from={range.from}
        to={range.to}
        onPresetChange={setPreset}
        onFromChange={(value) => {
          setPreset("custom");
          setCustomFrom(value);
        }}
        onToChange={(value) => {
          setPreset("custom");
          setCustomTo(value);
        }}
      />

      <ReportsSummaryCards
        totalSales={reportData.totalSales}
        totalGst={reportData.gstReport.totalGstCollected}
        billAnalysis={reportData.billAnalysis}
        growthPercent={reportData.growth.revenueGrowthPercent}
      />

      <SalesInsights insights={reportData.insights} />

      <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
        Showing {reportData.filteredInvoices.length} invoices from{" "}
        {range.from.toLocaleDateString("en-IN")} to{" "}
        {range.to.toLocaleDateString("en-IN")} with total sales of{" "}
        {formatCurrency(reportData.totalSales)}.
      </div>

      <div className="grid min-w-0 gap-5 xl:grid-cols-2">
        <GSTReport
          rows={reportData.gstReport.breakdown}
          totalTaxableValue={reportData.gstReport.totalTaxableValue}
          totalGstCollected={reportData.gstReport.totalGstCollected}
        />
        <MonthlySalesChart rows={reportData.monthlyRows} />
        <DailySalesTrend
          rows={reportData.dailyTrend.rows}
          highestSalesDay={reportData.dailyTrend.highestSalesDay}
          lowestSalesDay={reportData.dailyTrend.lowestSalesDay}
          averageDailySales={reportData.dailyTrend.averageDailySales}
        />
        <SalesByDayReport rows={reportData.weekdayRows} />
        <BillAnalysisReport
          analysis={reportData.billAnalysis}
          trendRows={reportData.dailyTrend.rows}
        />
        <MonthlyGrowthComparison growth={reportData.growth} />
      </div>

      <ProductSalesReport rows={reportData.productRows} />
    </div>
  );
}
