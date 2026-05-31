export interface Product {
  id?: string;
  name: string;
  hsnCode?: string;
  barcodeNumber?: string;
  salePrice: number;
  purchasePrice: number;
  gstRate: number;
  unit?: string;
  createdAt?: Date;
  updatedAt?: Date;
}