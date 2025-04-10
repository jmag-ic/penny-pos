import { SqliteDb } from "./sqlite";

export class DatabaseManager {
  private static instance: SqliteDb;
  private static dbPath: string = './penny-pos.sqlite';

  private constructor() {}

  public static getInstance(): SqliteDb {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new SqliteDb(DatabaseManager.dbPath);
    }
    return DatabaseManager.instance;
  }

  public static setDbPath(path: string) {
    if (DatabaseManager.instance) {
      throw new Error('Cannot change database path after connection has been established');
    }
    DatabaseManager.dbPath = path;
  }
}