import { formatIndianCurrency } from "@/lib/utils";
import { Invoice } from "@/types/invoice.types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface InvoiceGSTSummaryProps {
  invoice: Invoice;
}

export function InvoiceGSTSummary({ invoice }: InvoiceGSTSummaryProps) {
  const gstSummary = invoice.gstSummary || [];

  const totals = gstSummary.reduce(
    (acc, item) => ({
      taxableAmount: acc.taxableAmount + item.taxableAmount,
      cgstAmount: acc.cgstAmount + item.cgstAmount,
      sgstAmount: acc.sgstAmount + item.sgstAmount,
      gstAmount: acc.gstAmount + item.gstAmount,
      totalAmount: acc.totalAmount + item.totalAmount,
    }),
    {
      taxableAmount: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      gstAmount: 0,
      totalAmount: 0,
    },
  );

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
        <h2 className="text-lg font-semibold">GST Summary</h2>

        <p className="text-sm text-muted-foreground">
          Tax bifurcation by GST slab
        </p>
      </div>

      {gstSummary.length === 0 ? (
        <div
          className="
            rounded-lg
            border
            border-dashed
            p-4
            text-sm
            text-muted-foreground
          "
        >
          No GST summary available
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium">GST %</th>
                  <th className="pb-3 text-right font-medium">Taxable</th>
                  <th className="pb-3 text-right font-medium">CGST</th>
                  <th className="pb-3 text-right font-medium">SGST</th>
                  <th className="pb-3 text-right font-medium">Total GST</th>
                  <th className="pb-3 text-right font-medium">Total</th>
                </tr>
              </thead>

              <tbody>
                {gstSummary.map((item) => (
                  <tr key={item.gstRate} className="border-b last:border-none">
                    <td className="py-4 font-medium">{item.gstRate}%</td>

                    <td className="py-4 text-right">
                      {formatIndianCurrency(item.taxableAmount)}
                    </td>

                    <td className="py-4 text-right">
                      {formatIndianCurrency(item.cgstAmount)}
                    </td>

                    <td className="py-4 text-right">
                      {formatIndianCurrency(item.sgstAmount)}
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
              <tfoot>
                <tr className="border-t font-semibold">
                  <td className="py-4">Total</td>

                  <td className="py-4 text-right">
                    {formatIndianCurrency(invoice.subtotal)}
                  </td>

                  <td className="py-4 text-right">
                    {formatIndianCurrency(invoice.totalCGST)}
                  </td>

                  <td className="py-4 text-right">
                    {formatIndianCurrency(invoice.totalSGST)}
                  </td>

                  <td className="py-4 text-right">
                    {formatIndianCurrency(invoice.totalGST)}
                  </td>

                  <td className="py-4 text-right">
                    {formatIndianCurrency(invoice.grandTotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Mobile Accordion */}
          <div className="md:hidden">
            <Accordion type="multiple" className="space-y-3">
              {gstSummary.map((item) => (
                <AccordionItem
                  key={item.gstRate}
                  value={`${item.gstRate}`}
                  className="overflow-hidden rounded-2xl border bg-background shadow-sm"
                >
                  {/* <div className="flex items-center justify-between px-4 py-4"> */}
                  <div className="flex items-start justify-between gap-3 px-4 py-4">
                    <div>
                      <AccordionTrigger className="py-0 hover:no-underline">
                        <div className="min-w-0 mr-2">
                          <p className="font-semibold">{item.gstRate}% GST</p>
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
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Taxable</span>

                        <p className="font-medium">
                          {formatIndianCurrency(item.taxableAmount)}
                        </p>
                      </div>

                      <div>
                        <span className="text-muted-foreground">Total GST</span>

                        <p className="font-medium">
                          {formatIndianCurrency(item.gstAmount)}
                        </p>
                      </div>

                      <div>
                        <span className="text-muted-foreground">CGST</span>

                        <p className="font-medium">
                          {formatIndianCurrency(item.cgstAmount)}
                        </p>
                      </div>

                      <div>
                        <span className="text-muted-foreground">SGST</span>

                        <p className="font-medium">
                          {formatIndianCurrency(item.sgstAmount)}
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </>
      )}
    </div>
  );
}
