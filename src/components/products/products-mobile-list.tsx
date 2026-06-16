"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Checkbox } from "@/components/ui/checkbox";

import { Button } from "@/components/ui/button";

import {
  Edit,
  Trash2,
} from "lucide-react";

import { Product } from "@/types/product.types";

interface ProductsMobileListProps {
  products: Product[];

  selectedRows: string[];

  onSelectionChange: (rows: string[]) => void;

  onEdit: (product: Product) => void;

  onDelete: (product: Product) => void;
}

export function ProductsMobileList({
  products,
  selectedRows,
  onSelectionChange,
  onEdit,
  onDelete,
}: ProductsMobileListProps) {
  /*
   ----------------------------------------------------
   Selection
   ----------------------------------------------------
  */

  const isAllSelected =
    products.length > 0 &&
    selectedRows.length === products.length;

  function toggleSelectAll() {
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(products.map((p) => p.id!));
    }
  }

  function toggleRow(id: string) {
    if (selectedRows.includes(id)) {
      onSelectionChange(
        selectedRows.filter((rowId) => rowId !== id)
      );
    } else {
      onSelectionChange([...selectedRows, id]);
    }
  }

  return (
    <div className="space-y-4 md:hidden">
      {/* Select All */}

      <div
        className="
          flex
          items-center
          justify-between
          rounded-2xl
          border
          bg-background
          p-4
          shadow-sm
        "
      >
        <div className="flex items-center gap-3">
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={toggleSelectAll}
            className="cursor-pointer"
          />

          <span className="text-sm font-medium">
            Select All
          </span>
        </div>

        <span className="text-xs text-muted-foreground">
          {selectedRows.length} selected
        </span>
      </div>

      {/* Accordion */}

      <Accordion
        type="multiple"
        className="space-y-3"
      >
        {products.map((product) => {
          const isSelected = selectedRows.includes(
            product.id!
          );

          return (
            <AccordionItem
              key={product.id}
              value={product.id!}
              className="
                overflow-hidden
                rounded-2xl
                border
                bg-background
                shadow-sm
              "
            >
              {/* Header */}

              <div className="flex items-center gap-3 px-4 py-3">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() =>
                    toggleRow(product.id!)
                  }
                  className="cursor-pointer"
                />

                <div className="min-w-0 flex-1">
                  <AccordionTrigger
                    className="
                      py-0
                      hover:no-underline
                    "
                  >
                    <div className="flex w-full items-center justify-between gap-4">
                      <div className="min-w-0 text-left">
                        <p className="font-medium">
                          {product.name}
                        </p>

                        {product.hsnCode && (
                          <p
                            className="
                              text-xs
                              text-muted-foreground
                            "
                          >
                            HSN: {product.hsnCode}
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <p className="font-semibold">
                          ₹
                          {product.salePrice.toFixed(2)}
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
                    </div>
                  </AccordionTrigger>
                </div>
              </div>

              {/* Expanded Content */}

              <AccordionContent className="border-t px-4 py-4">
                <div className="space-y-4">
                  {/* Details */}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">
                        Purchase Price
                      </p>

                      <p className="font-medium">
                        ₹
                        {product.purchasePrice.toFixed(
                          2
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-muted-foreground">
                        Sale Price
                      </p>

                      <p className="font-medium">
                        ₹
                        {product.salePrice.toFixed(2)}
                      </p>
                    </div>

                    <div>
                      <p className="text-muted-foreground">
                        GST Rate
                      </p>

                      <p className="font-medium">
                        {product.gstRate}%
                      </p>
                    </div>

                    <div>
                      <p className="text-muted-foreground">
                        Unit
                      </p>

                      <p className="font-medium">
                        {product.unit || "-"}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      className="
                        flex-1
                        cursor-pointer
                        rounded-xl
                      "
                      onClick={() =>
                        onEdit(product)
                      }
                    >
                      <Edit className="mr-2 h-4 w-4" />

                      Edit
                    </Button>

                    <Button
                      variant="destructive"
                      className="
                        flex-1
                        cursor-pointer
                        rounded-xl
                      "
                      onClick={() =>
                        onDelete(product)
                      }
                    >
                      <Trash2 className="mr-2 h-4 w-4" />

                      Delete
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}