import { SqliteDb } from "../db";
import { Repository } from "./repository";
import { SaleEntity, SaleItemEntity } from "../models";

export class SaleRepository extends Repository<SaleEntity> {
  constructor(conn: SqliteDb) {
    super(conn, { table: 'sale', idColumn: 'id' });
  }

  async getSalesAmount(startDate: string, endDate: string) {
    const query = this.conn.table('sale')
      .columns('SUM(total_amount) as total_amount')
      .where('sale_date BETWEEN ? AND ?', startDate, endDate)
      .build();

    const result = await query.get<{ totalAmount: number }>();
    return result?.totalAmount || 0;
  }
}

export class SaleItemRepository extends Repository<SaleItemEntity> {
  constructor(conn: SqliteDb) {
    super(conn, { table: 'sale_item', idColumn: 'id' });
  }
}