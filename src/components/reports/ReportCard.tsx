"use client";

import { ReactNode } from "react";

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ReportActions } from "@/components/reports/ReportActions";

type ExportRow = Record<string, string | number>;

export function ReportCard({
  title,
  filename,
  rows,
  children,
}: {
  title: string;
  filename: string;
  rows: ExportRow[];
  children: ReactNode;
}) {
  return (
    <Card className="min-w-0 rounded-lg">
      <CardHeader className="gap-3 sm:grid-cols-[1fr_auto]">
        <CardTitle>{title}</CardTitle>
        <CardAction>
          <ReportActions title={title} filename={filename} rows={rows} />
        </CardAction>
      </CardHeader>
      <CardContent className="min-w-0">{children}</CardContent>
    </Card>
  );
}
