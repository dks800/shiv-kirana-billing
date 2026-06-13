"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Timestamp } from "firebase/firestore";
import toast from "react-hot-toast";

import {
  calculateInvoiceItem,
  calculateInvoiceTotals,
} from "@/lib/calculations/invoice.calculation";
import { amountToWords, formatIndianCurrency } from "@/lib/utils";
import { getFinancialYear } from "@/lib/invoice.utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader, MiniLoader } from "@/components/ui/loader";
import { Product } from "@/types/product.types";
import { Invoice, InvoiceItem, PaymentMode } from "@/types/invoice.types";
import { getProducts } from "@/services/product.service";
import {
  createInvoice,
  getInvoiceById,
  getNextInvoiceNumberPreview,
  isInvoiceNumberExists,
  updateInvoice,
} from "@/services/invoice.service";
import { InvoiceProductSearch } from "@/components/invoice/invoice-product-search";
import { InvoiceItemsTable } from "@/components/invoice/invoice-items-table";
import {
  CustomerDetails,
  CustomerDetailsForm,
} from "@/components/invoice/customer-details-form";

interface InvoiceFormProps {
  mode: "create" | "edit";
  invoiceId?: string;
  initialData?: Invoice;
}

interface InvoiceDraft {
  invoiceDate: string;
  invoiceNumber: string;
  paymentMode: PaymentMode;
  customerDetails: CustomerDetails;
  items: InvoiceItem[];
}

const emptyCustomerDetails: CustomerDetails = {
  customerName: "",
  customerGSTIN: "",
  customerAddress: "",
  customerPhone: "",
};

function getTodayInputDate() {
  return new Date().toISOString().slice(0, 10);
}

function toDate(value: Invoice["invoiceDate"] | undefined) {
  if (!value) {
    return null;
  }

  if (value instanceof Timestamp) {
    return value.toDate();
  }

  return value instanceof Date ? value : new Date(value);
}

function toInputDate(value: Invoice["invoiceDate"] | undefined) {
  const date = toDate(value);
  if (!date || Number.isNaN(date.getTime())) {
    return getTodayInputDate();
  }

  return date.toISOString().slice(0, 10);
}

function normalizeInvoiceItems(items: InvoiceItem[] = []) {
  return items.map((item) => ({
    ...item,
    ...calculateInvoiceItem({
      quantity: Number(item.quantity) || 1,
      rate: Number(item.rate) || 0,
      gstRate: Number(item.gstRate) || 0,
    }),
  }));
}

function buildDraft(invoice?: Invoice): InvoiceDraft {
  return {
    invoiceDate: invoice
      ? toInputDate(invoice.invoiceDate)
      : getTodayInputDate(),
    invoiceNumber: invoice?.invoiceNumber ? String(invoice.invoiceNumber) : "",
    paymentMode: invoice?.paymentMode || "Cash",
    customerDetails: {
      customerName: invoice?.customerName || "",
      customerGSTIN: invoice?.customerGSTIN || "",
      customerAddress: invoice?.customerAddress || "",
      customerPhone: invoice?.customerPhone || "",
    },
    items: normalizeInvoiceItems(invoice?.items || []),
  };
}

function serializeDraft(draft: InvoiceDraft) {
  return JSON.stringify({
    ...draft,
    items: draft.items.map((item) => ({
      productId: item.productId,
      name: item.name,
      barcodeNumber: item.barcodeNumber || "",
      hsnCode: item.hsnCode || "",
      quantity: Number(item.quantity) || 0,
      unit: item.unit,
      rate: Number(item.rate) || 0,
      gstRate: Number(item.gstRate) || 0,
    })),
  });
}

function toRoundedNumber(value: number) {
  return Number(value.toFixed(2));
}

export function InvoiceForm({
  mode,
  invoiceId,
  initialData,
}: InvoiceFormProps) {
  const router = useRouter();
  const initialDraft = useMemo(() => buildDraft(initialData), [initialData]);
  const [initialDraftSnapshot, setInitialDraftSnapshot] = useState<
    string | null
  >(() => (initialData ? serializeDraft(initialDraft) : null));
  const [items, setItems] = useState<InvoiceItem[]>(initialDraft.items);
  const [products, setProducts] = useState<Product[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingInvoice, setLoadingInvoice] = useState(
    mode === "edit" && !initialData && Boolean(invoiceId),
  );
  const [invoiceDate, setInvoiceDate] = useState(initialDraft.invoiceDate);
  const [invoiceNumber, setInvoiceNumber] = useState(
    initialDraft.invoiceNumber,
  );
  const [invoiceNumberPreview, setInvoiceNumberPreview] = useState<
    number | null
  >(null);
  const [isInvoiceNumberManual, setIsInvoiceNumberManual] = useState(
    mode === "edit",
  );
  const [invoiceNumberError, setInvoiceNumberError] = useState<string | null>(
    null,
  );
  const [paymentMode, setPaymentMode] = useState<PaymentMode>(
    initialDraft.paymentMode,
  );
  const [isLoadingInvoiceNumber, setIsLoadingInvoiceNumber] = useState(false);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>(
    initialDraft.customerDetails,
  );
  const [showDetails, setShowDetails] = useState(false);
  const [showInvoiceNumberConfirm, setShowInvoiceNumberConfirm] =
    useState(false);

  const currentDraft = useMemo<InvoiceDraft>(
    () => ({
      invoiceDate,
      invoiceNumber,
      paymentMode,
      customerDetails,
      items,
    }),
    [customerDetails, invoiceDate, invoiceNumber, items, paymentMode],
  );

  const isDirty = useMemo(() => {
    if (mode === "create") {
      return Boolean(
        items.length ||
        invoiceNumber.trim() ||
        paymentMode !== "Cash" ||
        customerDetails.customerName ||
        customerDetails.customerGSTIN ||
        customerDetails.customerAddress ||
        customerDetails.customerPhone,
      );
    }

    if (!initialDraftSnapshot) {
      return false;
    }

    return serializeDraft(currentDraft) !== initialDraftSnapshot;
  }, [
    currentDraft,
    customerDetails,
    initialDraftSnapshot,
    invoiceNumber,
    items.length,
    mode,
    paymentMode,
  ]);

  const totals = useMemo(() => {
    return calculateInvoiceTotals(items);
  }, [items]);

  const applyDraft = useCallback(
    (draft: InvoiceDraft, trackInitial = false) => {
      setInvoiceDate(draft.invoiceDate);
      setInvoiceNumber(draft.invoiceNumber);
      setPaymentMode(draft.paymentMode);
      setCustomerDetails(draft.customerDetails);
      setItems(draft.items);

      if (trackInitial) {
        setInitialDraftSnapshot(serializeDraft(draft));
      }
    },
    [],
  );

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        toast.error(
          `Failed to load products - ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        );
        console.error(error);
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    if (mode === "create") {
      return;
    }

    if (!invoiceId) {
      return;
    }

    let active = true;

    async function loadInvoice() {
      try {
        setLoadingInvoice(true);
        const invoice = await getInvoiceById(invoiceId!);

        if (!active) {
          return;
        }

        if (!invoice) {
          toast.error("Invoice not found");
          return;
        }

        applyDraft(buildDraft(invoice as Invoice), true);
      } catch (error) {
        console.error(error);
        toast.error(
          `Failed to load invoice - ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        );
      } finally {
        if (active) {
          setLoadingInvoice(false);
        }
      }
    }

    loadInvoice();

    return () => {
      active = false;
    };
  }, [applyDraft, initialData, invoiceId, mode]);

  useEffect(() => {
    if (mode === "edit" || isInvoiceNumberManual) {
      return;
    }

    const billDate = new Date(invoiceDate);
    if (Number.isNaN(billDate.getTime())) {
      return;
    }

    let active = true;

    async function loadInvoiceNumberPreview() {
      try {
        setIsLoadingInvoiceNumber(true);
        const nextInvoiceNumber = await getNextInvoiceNumberPreview(billDate);
        if (!active) return;
        setInvoiceNumber(String(nextInvoiceNumber));
        setInvoiceNumberPreview(nextInvoiceNumber);
        setInvoiceNumberError(null);
        setIsLoadingInvoiceNumber(false);
      } catch (error) {
        if (!active) return;
        console.error(error);
        setInvoiceNumber("");
        setInvoiceNumberError("Unable to generate invoice number");
        setIsLoadingInvoiceNumber(false);
      }
    }

    loadInvoiceNumberPreview();

    return () => {
      active = false;
    };
  }, [invoiceDate, isInvoiceNumberManual, mode]);

  const handleInvoiceNumberChange = (value: string) => {
    setInvoiceNumber(value);
    setIsInvoiceNumberManual(true);
    setInvoiceNumberError(null);
  };

  const validateInvoiceNumber = async () => {
    const trimmedInvoiceNumber = invoiceNumber.trim();
    const parsedInvoiceNumber = Number(trimmedInvoiceNumber);
    const billDate = new Date(invoiceDate);

    if (!trimmedInvoiceNumber || !Number.isInteger(parsedInvoiceNumber)) {
      setInvoiceNumberError("Invoice number is required.");
      return false;
    }

    if (parsedInvoiceNumber <= 0) {
      setInvoiceNumberError("Invoice number must be greater than zero.");
      return false;
    }

    if (Number.isNaN(billDate.getTime())) {
      setInvoiceNumberError("Invalid bill date");
      return false;
    }

    const financialYear = getFinancialYear(billDate);
    const invoiceExists = await isInvoiceNumberExists(
      parsedInvoiceNumber,
      financialYear,
      mode === "edit" ? invoiceId : undefined,
    );

    if (invoiceExists) {
      setInvoiceNumberError(
        "Invoice number already exists for this financial year.",
      );
      return false;
    }

    setInvoiceNumberError(null);
    return true;
  };

  const createInvoiceItem = useCallback((product: Product): InvoiceItem => {
    const quantity = 1;
    if (!product || !product.id) {
      throw new Error("Invalid product data");
    }
    const calculations = calculateInvoiceItem({
      quantity,
      rate: product.salePrice,
      gstRate: product.gstRate,
    });

    return {
      productId: product.id,
      name: product.name,
      barcodeNumber: product.barcodeNumber,
      hsnCode: product.hsnCode,
      quantity,
      unit: product.unit!,
      rate: product.salePrice,
      gstRate: product.gstRate,
      ...calculations,
    };
  }, []);

  const handleAddProduct = useCallback(
    (product: Product) => {
      let toastMessage: string | null = null;

      setItems((prev) => {
        const existingItem = prev.find((item) => item.productId === product.id);

        if (existingItem) {
          toastMessage = `${existingItem.name} + 1`;

          return prev.map((item) => {
            if (item.productId !== product.id) {
              return item;
            }

            const quantity = item.quantity + 1;

            const calculations = calculateInvoiceItem({
              quantity,
              rate: item.rate,
              gstRate: item.gstRate,
            });

            return {
              ...item,
              quantity,
              ...calculations,
            };
          });
        }

        toastMessage = `Added item - ${product.name}`;
        return [...prev, createInvoiceItem(product)];
      });

      if (toastMessage) {
        toast.success(toastMessage);
      }
    },
    [createInvoiceItem],
  );

  function handleQuantityChange(productId: string, quantity: number) {
    if (quantity < 1) return;

    setItems((prev) =>
      prev.map((item) => {
        if (item.productId !== productId) {
          return item;
        }

        const calculations = calculateInvoiceItem({
          quantity,
          rate: item.rate,
          gstRate: item.gstRate,
        });

        return {
          ...item,
          quantity,
          ...calculations,
        };
      }),
    );
  }

  function handleRemoveItem(productId: string) {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  }

  function buildPayload() {
    const billDate = new Date(invoiceDate);

    return {
      invoiceNumber: Number(invoiceNumber.trim()),
      invoiceDate: billDate,
      paymentMode,
      ...customerDetails,
      items,
      financialYear: getFinancialYear(billDate),
      subtotal: toRoundedNumber(totals.subtotal),
      totalCGST: toRoundedNumber(totals.totalCGST),
      totalSGST: toRoundedNumber(totals.totalSGST),
      totalGST: toRoundedNumber(totals.totalGST),
      roundUp: toRoundedNumber(totals.roundUp),
      grandTotal: toRoundedNumber(totals.roundedGrandTotal),
      gstSummary: totals.gstSummary.map((item) => ({
        ...item,
        taxableAmount: toRoundedNumber(item.taxableAmount),
        cgstAmount: toRoundedNumber(item.cgstAmount),
        sgstAmount: toRoundedNumber(item.sgstAmount),
        gstAmount: toRoundedNumber(item.gstAmount),
        totalAmount: toRoundedNumber(item.totalAmount),
      })),
      totalItems: totals.totalItems,
    };
  }

  async function executeSubmitInvoice() {
    try {
      setSaving(true);
      const payload = buildPayload();

      if (mode === "edit") {
        if (!invoiceId) {
          throw new Error("Invoice id is required.");
        }

        await updateInvoice(invoiceId, payload);
        setInitialDraftSnapshot(serializeDraft(currentDraft));
        toast.success("Invoice updated successfully");
        router.back();
        return;
      }

      await createInvoice(payload);
      toast.success("Invoice saved successfully");
      setItems([]);
      setInvoiceNumberPreview(null);
      setIsInvoiceNumberManual(false);
      setCustomerDetails(emptyCustomerDetails);
      router.back();
    } catch (error) {
      console.error(error);
      toast.error(
        `Failed to ${mode === "edit" ? "update" : "save"} invoice - ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmitInvoice() {
    try {
      if (!items.length) {
        toast.error("Add at least one product");
        return;
      }

      const billDate = new Date(invoiceDate);
      if (Number.isNaN(billDate.getTime())) {
        toast.error("Invoice date is invalid.");
        return;
      }

      if (!paymentMode) {
        toast.error("Payment mode is required.");
        return;
      }

      if (mode === "edit" && !isDirty) {
        toast("No changes to update");
        return;
      }

      const isValid = await validateInvoiceNumber();
      if (!isValid) {
        toast.error(
          invoiceNumberError ?? "Please fix the invoice number before saving.",
        );
        return;
      }

      const manualOverride =
        mode === "create" &&
        isInvoiceNumberManual &&
        Number(invoiceNumber) !== invoiceNumberPreview;

      if (manualOverride) {
        setShowInvoiceNumberConfirm(true);
        return;
      }

      await executeSubmitInvoice();
    } catch (error) {
      console.error(error);
      toast.error(
        `Failed to ${mode === "edit" ? "update" : "save"} invoice - ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

  async function confirmInvoiceNumberOverride() {
    setShowInvoiceNumberConfirm(false);
    await executeSubmitInvoice();
  }

  function handleCancel() {
    if (
      mode === "edit" &&
      isDirty &&
      !window.confirm("Discard unsaved invoice changes?")
    ) {
      return;
    }

    router.back();
  }

  const renderSaveButton = () => (
    <Button
      onClick={handleSubmitInvoice}
      className="cursor-pointer md:h-[50px] md:w-[100px] md:text-lg"
      disabled={!items.length || saving || loadingInvoice}
    >
      {saving
        ? mode === "edit"
          ? "Updating..."
          : "Saving..."
        : mode === "edit"
          ? "Update"
          : "Save"}
    </Button>
  );

  if (loadingInvoice) {
    return <Loader />;
  }

  if (mode === "edit" && !invoiceId) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        Invoice id is required.
      </div>
    );
  }

  return (
    <div className="space-y-6 md:p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === "edit" ? "Edit Invoice" : "Create Invoice"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === "edit"
              ? "Update GST sales invoice details"
              : "Generate GST sales invoices"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer md:h-[50px] md:w-[100px] md:text-lg"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          {renderSaveButton()}
        </div>
      </div>

      <div className="rounded-2xl border bg-background p-4 shadow-sm">
        <Dialog
          open={showInvoiceNumberConfirm}
          onOpenChange={setShowInvoiceNumberConfirm}
        >
          <DialogContent className="rounded-2xl">
            <DialogTitle>Confirm invoice number override</DialogTitle>
            <DialogDescription>
              You are saving with a different invoice number than the
              auto-generated.
            </DialogDescription>

            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">From (Auto Generated): </span>
                <span className="font-semibold">
                  {invoiceNumberPreview || "-"}
                </span>
              </p>
              <p>
                <span className="font-medium">To (Current): </span>
                <span className="font-semibold">{invoiceNumber || "-"}</span>
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => setShowInvoiceNumberConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={confirmInvoiceNumberOverride}
                className="cursor-pointer hover:bg-primary/80"
              >
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="space-y-3">
          <CustomerDetailsForm
            value={customerDetails}
            onChange={setCustomerDetails}
          />
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span>Invoice date</span>
              <Input
                type="date"
                value={invoiceDate}
                onChange={(event) => {
                  setInvoiceDate(event.target.value);
                }}
              />
            </label>

            <label className="space-y-1 text-sm">
              <span>Invoice number</span>
              <div className="relative">
                <Input
                  type="number"
                  value={invoiceNumber}
                  placeholder={
                    isLoadingInvoiceNumber
                      ? "Generating..."
                      : "Enter Invoice Number"
                  }
                  onChange={(event) =>
                    handleInvoiceNumberChange(event.target.value)
                  }
                  onBlur={() => {
                    validateInvoiceNumber();
                  }}
                  disabled={isLoadingInvoiceNumber}
                />
                {isLoadingInvoiceNumber && <MiniLoader />}
              </div>
              {invoiceNumberError ? (
                <p className="text-xs text-destructive">{invoiceNumberError}</p>
              ) : null}
            </label>

            <label className="space-y-1 text-sm md:col-span-2">
              <span>Payment Mode</span>
              <Select
                value={paymentMode}
                onValueChange={(value) => setPaymentMode(value as PaymentMode)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select payment mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                </SelectContent>
              </Select>
            </label>
          </div>

          <h2 className="text-sm font-medium">Add Products</h2>
          <p className="text-sm text-muted-foreground">
            Search products to start creating invoice
          </p>
          <InvoiceProductSearch
            products={products}
            onSelect={handleAddProduct}
          />
        </div>
      </div>

      <div className="md:hidden">
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background p-3 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-lg font-medium">
                Rs. {formatIndianCurrency(totals.roundedGrandTotal)}
              </div>
              <button
                type="button"
                className="text-sm text-primary underline"
                onClick={() => setShowDetails(true)}
              >
                View details
              </button>
            </div>

            {renderSaveButton()}
          </div>
        </div>

        {showDetails ? (
          <div className="fixed inset-0 z-50 flex items-end md:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setShowDetails(false)}
            />

            <div className="relative w-full rounded-t-2xl bg-background p-4 shadow-lg">
              <div className="flex items-center justify-between pb-2">
                <h3 className="text-lg font-medium">Invoice Details</h3>
                <button
                  aria-label="Close"
                  className="text-sm bg-muted text-muted-foreground rounded-full p-1 text-center hover:bg-muted/80 hover:text-foreground"
                  onClick={() => setShowDetails(false)}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>Rs. {formatIndianCurrency(totals.subtotal)}</span>
                </div>

                <div className="flex justify-between">
                  <span>CGST</span>
                  <span>Rs. {formatIndianCurrency(totals.totalCGST)}</span>
                </div>

                <div className="flex justify-between">
                  <span>SGST</span>
                  <span>Rs. {formatIndianCurrency(totals.totalSGST)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Roundup</span>
                  <span>Rs. {formatIndianCurrency(totals.roundUp)}</span>
                </div>

                <div className="flex justify-between border-t pt-2 text-base font-semibold">
                  <span>Grand Total</span>
                  <span>
                    Rs. {formatIndianCurrency(totals.roundedGrandTotal)}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground text-right">
                  {amountToWords(totals.roundedGrandTotal)}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border bg-background shadow-sm">
        {!items.length ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-muted-foreground">
              No products added yet
            </p>
          </div>
        ) : (
          <InvoiceItemsTable
            items={items}
            onRemoveItem={handleRemoveItem}
            onQuantityChange={handleQuantityChange}
          />
        )}
      </div>

      <div className="rounded-2xl border bg-background p-4 shadow-sm">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>Rs. {formatIndianCurrency(totals.subtotal)}</span>
          </div>

          <div className="flex justify-between">
            <span>CGST</span>
            <span>Rs. {formatIndianCurrency(totals.totalCGST)}</span>
          </div>

          <div className="flex justify-between">
            <span>SGST</span>
            <span>Rs. {formatIndianCurrency(totals.totalSGST)}</span>
          </div>

          <div className="flex justify-between">
            <span>Roundup</span>
            <span>Rs. {formatIndianCurrency(totals.roundUp)}</span>
          </div>

          <div className="flex justify-between border-t pt-2 text-base font-semibold">
            <span>Grand Total</span>
            <span>Rs. {formatIndianCurrency(totals.roundedGrandTotal)}</span>
          </div>
          <div className="text-sm text-muted-foreground text-right">
            {amountToWords(totals.roundedGrandTotal)}
          </div>
        </div>
      </div>
    </div>
  );
}
