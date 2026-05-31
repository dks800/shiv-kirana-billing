"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export interface CustomerDetails {
  customerName?: string;
  customerGSTIN?: string;
  customerAddress?: string;
  customerPhone?: string;
}

interface CustomerDetailsFormProps {
  value: CustomerDetails;

  onChange: (value: CustomerDetails) => void;
}

export function CustomerDetailsForm({
  value,
  onChange,
}: CustomerDetailsFormProps) {
  const isMobile = useIsMobile();
  const addressRows = isMobile ? 4 : 1;

  function updateField(key: keyof CustomerDetails, fieldValue: string) {
    onChange({
      ...value,
      [key]: fieldValue,
    });
  }

  return (
    <Accordion type="single" className="space-y-3">
      <AccordionItem
        value="customer-details"
        className="rounded-2xl border bg-background shadow-sm"
      >
        <div className="px-4 py-3">
          <AccordionTrigger className="py-0">
            <div>
              <h2 className="font-medium">Customer Details</h2>

              <p className="text-sm text-muted-foreground">
                Optional invoice customer information
              </p>
            </div>
          </AccordionTrigger>
        </div>

        <AccordionContent className="border-t px-4 py-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Input
              placeholder="Customer Name"
              value={value.customerName || ""}
              onChange={(e) => updateField("customerName", e.target.value)}
            />

            <Input
              placeholder="Customer Phone"
              value={value.customerPhone || ""}
              onChange={(e) => updateField("customerPhone", e.target.value)}
            />

            <Input
              placeholder="Customer GSTIN"
              value={value.customerGSTIN || ""}
              onChange={(e) => updateField("customerGSTIN", e.target.value)}
            />

            <Textarea
              placeholder="Customer Address"
              rows={addressRows}
              value={value.customerAddress || ""}
              onChange={(e) => updateField("customerAddress", e.target.value)}
              className="md:col-span-3"
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
