"use client";

import {
  BarChart3,
  FileText,
  Package,
  Settings,
} from "lucide-react";
import { useMemo } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { useDashboardData } from "@/context/dashboard-data-context";
import { toInvoiceDate } from "@/lib/invoice.utils";
import { useRouter } from "next/navigation";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function DashboardPage() {
  const { invoices, invoicesLoading } = useDashboardData();
  const router = useRouter();

  const { stats, recentInvoices } = useMemo(() => {
    return {
      stats: [
        {
          title: "Sales Invoice",
          path: "/dashboard/invoices",
          icon: FileText,
        },
        {
          title: "Products",
          path: "/dashboard/products",
          icon: Package,
        },
        {
          title: "Reports",
          path: "/dashboard/reports",
          icon: BarChart3,
        },
        {
          title: "Settings",
          path: "/dashboard/settings",
          icon: Settings,
        },
      ],
      recentInvoices: invoices.slice(0, 5),
    };
  }, [invoices]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome Back</h1>

        <p className="text-sm text-muted-foreground mt-1">
          Here is your business overview.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-center">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.title} className="shadow-sm rounded-2xl items-center cursor-pointer hover:bg-primary/10 transition" onClick={() => router.push(item?.path || "/dashboard")}>
              <CardContent className="gap-2 p-5 flex items-center justify-between">
                  <h1 className="text-xl text-muted-foreground">{item.title}</h1>
                <div className="h-11 w-11 rounded-xl bg-muted flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Activity</h3>
          </div>

          <div className="space-y-4">
            {recentInvoices.length ? (
              recentInvoices.map((invoice) => {
                const invoiceDate = toInvoiceDate(invoice.invoiceDate);

                return (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between border-b pb-4 last:border-b-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        Invoice #{invoice.invoiceNumber} created
                      </p>

                      <p className="text-xs text-muted-foreground mt-1">
                        {invoiceDate
                          ? invoiceDate.toLocaleDateString("en-IN")
                          : "Date unavailable"}
                      </p>
                    </div>

                    <span className="text-sm font-semibold">
                      {currencyFormatter.format(invoice.grandTotal || 0)}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">
                {invoicesLoading
                  ? "Loading recent activity..."
                  : "No recent invoices yet."}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
