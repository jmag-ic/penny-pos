import { CatalogEntity, Page, PageParams, ProductDTO, ProductEntity, SaleDTO } from "../models";

export interface IAPI {
  searchProducts(pageParams: PageParams): Promise<Page<ProductDTO>>
  createProduct(product: ProductEntity): Promise<ProductDTO>
  updateProduct(product: ProductEntity): Promise<ProductDTO>
  deleteProduct(id: number): Promise<ProductDTO>
  checkout(saleDTO: Partial<SaleDTO>): Promise<SaleDTO>
  getCategories(): Promise<CatalogEntity[]>
}