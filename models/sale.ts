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
  productId: number;
  quantity: number;
  price: number;
  cost: number;
}

export interface SaleDTO extends SaleEntity {
  items: SaleItemEntity[];
}