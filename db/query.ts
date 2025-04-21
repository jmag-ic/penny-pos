import { OrderBy } from "../models";
import { objectToCamelCase, objectToSnakeCase } from "../utils";
import { Database } from "sqlite3";

// QueryBuilder is a class that helps to build SQL statements
export class QueryBuilder {
  private db: Database;
  private table: string;
  private _columns: string;
  private _where: string = '';
  private _orderBy: string = '';
  private _limit: number = -1;
  private _offset: number = 0;
  private params: any[] = [];

  constructor(db: Database, table: string) {
    this.db = db
    this.table = table
    this._columns = '*'
  }

  // columns method sets the columns to be selected
  columns(columns: string): QueryBuilder {
    this._columns = columns
    return this
  }

  // where method sets the WHERE clause based on the provided condition and parameters
  where(where: string, ...params: any[]): QueryBuilder {
    this._where = where
    this.params = params
    return this
  }

  // orderBy method sets the ORDER BY clause
  orderBy(orderBy: OrderBy): QueryBuilder {
    this._orderBy = Object.entries(objectToSnakeCase(orderBy))
      .map(([field, order]) => `${field} ${order === 'ascend' ? 'ASC' : 'DESC'}`)
      .join(', ')
    return this
  }

  // limit method sets the LIMIT clause
  limit(limit: number): QueryBuilder {
    this._limit = limit
    return this
  }

  // offset method sets the OFFSET clause
  offset(offset: number): QueryBuilder {
    this._offset = offset
    return this
  }

  // build method builds the SQL query based on the builder current state
  build(): QueryExecutor {
    let query = `SELECT ${this._columns} FROM ${this.table}`
    if (this._where) {
      query += ` WHERE ${this._where}`
    }
    if (this._orderBy) {
      query += ` ORDER BY ${this._orderBy}`
    }
    if (this._limit > 0) {
      query += ` LIMIT ${this._limit}`
    }
    if (this._offset > 0) {
      query += ` OFFSET ${this._offset}`
    }

    query += ';'

    return new QueryExecutor(this.db, query, this.params)
  }
}


// QueryExecutor is a class used to execute SQL queries given a database connection, a query string, and query parameters
class QueryExecutor {
  private db: Database;
  private query: string;
  private params: any[];
  
  constructor(db: Database, query: string, params: any[]) {
    this.db = db
    this.query = query
    this.params = params
  }

  // all method exposes the all method of the SQLite Database object as a promise
  async all<T>(): Promise<T[]> {
    return this.promiseOf(this.query, 'all', this.params).then(
      (rows: T[]) => rows.map(row => objectToCamelCase(row))
    );
  }

  // get method exposes the get method of the SQLite Database object as a promise
  async get<T>(): Promise<T> {
    return this.promiseOf(this.query, 'get', this.params).then(
      (row: T) => objectToCamelCase(row)
    );
  }

  // promiseOf method is a helper method to wrap the callback-based SQLite methods into promises
  private promiseOf(sql: string, method: string, params: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      // It access progragmatically to the Database method using the method name
      (this.db as any)[method](sql, params, (err: Error, rows: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      })
    })
  }
}