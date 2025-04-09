import { CatalogEntity } from "./catalog";

export interface ProductEntity {
  id: number
  name: string
  description: string
  categoryId: string
  price: number
  cost: number
  stock: number
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export interface ProductDTO extends ProductEntity {
  category: CatalogEntity
}
