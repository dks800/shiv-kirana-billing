"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { subscribeToInvoices } from "@/services/invoice.service";
import { subscribeToProducts } from "@/services/product.service";
import { Invoice } from "@/types/invoice.types";
import { Product } from "@/types/product.types";

type DashboardDataContextType = {
  invoices: Invoice[];
  invoicesLoading: boolean;
  products: Product[];
  productsLoading: boolean;
};

const DashboardDataContext = createContext<DashboardDataContextType | null>(
  null,
);

export function DashboardDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    const unsubscribeInvoices = subscribeToInvoices(
      (nextInvoices) => {
        setInvoices(nextInvoices);
        setInvoicesLoading(false);
      },
      (error) => {
        console.error("Failed to subscribe to invoices:", error);
        setInvoicesLoading(false);
      },
    );

    const unsubscribeProducts = subscribeToProducts(
      (nextProducts) => {
        setProducts(nextProducts);
        setProductsLoading(false);
      },
      (error) => {
        console.error("Failed to subscribe to products:", error);
        setProductsLoading(false);
      },
    );

    return () => {
      unsubscribeInvoices();
      unsubscribeProducts();
    };
  }, []);

  const value = useMemo(
    () => ({
      invoices,
      invoicesLoading,
      products,
      productsLoading,
    }),
    [invoices, invoicesLoading, products, productsLoading],
  );

  return (
    <DashboardDataContext.Provider value={value}>
      {children}
    </DashboardDataContext.Provider>
  );
}

export function useDashboardData() {
  const context = useContext(DashboardDataContext);

  if (!context) {
    throw new Error(
      "useDashboardData must be used inside DashboardDataProvider",
    );
  }

  return context;
}
