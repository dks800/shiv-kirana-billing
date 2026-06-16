"use client";

import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import { Plus, PackageSearch } from "lucide-react";
import { ProductForm } from "@/components/products/product-form";
import { Product } from "@/types/product.types";
import { ProductFormValues } from "@/lib/validators/product.validator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createProduct,
  deleteProduct,
  deleteMultipleProducts,
  updateProduct,
} from "@/services/product.service";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProductsTable } from "@/components/products/products-table";
import { ProductsMobileList } from "@/components/products/products-mobile-list";
import { useIsMobile } from "@/hooks/useIsMobile";
import { DeleteProductDialog } from "@/components/products/delete-product-dialog";
import { useDashboardData } from "@/context/dashboard-data-context";

export default function ProductsPage() {
  const {
    products,
    productsLoading,
    addOptimisticProduct,
    removeOptimisticProduct,
    replaceOptimisticProduct,
  } = useDashboardData();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [addInitialValues, setAddInitialValues] = useState<
    ProductFormValues | undefined
  >();
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);
  const isMobile = useIsMobile();

  /*
   ------------------------------------------------
   Search
   ------------------------------------------------
  */

  const fuse = useMemo(() => {
    return new Fuse(products, {
      keys: ["name", "hsnCode", "barcodeNumber"],
      threshold: 0.3,
    });
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;

    return fuse.search(search).map((result) => result.item);
  }, [search, products, fuse]);

  /*
   ------------------------------------------------
   Add Product
   ------------------------------------------------
  */

  async function handleAddUpdateProduct(values: ProductFormValues) {
    const data = {
      barcodeNumber: values.barcodeNumber,
      name: values.name,
      hsnCode: values.hsnCode,
      purchasePrice: values.purchasePrice,
      salePrice: values.salePrice,
      gstRate: values.gstRate,
      unit: values.unit,
    };

    if (!selectedProduct) {
      const temporaryId = `pending-${Date.now()}`;
      const optimisticProduct: Product = {
        id: temporaryId,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      addOptimisticProduct(optimisticProduct);
      setOpen(false);
      setAddInitialValues(undefined);
      toast.success("Product added successfully.");

      createProduct(data)
        .then((id) => {
          replaceOptimisticProduct(temporaryId, {
            ...optimisticProduct,
            id,
          });
        })
        .catch((error) => {
          console.error("Failed to add product:", error);
          removeOptimisticProduct(temporaryId);
          setAddInitialValues(values);
          setOpen(true);
          toast.error("Failed to add product. Please try again.");
        });

      return;
    }

    try {
      setIsSubmitting(true);
      await updateProduct(selectedProduct.id!, data);
      setOpen(false);
      setSelectedProduct(null);
      toast.success("Product updated successfully.");
    } catch (error) {
      console.error("Failed to update product:", error);
      toast.error("Failed to update product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleBulkDelete() {
    if (selectedRows.length === 0) return;

    try {
      setIsDeleting(true);
      await deleteMultipleProducts(selectedRows);
      toast.success(`${selectedRows.length} products deleted.`);
      setSelectedRows([]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete products.");
    } finally {
      setIsDeleting(false);
    }
  }

  async function confirmDeleteProduct() {
    if (!selectedProduct?.id) return;

    try {
      setIsDeleting(true);
      await deleteProduct(selectedProduct.id);
      toast.success("Product deleted successfully.");
      setDeleteOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete product.");
    } finally {
      setIsDeleting(false);
    }
  }

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setDeleteOpen(true);
  };
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setAddInitialValues(undefined);
    setOpen(true);
  };

  const handleProductDialogOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      setSelectedProduct(null);
      setAddInitialValues(undefined);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* Header */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Products
          </h1>

          <p className="text-sm text-muted-foreground sm:text-base">
            Manage invoice-ready products and GST details
          </p>
        </div>

        {/* Add Product */}

        <Dialog open={open} onOpenChange={handleProductDialogOpenChange}>
          <DialogTrigger
            render={
              <Button
                onClick={() => {
                  setSelectedProduct(null);
                  setAddInitialValues(undefined);
                }}
               className="
                h-11
                w-full
                gap-2
                rounded-xl
                transition-all
                hover:scale-[1.01]
                active:scale-[0.98]
                sm:w-auto
                cursor-pointer
                hover:bg-primary/80
              "
              />
            }
          >
            <Plus className="h-4 w-4" />

            <span>Add Product</span>
          </DialogTrigger>

          <DialogContent
            className="
              max-h-[90vh]
              overflow-y-auto
              rounded-2xl
              sm:max-w-lg
            "
          >
            <DialogHeader>
              <DialogTitle className="text-xl">
                {selectedProduct ? "Edit Product" : "Add Product"}
              </DialogTitle>
            </DialogHeader>

            <ProductForm
              onSubmit={handleAddUpdateProduct}
              isLoading={isSubmitting}
              initialData={selectedProduct!}
              initialValues={addInitialValues}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}

      <Card className="rounded-2xl border shadow-sm">
        <CardContent className="p-4">
          <Input
            placeholder="Search products by name or HSN code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              h-11
              rounded-xl
              text-sm
              sm:text-base
            "
          />
        </CardContent>
      </Card>

      {/* Product List */}

      {productsLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="h-40 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card
          className="
            rounded-2xl
            border-dashed
            shadow-sm
          "
        >
          <CardContent
            className="
              flex
              flex-col
              items-center
              justify-center
              px-6
              py-20
              text-center
            "
          >
            <div
              className="
                mb-5
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-full
                bg-muted
              "
            >
              <PackageSearch className="h-8 w-8 text-muted-foreground" />
            </div>

            <h2 className="text-lg font-semibold sm:text-xl">
              No Products Found
            </h2>

            <p
              className="
                mt-2
                max-w-sm
                text-sm
                leading-relaxed
                text-muted-foreground
              "
            >
              Add your first product to start creating GST invoices quickly and
              efficiently.
            </p>

            <Button
              onClick={() => {
                setSelectedProduct(null);
                setAddInitialValues(undefined);
                setOpen(true);
              }}
              className="
                mt-6
                h-11
                rounded-xl
                px-6
                transition-all
                hover:scale-[1.02]
                active:scale-[0.98]
                cursor-pointer
                hover:bg-primary/80
              "
            >
              Add First Product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div>
          {selectedRows.length > 0 && (
            <div
              className="
      flex
      flex-col
      gap-3
      rounded-2xl
      border
      bg-muted/40
      p-4
      sm:flex-row
      sm:items-center
      sm:justify-between
    "
            >
              <p className="text-sm font-medium">
                {selectedRows.length} selected
              </p>

              <Button
                variant="destructive"
                className="
        cursor-pointer
        rounded-xl
      "
                onClick={() => setBulkDeleteOpen(true)}
                disabled={isDeleting}
              >
                Delete Selected
              </Button>
            </div>
          )}

          {filteredProducts?.length ? (
            isMobile ? (
              <ProductsMobileList
                products={filteredProducts}
                selectedRows={selectedRows}
                onSelectionChange={setSelectedRows}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
              />
            ) : (
              <ProductsTable
                products={filteredProducts}
                selectedRows={selectedRows}
                onSelectionChange={setSelectedRows}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
              />
            )
          ) : null}
        </div>
      )}
      {deleteOpen && (
        <DeleteProductDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          onConfirm={confirmDeleteProduct}
          isLoading={isDeleting}
          title="Delete Product"
          description={
            <span>
              Are you sure you want to delete <strong>{`"${selectedProduct?.name}"?`}</strong> This action cannot be undone.
            </span>
          }
        />
      )}
      {bulkDeleteOpen && (
        <DeleteProductDialog
          open={bulkDeleteOpen}
          onOpenChange={setBulkDeleteOpen}
          onConfirm={async () => {
            await handleBulkDelete();
            setBulkDeleteOpen(false);
          }}
          isLoading={isDeleting}
          title="Delete Selected Products"
          description={
            <span>
              Are you sure you want to delete <strong>{selectedRows.length}</strong> selected products? This action cannot be undone.
            </span>
          }
        />
      )}
    </div>
  );
}
