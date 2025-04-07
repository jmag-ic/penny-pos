export interface Product {
  id: number
  name: string
  description: string
  categoryId: string
  category: ProductCategory
  price: number
  cost: number
  stock: number
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export interface ProductCategory {
  id: number
  name: string
  createdAt: Date
}
