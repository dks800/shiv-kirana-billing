"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

import type { ReactNode } from "react";

interface DeleteProductDialogProps {
  open: boolean;

  onOpenChange: (open: boolean) => void;

  title?: string;

  description?: ReactNode;

  isLoading?: boolean;

  onConfirm: () => Promise<void>;
}

export function DeleteProductDialog({
  open,
  onOpenChange,
  title = "Delete Product",
  description = "This action cannot be undone.",

  isLoading,

  onConfirm,
}: DeleteProductDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>

          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            className="cursor-pointer text-destructive border-destructive/30 bg-destructive/10 hover:text-destructive hover:bg-destructive/20"
            onClick={async (e) => {
              e.preventDefault();

              await onConfirm();
            }}
            disabled={isLoading}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isLoading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
