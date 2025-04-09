import { SqliteDb, utils } from "../db/sqlite";
import { PageParams, Page } from "../models";

type RepositoryMetadata<T> = {
  table: string;
  idColumn: keyof T;
}

export abstract class Repository<T> {

  constructor(protected conn: SqliteDb, protected metadata: RepositoryMetadata<T>) {}

  getId(entity: T): number | string {
    return entity[this.metadata.idColumn] as number | string;
  }

  async create(data: Partial<T>): Promise<T> {
    // return this.conn.transaction(async () => {
    const id = await this.conn.insert(this.metadata.table, data);
    return this.getById(id);
    // });
  }

  update(id: number | string, data: Partial<T>): Promise<T> {
    return this.conn.transaction(async () => {
      await this.conn.update(id, this.metadata.table, data);
      return this.getById(id);
    });
  }

  delete(id: number | string): Promise<T> {
    return this.conn.transaction(async () => {
      const data = await this.getById(id);
      await this.conn.delete(id, this.metadata.table);
      return data;
    });
  }

  getAll(orderBy?: string): Promise<T[]> {
    const query = this.conn.query(this.metadata.table);
    if (orderBy) {
      query.orderBy(orderBy)
    }
    return query.build().all();
  }

  getById(id: number | string): Promise<T> {
    return this.conn.query(this.metadata.table)
      .where(`${this.metadata.idColumn as string} = ?`, id)
      .build()
      .get();
  }

  getBulk(ids: (string | number)[]): Promise<T[]> {
    ids = Array.from(new Set(ids.map(id => String(id))));
    const placeholders = ids.map(() => '?').join(',');

    return this.conn.query(this.metadata.table)
      .where(`${this.metadata.idColumn as string} IN (${placeholders})`, ...ids)
      .build()
      .all();
  }

  async loadRelated<R, D>(repository: Repository<R>, entities: T[], foreignKey: keyof T, relatedKey: keyof D): Promise<D[]> {
    const relationMap = await this.getRelated(repository, entities, foreignKey);
    return entities.map(entity => {
      return {
        ...entity,
        [relatedKey]: relationMap.get(entity[foreignKey] as string | number)
      } as D;
    });
  }

  async getRelated<R>(repository: Repository<R>, items: T[], foreignKey: keyof T): Promise<Map<string | number, R>> {
    const ids = items.map(item => item[foreignKey])
      .filter(id => id != null)
      .map(id => id as string | number);
    
    if (ids.length === 0) return new Map();
    
    const relatedItems = await repository.getBulk(ids);
    return new Map(relatedItems.map(item => [repository.getId(item), item]));
  }

  pagedSearch(pageParams: PageParams, searchColumns: string[] = [], fts: boolean = false): Promise<Page<T>> {
    const itemsQuery = this.conn.query(this.metadata.table);
    const totalQuery = this.conn.query(this.metadata.table).columns('COUNT(*) total')

    if (pageParams.text) {
      const {likeClause, params} = utils.exhaustLike(pageParams.text, ...searchColumns)
      let whereClause = likeClause

      if (fts) {
        whereClause += ` OR id IN (SELECT rowid FROM ${this.metadata.table}_fts WHERE ${this.metadata.table}_fts MATCH ?)`
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

    return this.conn.transaction(async () => ({
      items: await itemsQuery.build().all<T>(),
      total: (await totalQuery.build().get<{ total: number }>()).total
    }))
  }
}