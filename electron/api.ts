import { Page, PageParams, ProductEntity } from "../models";
import { CatalogEntity } from "../models/catalog";
export interface IAPI {
  searchItems(pageParams: PageParams): Promise<Page<any>>
  createItem(item: ProductEntity): Promise<any>
  updateItem(item: ProductEntity): Promise<any>
  deleteItem(item: ProductEntity): Promise<any>
  checkout(items: any[], paymentAmount: number, customerName: string, paymentMethod: string): Promise<any>
  getCategories(): Promise<CatalogEntity[]>
}