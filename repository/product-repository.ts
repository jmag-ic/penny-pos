
import { SqliteDb } from "../db";
import { Repository } from "./repository";
import { ProductEntity, CatalogEntity } from "../models";
import { toSlug } from "../utils";

export class ProductRepository extends Repository<ProductEntity> {
  constructor(conn: SqliteDb) {
    super(conn, { table: 'product', idColumn: 'id' });
  }
}

export class CategoryRepository extends Repository<CatalogEntity> {
  constructor(conn: SqliteDb) {
    super(conn, { table: 'category', idColumn: 'id' });
  }

  async getOrCreate(categoryId: string) {
    const slugId = toSlug(categoryId);
    
    // Check if the category exists
    const category = await this.getById(slugId);
    if (category) return category;
  
    // If the category does not exist, create it
    return await this.create({ id: slugId, name: categoryId });
  }
} 