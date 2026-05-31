"use client";

import { Lightbulb } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SalesInsights({ insights }: { insights: string[] }) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 md:grid-cols-3">
          {insights.map((insight) => (
            <div
              key={insight}
              className="rounded-lg border bg-muted/30 p-2 text-sm"
            >
              {insight}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
