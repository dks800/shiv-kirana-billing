"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { ArrowUpDown, Edit, Trash2 } from "lucide-react";
import { Product } from "@/types/product.types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ProductsTableProps {
  products: Product[];

  selectedRows: string[];

  onSelectionChange: (rows: string[]) => void;

  onEdit: (product: Product) => void;

  onDelete: (product: Product) => void;
}

export function ProductsTable({
  products,
  selectedRows,
  onSelectionChange,
  onEdit,
  onDelete,
}: ProductsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  /*
   ------------------------------------------------------
   Selection Helpers
   ------------------------------------------------------
  */

  const isAllSelected =
    products.length > 0 && selectedRows.length === products.length;

  function toggleSelectAll() {
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(products.map((p) => p.id!));
    }
  }

  function toggleRow(id: string) {
    if (selectedRows.includes(id)) {
      onSelectionChange(selectedRows.filter((rowId) => rowId !== id));
    } else {
      onSelectionChange([...selectedRows, id]);
    }
  }

  /*
   ------------------------------------------------------
   Columns
   ------------------------------------------------------
  */

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        id: "select",

        header: () => (
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={toggleSelectAll}
            className="cursor-pointer"
          />
        ),

        cell: ({ row }) => (
          <Checkbox
            checked={selectedRows.includes(row.original.id!)}
            onCheckedChange={() => toggleRow(row.original.id!)}
            className="cursor-pointer"
          />
        ),
      },

      {
        accessorKey: "name",

        header: ({ column }) => (
          <Button
            variant="ghost"
            className="cursor-pointer px-0 hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Product
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),

        cell: ({ row }) => (
          <div>
            <p className="font-medium max-w-[1000px] truncate">
              {row.original.name}
            </p>

            {row.original.barcodeNumber && (
              <p
                className="text-xs text-muted-foreground max-w-[300px] truncate"
                title={row.original.barcodeNumber}
              >
                Barcode: {row.original.barcodeNumber}
              </p>
            )}
          </div>
        ),
      },

      {
        accessorKey: "hsnCode",

        header: ({ column }) => (
          <Button
            variant="ghost"
            className="cursor-pointer px-0 hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            HSN Code
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),

        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.hsnCode}</p>
          </div>
        ),
      },

      {
        accessorKey: "purchasePrice",

        header: ({ column }) => (
          <Button
            variant="ghost"
            className="cursor-pointer px-0 hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Purchase
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),

        cell: ({ row }) => (
          <span>₹{row.original.purchasePrice.toFixed(2)}</span>
        ),
      },

      {
        accessorKey: "salePrice",

        header: ({ column }) => (
          <Button
            variant="ghost"
            className="cursor-pointer px-0 hover:bg-transparent"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Sale
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),

        cell: ({ row }) => (
          <span className="font-semibold">
            ₹{row.original.salePrice.toFixed(2)}
          </span>
        ),
      },

      {
        accessorKey: "gstRate",

        header: "GST",

        cell: ({ row }) => <span>{row.original.gstRate}%</span>,
      },

      {
        accessorKey: "unit",

        header: "Unit",

        cell: ({ row }) => <span>{row.original.unit || "-"}</span>,
      },

      {
        id: "actions",

        header: "Actions",

        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="cursor-pointer hover:bg-muted"
              onClick={() => onEdit(row.original)}
            >
              <Edit className="h-4 w-4" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="
                cursor-pointer
                text-destructive
                hover:bg-destructive/10
                hover:text-destructive
              "
              onClick={() => onDelete(row.original)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [selectedRows, isAllSelected],
  );

  /*
   ------------------------------------------------------
   Table
   ------------------------------------------------------
  */

  const table = useReactTable({
    data: products,

    columns,

    state: {
      sorting,
    },

    onSortingChange: setSorting,

    getCoreRowModel: getCoreRowModel(),

    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div
      className="
        hidden
        overflow-hidden
        rounded-2xl
        border
        bg-background
        shadow-sm
        md:block
      "
    >
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-muted/30">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="
                  transition-colors
                  hover:bg-muted/40
                "
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No products found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
