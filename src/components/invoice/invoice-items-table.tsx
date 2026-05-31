"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { InvoiceItem } from "@/types/invoice.types";
import { DeleteProductDialog } from "../products/delete-product-dialog";
import { useState } from "react";
import { formatIndianCurrency } from "@/lib/utils";
import { Input } from "../ui/input";

interface InvoiceItemsTableProps {
  items: InvoiceItem[];
  onRemoveItem: (productId: string) => void;
  onQuantityChange: (productId: string, quantity: number) => void;
}

export function InvoiceItemsTable({
  items,
  onQuantityChange,
  onRemoveItem,
}: InvoiceItemsTableProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InvoiceItem | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDeleteProduct = async () => {
    setIsDeleting(true);
    await onRemoveItem(selectedProduct?.productId as string);
    setIsDeleting(false);
    setSelectedProduct(null);
  };

  return (
    <div className="overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <table className="w-full">
          <thead
            className="
              border-b
              bg-muted/40
              text-sm
            "
          >
            <tr>
              <th className="p-3 text-left">Product</th>
              <th className="p-3 text-left">HSN</th>
              <th className="p-3 text-center">Qty</th>
              <th className="p-3 text-right">Rate</th>
              <th className="p-3 text-right">GST</th>
              <th className="p-3 text-right">Total</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr key={item.productId} className="border-b">
                <td className="p-3">
                  <div>
                    <p className="font-medium">{item.name}</p>

                    <p
                      className="
                        text-xs
                        text-muted-foreground
                      "
                    >
                      {item.unit}
                    </p>
                  </div>
                </td>

                <td className="p-3">{item.hsnCode || "-"}</td>

                <td className="p-3">
                  <div
                    className="
                      flex
                      items-center
                      justify-center
                      gap-2
                    "
                  >
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        onQuantityChange(item.productId, Number(e.target.value))
                      }
                      className="h-8 text-center w-auto min-w-[1rem]"
                    />
                  </div>
                </td>

                <td className="p-3 text-right">₹ {formatIndianCurrency(item.rate)}</td>

                <td className="p-3 text-right">{item.gstRate}%</td>

                <td className="p-3 text-right font-medium">
                  ₹ {formatIndianCurrency(item.totalAmount)}
                </td>

                <td className="p-3 text-right">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="cursor-pointer"
                    onClick={() => {
                      setDeleteOpen(true);
                      setSelectedProduct(item);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-3 p-3 md:hidden">
        {items.map((item) => (
          <div
            key={item.productId}
            className="
              rounded-2xl
              border
              p-4
              shadow-sm
            "
          >
            <div
              className="
                flex
                items-start
                justify-between
                gap-3
              "
            >
              <div>
                <p className="font-medium">{item.name}</p>

                <p
                  className="
                    text-xs
                    text-muted-foreground
                  "
                >
                  HSN: {item.hsnCode || "-"}
                </p>
              </div>

              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="cursor-pointer bg-destructive/10 text-destructive rounded-full hover:bg-destructive/20 hover:text-destructive"
                onClick={() => {
                  setDeleteOpen(true);
                  setSelectedProduct(item);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div
              className="
                mt-4
                grid
                grid-cols-3
                gap-2
                text-sm
              "
            >
              <div>
                <p className="text-muted-foreground">Rate</p>

                <p>₹ {formatIndianCurrency(item.rate)}</p>
              </div>

              <div>
                <p className="text-muted-foreground">GST</p>

                <p>{item.gstRate}%</p>
              </div>

              <div>
                <p className="text-muted-foreground">Quantity</p>

                <div
                  className="
                    mt-1
                    flex
                    items-center
                    gap-2
                  "
                >
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      onQuantityChange(item.productId, Number(e.target.value))
                    }
                    className="h-8 text-center w-auto min-w-[1rem]"
                  />
                </div>
              </div>

              <div>
                <p className="text-muted-foreground">Total</p>

                <p className="font-semibold">₹ {formatIndianCurrency(item.totalAmount)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {deleteOpen && (
        <DeleteProductDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          onConfirm={confirmDeleteProduct}
          isLoading={isDeleting}
          title="Remove Order Item"
          description={`Are you sure you want to remove "${selectedProduct?.name}"?`}
        />
      )}
    </div>
  );
}
