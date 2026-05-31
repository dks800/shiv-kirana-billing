"use client";

import { Download, FileSpreadsheet, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  exportRowsToCsv,
  exportRowsToExcel,
  printReport,
} from "@/lib/reports/export";

type ExportRow = Record<string, string | number>;

export function ReportActions({
  title,
  rows,
  filename,
}: {
  title: string;
  rows: ExportRow[];
  filename: string;
}) {
  const disabled = rows.length === 0;

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={disabled}
        onClick={() => exportRowsToCsv(`${filename}.csv`, rows)}
      >
        <Download className="h-4 w-4" />
        CSV
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={disabled}
        onClick={() => exportRowsToExcel(`${filename}.xls`, rows)}
      >
        <FileSpreadsheet className="h-4 w-4" />
        Excel
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={disabled}
        onClick={() => printReport(title, rows)}
      >
        <Printer className="h-4 w-4" />
        Print
      </Button>
    </div>
  );
}
