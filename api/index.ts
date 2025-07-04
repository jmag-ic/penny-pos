import { CatalogEntity, Page, PageParams, ProductDTO, ProductEntity, SaleDTO, SaleEntity } from "../models";

export interface IAPI {
  searchProducts(pageParams: PageParams<ProductEntity>): Promise<Page<ProductDTO>>
  createProduct(product: ProductEntity): Promise<ProductDTO>
  updateProduct(product: ProductEntity): Promise<ProductDTO>
  deleteProduct(id: number): Promise<ProductDTO>
  checkout(saleDTO: Partial<SaleDTO>): Promise<SaleDTO>
  getCategories(): Promise<CatalogEntity[]>
  searchSales(pageParams: PageParams<SaleEntity>): Promise<Page<SaleDTO>>
  deleteSale(id: number): Promise<SaleDTO>
  getSalesAmount(startDate: string, endDate: string): Promise<number>
  updateSale(sale: SaleEntity): Promise<SaleEntity>
}