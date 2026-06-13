"use client";

import {
  createContext,
  useCallback,
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
  addOptimisticProduct: (product: Product) => void;
  removeOptimisticProduct: (id: string) => void;
  replaceOptimisticProduct: (temporaryId: string, product: Product) => void;
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

  const addOptimisticProduct = useCallback((product: Product) => {
    setProducts((currentProducts) => [
      product,
      ...currentProducts.filter((item) => item.id !== product.id),
    ]);
  }, []);

  const removeOptimisticProduct = useCallback((id: string) => {
    setProducts((currentProducts) =>
      currentProducts.filter((product) => product.id !== id),
    );
  }, []);

  const replaceOptimisticProduct = useCallback(
    (temporaryId: string, product: Product) => {
      setProducts((currentProducts) => {
        const withoutDuplicates = currentProducts.filter(
          (item) => item.id !== temporaryId && item.id !== product.id,
        );

        return [product, ...withoutDuplicates];
      });
    },
    [],
  );

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
      addOptimisticProduct,
      removeOptimisticProduct,
      replaceOptimisticProduct,
    }),
    [
      invoices,
      invoicesLoading,
      products,
      productsLoading,
      addOptimisticProduct,
      removeOptimisticProduct,
      replaceOptimisticProduct,
    ],
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
