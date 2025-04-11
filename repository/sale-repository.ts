import { SqliteDb } from "../db";
import { Repository } from "./repository";
import { SaleEntity, SaleItemEntity } from "../models";

export class SaleRepository extends Repository<SaleEntity> {
  constructor(conn: SqliteDb) {
    super(conn, { table: 'sale', idColumn: 'id' });
  }
}

export class SaleItemRepository extends Repository<SaleItemEntity> {
  constructor(conn: SqliteDb) {
    super(conn, { table: 'sale_item', idColumn: 'id' });
  }
}