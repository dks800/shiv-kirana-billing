"use client";

import { useMemo, useState } from "react";

import Fuse from "fuse.js";

import { Product } from "@/types/product.types";

import { Input } from "@/components/ui/input";
import { ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarcodeScannerDialog } from "@/components/scanner/barcode-scanner-dialog";

interface InvoiceProductSearchProps {
  products: Product[];

  onSelect: (product: Product) => void;
}

export function InvoiceProductSearch({
  products,
  onSelect,
}: InvoiceProductSearchProps) {
  const [query, setQuery] = useState("");
  const [barcode, setBarcode] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);

  const fuse = useMemo(() => {
    return new Fuse(products, {
      keys: [
        "name",
        "barcodeNumber",
        "hsnCode",
      ],
      threshold: 0.3,
    });
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!query.trim()) return [];

    return fuse
      .search(query)
      .map((result) => result.item);
  }, [query, fuse]);

  return (
    <div className="space-y-3">
      {/* <div className="flex gap-2">
        <Input
          placeholder="Scan or enter barcode"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();

              const trimmed = barcode.trim();
              if (!trimmed) return;

              const found = products.find(
                (p) => p.barcodeNumber === trimmed || p.barcodeNumber?.includes(trimmed),
              );

              if (found) {
                onSelect(found);
                setBarcode("");
              } else {
                setQuery(trimmed);
              }
            }
          }}
        />

        <Button
          type="button"
          variant="outline"
          className="shrink-0 cursor-pointer"
          onClick={() => setScannerOpen(true)}
        >
          <ScanLine className="h-4 w-4" />
        </Button>
      </div> */}

      <Input
        placeholder="Search products..."
        value={query}
        onChange={(e) =>
          setQuery(e.target.value)
        }
      />

      {!!filteredProducts.length && (
        <div
          className="
            max-h-72
            overflow-y-auto
            rounded-xl
            border
          "
        >
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => {
                onSelect(product);

                setQuery("");
              }}
              className="
                flex
                w-full
                cursor-pointer
                items-center
                justify-between
                border-b
                p-3
                text-left
                transition-colors
                hover:bg-muted/50
              "
            >
              <div>
                <p className="font-medium">
                  {product.name}
                </p>

                <p
                  className="
                    text-xs
                    text-muted-foreground
                  "
                >
                  HSN: {product.hsnCode || "-"}
                </p>
              </div>

              <div className="text-right">
                <p className="font-medium">
                  ₹ {product.salePrice}
                </p>

                <p
                  className="
                    text-xs
                    text-muted-foreground
                  "
                >
                  GST {product.gstRate}%
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
          {scannerOpen && (
            <BarcodeScannerDialog
              open={scannerOpen}
              onOpenChange={setScannerOpen}
              onDetected={(detectedBarcode) => {
                const trimmed = detectedBarcode.trim();

                const found = products.find(
                  (p) => p.barcodeNumber === trimmed || p.barcodeNumber?.includes(trimmed),
                );

                if (found) {
                  onSelect(found);
                } else {
                  setQuery(trimmed);
                }

                setScannerOpen(false);
                setBarcode("");
              }}
            />
          )}
    </div>
  );
}