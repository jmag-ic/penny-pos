import { SqliteDb, utils } from "../db/sqlite"
import { PageParams } from "../models"

export class PosService {
  
  constructor(private conn: SqliteDb) {}

  create(table: string, data: any): Promise<any> {
    return this.conn.insert(table, objectToSnakeCase(data))
  }

  update(id: number, table: string, data: any): Promise<any> {
    return this.conn.update(id, table, objectToSnakeCase(data))
  }

  delete(id: number, table: string): Promise<any> {
    return this.conn.delete(id, table)
  }

  getCatalog(table: string, orderBy?: string): Promise<any> {
    const query = this.conn.query(table)
    if (orderBy) {
      query.orderBy(orderBy)
    }
    return query.build().all()
  }

  search(table: string, searchColumns: string[], pageParams: PageParams, fts: boolean = false): Promise<any> {
    const itemsQuery = this.conn.query(table)
    const totalQuery = this.conn.query(table).columns('COUNT(*) total')

    if (pageParams.text) {
      const {likeClause, params} = utils.exhaustLike(pageParams.text, ...searchColumns)
      let whereClause = likeClause

      if (fts) {
        whereClause += ` OR id IN (SELECT rowid FROM ${table}_fts WHERE ${table}_fts MATCH ?)`
        params.push(pageParams.text+'*');
      }

      itemsQuery.where(whereClause, ...params)
      totalQuery.where(whereClause, ...params)
    }

    if (pageParams.orderBy) {
      itemsQuery.orderBy(pageParams.orderBy)
    }

    if (pageParams.limit) {
      itemsQuery.limit(pageParams.limit)
    }

    if (pageParams.offset) {
      itemsQuery.offset(pageParams.offset)
    }

    return this.conn.transaction(async () => {
      const items = await itemsQuery.build().all()
      const { total } = await totalQuery.build().get<{ total: number }>()
      return {
        items: items,
        total: total
      } 
    })
  }

  // checkout method creates a new sale and sale items in the database
  checkout(items: any[], paymentAmount: number, customerName: string, paymentMethod: string): Promise<number> {
    // Calculate total amount of the sale
    const totalAmount = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0)
    
    return this.conn.transaction<number>(async () => {
      // Create a new sale
      const saleId = await this.conn.insert('sale', {
        total_amount: totalAmount,
        payment_amount: paymentAmount,
        customer_name: customerName,
        payment_method: paymentMethod
      }) as number;

      // Create a new sale item for each item
      items.forEach(async (item) => {
        await this.conn.insert('sale_item', {
          sale_id: saleId,
          item_id: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
          cost: item.product.cost
        })
      })

      return saleId;
    });
  }
}

const objectToSnakeCase = (obj: any) => {
  return Object.keys(obj).reduce((acc: any, key) => {
    acc[key.toLowerCase().replace(/([A-Z])/g, '_$1')] = obj[key];
    return acc;
  }, {} as any);
};
