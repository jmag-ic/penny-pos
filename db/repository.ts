import { SqliteDb, utils } from "./sqlite"

// IRepository is an interface that defines the methods to interact with the database
export interface IRepository {
  getItems(text: string, limit: number, offset: number): Promise<any[]>
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
}