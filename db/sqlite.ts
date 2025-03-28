import { Database, RunResult } from 'sqlite3';

// QueryBuilder is a class that helps to build SQL statements
class QueryBuilder {
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
  columns(columns: string) {
    this._columns = columns
    return this
  }

  // where method sets the WHERE clause based on the provided condition and parameters
  where(where: string, ...params: any[]) {
    this._where = where
    this.params = params
    return this
  }

  // orderBy method sets the ORDER BY clause
  orderBy(orderBy: string) {
    this._orderBy = orderBy
    return this
  }

  // limit method sets the LIMIT clause
  limit(limit: number) {
    this._limit = limit
    return this
  }

  // offset method sets the OFFSET clause
  offset(offset: number) {
    this._offset = offset
    return this
  }

  // build method builds the SQL query based on the builder current state
  build() {
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
  async all<T>() {
    return this.promiseOf(this.query, 'all', this.params)
      .then((rows: unknown) => <T[]>rows)
  }

  // get method exposes the get method of the SQLite Database object as a promise
  async get<T>() {
    return this.promiseOf(this.query, 'get', this.params)
      .then((row: unknown) => <T>row)
  }

  // promiseOf method is a helper method to wrap the callback-based SQLite methods into promises
  private promiseOf(sql: string, method: string, params: any[]) {
    return new Promise((resolve, reject) => {
      // It access progragmatically to the Database method using the method name
      (<any>this.db)[method](sql, params, (err: Error, rows: any) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
  }
}

// SqliteDb is a wrapper class around the SQLite Database object
export class SqliteDb {
  private db: Database;

  constructor(dbConnString: string) {
    this.db = new Database(dbConnString)
  }

  getDb() {
    return this.db
  }

  query(tableName: string) {
    return new QueryBuilder(this.db, tableName)
  }

  insert(tableName: string, data: any) {
    const params = Object.values(data);
    const statement = `INSERT INTO ${tableName} (${Object.keys(data).join(', ')}) VALUES (${params.map(() => '?').join(', ')})`
    
    return new Promise((resolve, reject) => {
      this.db.run(statement, params, function(this: RunResult, err: Error) {
        if (err) reject(err);
        resolve(this.lastID);
      });
    });
  }

  transaction<T>(callback: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run("BEGIN TRANSACTION");
        callback().then((result: T) => {
          this.db.run("COMMIT");
          resolve(result);
        }).catch((err: Error) => {
          this.db.run("ROLLBACK");
          reject(err);
        });
      });
    });
  }
}

// utils is an object that contains a set of utility functions to help with database operations
export const utils = {
  exhaustLike: (text: string, ...columns: string[]): { likeClause: string, params: any[] } => {
    // Permute text to generate all possible search combinations
    const texts =  permuteText(text, '%').map(t => `%${t}%`);

    // Build LIKE conditions for all the permutations and columns
    return {
      likeClause: columns.map(column => texts.map(() => `${column} LIKE ?`).join(' OR ')).join(' OR '),
      params: columns.flatMap(() => texts)
    };
  }
}

// permuteText is a function that generates all possible word permutations of a text
function permuteText(text: string, sep: string = " "): string[] {
  const words = text.split(" ").filter(word => word.trim() !== ""); // Split text into words and filter empty strings
  
  if (words.length === 0) {
    return [];
  }

  const permutations: string[] = [];

  function permute(arr: string[], current: string[] = []) {
    if (arr.length === 0) {
      permutations.push(current.join(sep));
    } else {
      for (let i = 0; i < arr.length; i++) {
        const remaining = arr.slice(0, i).concat(arr.slice(i + 1));
        permute(remaining, current.concat(arr[i]));
      }
    }
  }

  permute(words);

  return permutations;
}
