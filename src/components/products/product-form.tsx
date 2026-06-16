"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  productSchema,
  ProductFormValues,
} from "@/lib/validators/product.validator";

import { Product } from "@/types/product.types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { checkBarcodeExists } from "@/services/product.service";

const emptyProductFormValues: ProductFormValues = {
  name: "",
  barcodeNumber: "",
  hsnCode: "",
  salePrice: 0,
  purchasePrice: 0,
  gstRate: 18,
  unit: "",
};

interface ProductFormProps {
  initialData?: Product;
  initialValues?: ProductFormValues;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function ProductForm({
  initialData,
  initialValues,
  onSubmit,
  isLoading,
}: ProductFormProps) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    mode: "onChange",
    defaultValues: initialValues ?? emptyProductFormValues,
  });

  const [checkingBarcode, setCheckingBarcode] = useState(false);

  useEffect(() => {
    const subscription = form.watch(async (values, { name }) => {
      if (name !== "barcodeNumber") return;

      const barcode = values.barcodeNumber?.trim();

      if (!barcode) {
        form.clearErrors("barcodeNumber");

        return;
      }

      const timer = setTimeout(async () => {
        try {
          setCheckingBarcode(true);

          const exists = await checkBarcodeExists(barcode);

          if (exists) {
            form.setError("barcodeNumber", {
              type: "manual",
              message: "Product with this barcode already exists",
            });
          } else {
            form.clearErrors("barcodeNumber");
          }
        } finally {
          setCheckingBarcode(false);
        }
      }, 500);

      return () => clearTimeout(timer);
    });

    return () => subscription.unsubscribe();
  }, [form]);

  useEffect(() => {
    if (initialData) {
      form.reset({
        barcodeNumber: initialData.barcodeNumber || "",
        name: initialData.name,
        hsnCode: initialData.hsnCode || "",
        salePrice: initialData.salePrice,
        purchasePrice: initialData.purchasePrice,
        gstRate: initialData.gstRate,
        unit: initialData.unit || "",
      });
    } else {
      form.reset(initialValues ?? emptyProductFormValues);
    }
  }, [initialData, initialValues, form]);

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="barcodeNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Barcode Number</FormLabel>

                <div className="flex gap-2">
                  <FormControl>
                    <Input placeholder="Enter barcode" {...field} />
                  </FormControl>

                </div>

                <FormMessage />
              </FormItem>
            )}
          />
          {/* Product Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>

                <FormControl>
                  <Input placeholder="Enter product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* HSN Code  */}
          <FormField
            control={form.control}
            name="hsnCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>HSN Code</FormLabel>

                <FormControl>
                  <Input placeholder="Enter HSN code" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          {/* Sale Price */}
          <FormField
            control={form.control}
            name="salePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sale Price</FormLabel>

                <FormControl>
                  <Input
                    type="number"
                    placeholder="0.00"
                    {...field}
                    onChange={(event) =>
                      field.onChange(
                        event.target.value === ""
                          ? 0
                          : Number(event.target.value),
                      )
                    }
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          {/* Purchase Price */}
          <FormField
            control={form.control}
            name="purchasePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Price</FormLabel>

                <FormControl>
                  <Input
                    type="number"
                    placeholder="0.00"
                    {...field}
                    onChange={(event) =>
                      field.onChange(
                        event.target.value === ""
                          ? 0
                          : Number(event.target.value),
                      )
                    }
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          {/* GST Rate */}
          <FormField
            control={form.control}
            name="gstRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GST Rate (%)</FormLabel>

                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select GST rate" />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    <SelectItem value="0">0%</SelectItem>
                    <SelectItem value="3">3%</SelectItem>
                    <SelectItem value="5">5%</SelectItem>
                    <SelectItem value="12">12%</SelectItem>
                    <SelectItem value="18">18%</SelectItem>
                    <SelectItem value="28">28%</SelectItem>
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />

          {/* Unit */}
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>

                <FormControl>
                  <Input placeholder="PCS / KG / BOX" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full disabled:cursor-not-allowed disabled:opacity-50 transition-colors cursor-pointer hover:bg-primary/80"
            disabled={isLoading || checkingBarcode || !form.formState.isValid}
          >
            {isLoading
              ? "Saving..."
              : initialData
                ? "Update Product"
                : "Add Product"}
          </Button>
        </form>
      </Form>
    </>
  );
}
