import { Database, RunResult } from 'sqlite3';
import { objectToSnakeCase } from '../utils';
import { QueryBuilder } from './query';

// SqliteDb is a wrapper class around the SQLite Database object
export class SqliteDb {
  private db: Database;
  private inTransaction: boolean = false;

  constructor(dbConnString: string) {
    this.db = new Database(dbConnString)
  }

  getDb(): Database {
    return this.db
  }

  query<T>(tableName: string): QueryBuilder<T> {
    return new QueryBuilder<T>(this.db, tableName)
  }

  insert<T>(tableName: string, idColumn: keyof T, data: Partial<T>): Promise<number | string> {
    const dataObject = objectToSnakeCase(data);
    const params = Object.values(dataObject);
    const statement = `INSERT INTO ${tableName} (${Object.keys(dataObject).join(', ')}) VALUES (${params.map(() => '?').join(', ')})`
    
    return new Promise((resolve, reject) => {
      this.db.run(statement, params, function(this: RunResult, err: Error) {
        if (err) reject(err);
        resolve((data[idColumn] as string | number) || this.lastID);
      });
    });
  }

  update<T>(id: number | string, tableName: string, idColumn: keyof T, data: Partial<T>) {
    const dataObject = objectToSnakeCase(data);
    const params = Object.values(dataObject).concat(id);
    const statement = `UPDATE ${tableName} SET ${Object.keys(dataObject).map(key => `${key} = ?`).join(', ')} WHERE ${idColumn.toString()} = ?`
    
    return new Promise<void>((resolve, reject) => {
      this.db.run(statement, params, (err: Error) => {
        if (err) reject(err);
        resolve();
      });
    });
  }

  delete<T>(id: number | string, tableName: string, idColumn: keyof T) {
    const statement = `DELETE FROM ${tableName} WHERE ${idColumn.toString()} = ?`

    return new Promise<void>((resolve, reject) => {
      this.db.run(statement, [id], (err: Error) => {
        if (err) reject(err);
        resolve();
      });
    });
  }


  tx<T>(callback: () => Promise<T>): Promise<T> {
    // Prevent nested transactions errors
    if (this.inTransaction) {
      return callback();
    }

    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run("BEGIN TRANSACTION");
        this.inTransaction = true;
        callback().then((result: T) => {
          this.db.run("COMMIT");
          this.inTransaction = false;
          resolve(result);
        }).catch((err: Error) => {
          this.db.run("ROLLBACK");
          this.inTransaction = false;
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
