import { Page, PageParams, Product } from "../models";

export interface IAPI {
  searchItems(pageParams: PageParams): Promise<Page<Product>>
  checkout(items: any[], paymentAmount: number, customerName: string, paymentMethod: string): Promise<any>
}