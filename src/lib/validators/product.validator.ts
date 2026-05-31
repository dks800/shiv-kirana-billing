import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  hsnCode: z.string().min(4, "HSN code must be at least 4 characters").max(8, "HSN code must be at most 8 characters"),
  barcodeNumber: z.string().trim().optional(),
  salePrice: z
    .number()
    .positive("Price must be greater than 0"),
  purchasePrice: z
    .number()
    .positive("Price must be greater than 0"),
  gstRate: z.number().min(0, "GST rate must not be less than 0"),
  unit: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
