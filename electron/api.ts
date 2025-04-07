import { Page, PageParams, Product } from "../models";
import { Catalog } from "../models/catalog";
export interface IAPI {
  searchItems(pageParams: PageParams): Promise<Page<Product>>
  createItem(item: Product): Promise<any>
  updateItem(item: Product): Promise<any>
  deleteItem(item: Product): Promise<any>
  checkout(items: any[], paymentAmount: number, customerName: string, paymentMethod: string): Promise<any>
  getCategories(): Promise<Catalog[]>
}