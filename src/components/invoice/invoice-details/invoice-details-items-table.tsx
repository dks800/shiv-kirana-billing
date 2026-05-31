import { formatIndianCurrency } from "@/lib/utils";
import { Invoice } from "@/types/invoice.types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface InvoiceItemsTableProps {
  invoice: Invoice;
}

export function InvoiceDetaisItemsTable({ invoice }: InvoiceItemsTableProps) {
  return (
    <div
      className="
        rounded-xl
        border
        bg-card
        text-card-foreground
        p-4
        md:p-6
      "
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Invoice Items</h2>

        <p className="text-sm text-muted-foreground">
          Products included in this invoice
        </p>
      </div>

      {/* Desktop Table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b text-left">
              <th className="pb-3 font-medium">Product</th>
              <th className="pb-3 font-medium">HSN</th>
              <th className="pb-3 text-right font-medium">Qty</th>
              <th className="pb-3 text-right font-medium">Rate</th>
              <th className="pb-3 text-right font-medium">Taxable</th>
              <th className="pb-3 text-right font-medium">GST</th>
              <th className="pb-3 text-right font-medium">Total</th>
            </tr>
          </thead>

          <tbody>
            {invoice.items.map((item, index) => (
              <tr
                key={`${item.productId}-${index}`}
                className="border-b last:border-none"
              >
                <td className="py-4">
                  <div>
                    <p className="font-medium">{item.name}</p>

                    <p className="text-xs text-muted-foreground">
                      {item.gstRate}% GST
                    </p>
                  </div>
                </td>
                <td className="py-4 text-sm">{item.hsnCode || "-"}</td>

                <td className="py-4 text-right">
                  {item.quantity} {item.unit}
                </td>

                <td className="py-4 text-right">
                  {formatIndianCurrency(item.rate)}
                </td>

                <td className="py-4 text-right">
                  {formatIndianCurrency(item.taxableAmount)}
                </td>

                <td className="py-4 text-right">
                  {formatIndianCurrency(item.gstAmount)}
                </td>

                <td className="py-4 text-right font-medium">
                  {formatIndianCurrency(item.totalAmount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Accordion */}
      <div className="md:hidden">
        <Accordion type="multiple" className="space-y-3">
          {invoice.items.map((item, index) => (
            <AccordionItem
              key={`${item.productId}-${index}`}
              value={`${item.productId}-${index}`}
              className="overflow-hidden rounded-2xl border bg-background shadow-sm"
            >
              <div className="flex items-start justify-between gap-3 px-4 py-4">
                <div>
                  <AccordionTrigger className="py-0 hover:no-underline">
                    <div className="min-w-0 mr-2">
                      <p className="break-words whitespace-normal font-medium">
                        {item.name}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.gstRate}% GST
                      </p>
                    </div>
                  </AccordionTrigger>
                </div>

                <div className="text-right">
                  <p className="font-semibold">
                    {formatIndianCurrency(item.totalAmount)}
                  </p>
                </div>
              </div>

              <AccordionContent className="border-t px-4 py-4">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Qty</span>
                    <p className="font-medium">
                      {item.quantity} {item.unit}
                    </p>
                  </div>

                  <div>
                    <span className="text-muted-foreground">Rate</span>

                    <p className="font-medium">
                      {formatIndianCurrency(item.rate)}
                    </p>
                  </div>

                  <div>
                    <span className="text-muted-foreground">Taxable</span>

                    <p className="font-medium">
                      {formatIndianCurrency(item.taxableAmount)}
                    </p>
                  </div>

                  <div>
                    <span className="text-muted-foreground">GST</span>

                    <p className="font-medium">
                      {formatIndianCurrency(item.gstAmount)}
                    </p>
                  </div>

                  <div>
                    <span className="text-muted-foreground">HSN</span>

                    <p className="font-medium">
                      {item.hsnCode || "-"}
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
