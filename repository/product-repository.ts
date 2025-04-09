
import { SqliteDb } from "../db/sqlite";
import { Repository } from "./repository";
import { ProductEntity, CatalogEntity } from "../models";

export class ProductRepository extends Repository<ProductEntity> {
  constructor(conn: SqliteDb) {
    super(conn, { table: 'item', idColumn: 'id' });
  }
}

export class CategoryRepository extends Repository<CatalogEntity> {
  constructor(conn: SqliteDb) {
    super(conn, { table: 'category', idColumn: 'id' });
  }
} 