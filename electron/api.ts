import { Page, PageParams, ProductDTO, ProductEntity, SaleDTO, SaleEntity } from "../models";
import { CatalogEntity } from "../models/catalog";
export interface IAPI {
  searchItems(pageParams: PageParams): Promise<Page<ProductDTO>>
  createItem(item: ProductEntity): Promise<ProductDTO>
  updateItem(item: ProductEntity): Promise<ProductDTO>
  deleteItem(id: number): Promise<ProductDTO>
  checkout(saleDTO: Partial<SaleDTO>): Promise<SaleDTO>
  getCategories(): Promise<CatalogEntity[]>
}