"use client";

import { ArrowDownUp, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { ReportCard } from "@/components/reports/ReportCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ProductSalesRow,
  formatCurrency,
} from "@/lib/reports/sales-report";

type SortKey = "productName" | "quantitySold" | "revenue" | "billCount";

export function ProductSalesReport({ rows }: { rows: ProductSalesRow[] }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("revenue");

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const nextRows = normalizedSearch
      ? rows.filter((row) =>
          `${row.productName} ${row.category}`
            .toLowerCase()
            .includes(normalizedSearch),
        )
      : rows;

    return [...nextRows].sort((first, second) => {
      if (sortKey === "productName") {
        return first.productName.localeCompare(second.productName);
      }

      return Number(second[sortKey]) - Number(first[sortKey]);
    });
  }, [rows, search, sortKey]);

  const exportRows = filteredRows.map((row) => ({
    Product: row.productName,
    Category: row.category,
    "Quantity Sold": row.quantitySold,
    Revenue: Math.round(row.revenue),
    "Bills Appeared In": row.billCount,
  }));

  return (
    <ReportCard title="Top 20 Product-wise Sales Report" filename="product-sales" rows={exportRows}>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            placeholder="Search products..."
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={sortKey}
          onChange={(event) => setSortKey(event.target.value as SortKey)}
          className="h-9 rounded-lg border bg-background px-3 text-sm"
        >
          <option value="revenue">Sort by revenue</option>
          <option value="quantitySold">Sort by quantity</option>
          <option value="billCount">Sort by bill count</option>
          <option value="productName">Sort by product</option>
        </select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sr No.</TableHead>
            <TableHead>
              <span className="inline-flex items-center gap-1">
                Product <ArrowDownUp className="h-3 w-3" />
              </span>
            </TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
            <TableHead className="text-right">Bills</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRows.slice(0, 20).map((row, index) => (
            <TableRow key={row.productId}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell className="font-medium">{row.productName}</TableCell>
              <TableCell className="text-right">{row.quantitySold}</TableCell>
              <TableCell className="text-right">
                {formatCurrency(row.revenue)}
              </TableCell>
              <TableCell className="text-right">{row.billCount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ReportCard>
  );
}
