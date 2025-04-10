import { Database, RunResult } from 'sqlite3';
import { objectToSnakeCase } from '../utils';
import { QueryBuilder } from './query';

// SqliteDb is a wrapper class around the SQLite Database object
export class SqliteDb {
  private db: Database;

  constructor(dbConnString: string) {
    this.db = new Database(dbConnString)
  }

  getDb(): Database {
    return this.db
  }

  query(tableName: string): QueryBuilder {
    return new QueryBuilder(this.db, tableName)
  }

  insert(tableName: string, data: any): Promise<number | string> {
    data = objectToSnakeCase(data);
    const params = Object.values(data);
    const statement = `INSERT INTO ${tableName} (${Object.keys(data).join(', ')}) VALUES (${params.map(() => '?').join(', ')})`
    
    return new Promise((resolve, reject) => {
      this.db.run(statement, params, function(this: RunResult, err: Error) {
        if (err) reject(err);
        resolve(this.lastID);
      });
    });
  }

  update(id: number | string, tableName: string, data: any) {
    data = objectToSnakeCase(data);
    const params = Object.values(data).concat(id);
    const statement = `UPDATE ${tableName} SET ${Object.keys(data).map(key => `${key} = ?`).join(', ')} WHERE id = ?`
    
    return new Promise<void>((resolve, reject) => {
      this.db.run(statement, params, (err: Error) => {
        if (err) reject(err);
        resolve();
      });
    });
  }

  delete(id: number | string, tableName: string) {
    const statement = `DELETE FROM ${tableName} WHERE id = ?`

    return new Promise<void>((resolve, reject) => {
      this.db.run(statement, [id], (err: Error) => {
        if (err) reject(err);
        resolve();
      });
    });
  }


  tx<T>(callback: () => Promise<T>): Promise<T> {
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
