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

export interface ProductData extends ProductEntity {
  categoryName: string
}
