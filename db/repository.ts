import { Database, RunResult } from "sqlite3";
import { SqliteDb, utils } from "./sqlite"

// IRepository is an interface that defines the methods to interact with the database
export interface IRepository {
  getItems(text: string, limit: number, offset: number): Promise<any[]>
  checkout(items: any[], paymentAmount: number, customerName: string, paymentMethod: string): Promise<any>
}

// Repository is a class that implements the IRepository interface
export class Repository implements IRepository {
  
  constructor(private conn: SqliteDb) {}

  // getItems method retrieves items from the database based on a search text, limit, and offset
  getItems(text: string, limit: number, offset: number): Promise<any[]> {

    // Extract search text and build like clause for name and description fields
    const { likeClause, params } = utils.exhaustLike(text, 'name', 'description')

    // Build and execute query
    return this.conn.query('item')
      .where(likeClause, ...params)
      .orderBy('name')
      .limit(limit)
      .offset(offset)
      .build()
      .all()
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