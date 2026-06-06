"use client";

import Link from "next/link";

import { usePathname, useRouter } from "next/navigation";

import {
  LayoutDashboard,
  FileText,
  Package,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import { useState } from "react";

import { logoutUser } from "@/services/auth.service";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useSettings } from "@/context/settings-context";
import { DashboardDataProvider } from "@/context/dashboard-data-context";
import { useIsMobile } from "@/hooks/useIsMobile";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard/",
    icon: LayoutDashboard,
  },
  {
    label: "Sale Invoices",
    href: "/dashboard/invoices/",
    icon: FileText,
  },
  {
    label: "Products",
    href: "/dashboard/products/",
    icon: Package,
  },
  {
    label: "Reports",
    href: "/dashboard/reports/",
    icon: BarChart3,
  },
  {
    label: "Settings",
    href: "/dashboard/settings/",
    icon: Settings,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const router = useRouter();
  const isMobile = useIsMobile();

  const { settings } = useSettings();

  const [mobileOpen, setMobileOpen] = useState(false);

  const businessName =
    settings.businessProfile.businessName ||
    settings.general.shopName ||
    "Shiv Kariyana Billing";

  const handleLogout = async () => {
    await logoutUser();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-background flex">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card text-card-foreground border-r transform transition-transform duration-200 lg:translate-x-0 lg:static lg:flex",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col w-full">
          <div className="p-3 lg:hidden text-right">
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1 rounded-md hover:bg-muted transition-colors bg-secondary inline-flex"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="border-b flex justify-center p-4 h-full sm:h-auto flex-col items-center">
            <Image
              src="/images/logo.webp"
              alt="Shiv Kariyana Logo"
              width={80}
              height={80}
              loading="lazy"
              unoptimized
              className="object-cover"
            />
            <h1 className="text-lg font-semibold flex text-center">
              {businessName}
            </h1>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;

              const segments = item.href.split('/').filter(Boolean);
              const isActive = segments.length === 1 
                ? pathname === item.href 
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all cursor-pointer",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon className="h-5 w-5" />

                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full justify-start gap-2 cursor-pointer transition-colors text-destructive bg-destructive/10 hover:bg-destructive/20 border-destructive/30"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-card text-card-foreground border-b flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40">
          <div className="flex items-center gap-3 w-full">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex gap-2 justify-between  w-full">
              <h2 className="text-lg font-semibold">Dashboard</h2>
              <button
                className="flex gap-2 items-center p-2 rounded-xl cursor-pointer text-destructive bg-destructive/10 hover:bg-destructive/20 border-destructive/30"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" /> {isMobile ? "" : "Logout"}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
          <DashboardDataProvider>{children}</DashboardDataProvider>
        </main>
      </div>
    </div>
  );
}
