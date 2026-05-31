"use client";

import { DashboardDataProvider } from "@/context/dashboard-data-context";
import { ReportsPageContent } from "@/components/reports/ReportsPageContent";

export default function ReportsPage() {
  return (
    <main className="min-h-screen bg-background p-4 text-foreground sm:p-6">
      <DashboardDataProvider>
        <ReportsPageContent />
      </DashboardDataProvider>
    </main>
  );
}
