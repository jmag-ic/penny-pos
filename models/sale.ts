import { ProductEntity } from "./product";

export interface SaleEntity {
  id: number;
  customerName: string;
  paymentAmount: number;
  paymentMethod: string;
  saleDate: Date;
  totalAmount: number;
}

export interface SaleItemEntity {
  id: number;
  saleId: number;
  itemId: number;
  quantity: number;
  price: number;
  cost: number;
}

export interface SaleDTO extends SaleEntity {
  items: SaleItemEntity[];
}