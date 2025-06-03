import { objectToSnakeCase } from "../utils";
import { SqliteDb, Transactional, utils } from "../db";
import { PageParams, Page, OrderBy, FilterOperator, Filter, FilterCondition } from "../models";

type TableMetadata<T> = {
  table: string;
  idColumn: keyof T;
  ftsTable?: string;
}

// Sqlite operators dictionary
const sqlOpDict: Record<FilterOperator, string> = {
  eq: '=',
  neq: '!=',
  gt: '>',
  lt: '<',
  gte: '>=',
  lte: '<=',
  like: 'LIKE'
}

export abstract class Repository<T> {

  constructor(protected conn: SqliteDb, protected metadata: TableMetadata<T>) {}

  getId(entity: T): number | string {
    return entity[this.metadata.idColumn] as number | string;
  }

  @Transactional()
  async create(data: Partial<T>): Promise<T> {
    const id = await this.conn.insert(this.metadata.table, this.metadata.idColumn, data);
    return this.getById(id);
  }

  @Transactional()
  async update(id: number | string, data: Partial<T>): Promise<T> {
    await this.conn.update(id, this.metadata.table, this.metadata.idColumn, data);
    return this.getById(id);
  }

  @Transactional()
  async delete(id: number | string): Promise<T> {
    const data = await this.getById(id);
    await this.conn.delete(id, this.metadata.table, this.metadata.idColumn);
    return data;
  }

  getAll(orderBy?: OrderBy<T>): Promise<T[]> {
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

  async getBulkMap(ids: (string | number)[]): Promise<Map<string | number, T>> {
    const entities = await this.getBulk(ids);
    return new Map(entities.map(entity => [this.getId(entity), entity]));
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
    
    return await repository.getBulkMap(ids);
  }

  @Transactional()
  async getPage(pageParams: PageParams<T>): Promise<Page<T>> {
    const itemsQuery = this.conn.query(this.metadata.table);
    const totalQuery = this.conn.query(this.metadata.table).columns('COUNT(*) total');

    const filter = objectToSnakeCase(pageParams.filter);

    // Handle regular filters
    const { conditions: filterConditions, params: filterParams, likeFilters } = 
      this.buildFilterConditions(filter);

    // Handle like conditions and FTS
    const { conditions: likeConditions, params: likeParams } = 
      this.buildLikeConditions(likeFilters);

    // Combine all conditions
    const allConditions = [...filterConditions, likeConditions.join(' OR ')];
    const allParams = [...filterParams, ...likeParams];

    if (allConditions.length > 0) {
      // Remove empty conditions and join with AND
      const whereClause = `${allConditions.filter(c => !!c.trim()).join(' AND ')}`;
      itemsQuery.where(whereClause, ...allParams);
      totalQuery.where(whereClause, ...allParams);
    }

    // Apply pagination
    this.applyPagination(itemsQuery, pageParams);

    return {
      items: await itemsQuery.build().all<T>(),
      total: (await totalQuery.build().get<{ total: number }>()).total
    };
  }

  private buildFilterConditions(filter: { [key in keyof T]?: Filter | undefined } | undefined): { 
    conditions: string[], 
    params: any[],
    likeFilters: { value: string, columns: string[] }[] 
  } {
    const conditions: string[] = [];
    const params: any[] = [];
    const likeFilters: { value: string, columns: string[] }[] = [];

    if (!filter) return { conditions, params, likeFilters };

    Object.entries(filter).forEach(([column, filter]) => {
      if (!filter) return;
      // Handle both single condition and array of conditions
      const filterConditions = Array.isArray(filter) ? filter : [filter];

      filterConditions.forEach((condition: FilterCondition) => {
        const { op, value } = condition;

        if (op === 'like') {
          const item = likeFilters.find(f => f.value === value);
          if (item) {
            item.columns.push(column);
          } else {
            likeFilters.push({ value, columns: [column] });
          }
        } else if (sqlOpDict[op]) {
          conditions.push(`${column} ${sqlOpDict[op]} ?`);
          params.push(value);
        }
      });
    });

    return { conditions, params, likeFilters };
  }

  private buildLikeConditions(likeFilters: { value: string, columns: string[] }[]): {
    conditions: string[],
    params: any[],
    matchValues: string[]
  } {
    const conditions: string[] = [];
    const params: any[] = [];
    const matchValues: string[] = [];

    likeFilters.forEach(f => {
      const { likeClause, params: _params } = utils.exhaustLike(f.value, ...f.columns);
      conditions.push(likeClause);
      params.push(..._params);

      if (this.metadata.ftsTable && !matchValues.find(v => v === f.value)) {
        matchValues.push(f.value.includes(' ') ? `${f.value.split(' ').join('* ')}*` : `${f.value}*`);
      }
    });

    if (this.metadata.ftsTable && matchValues.length > 0) {
      conditions.push(`id IN (SELECT rowid FROM ${this.metadata.ftsTable} WHERE ${this.metadata.ftsTable} MATCH ?)`);
      params.push(matchValues.join(' OR '));
    }

    return { conditions, params, matchValues };
  }

  private applyPagination(query: any, pageParams: PageParams<T>): void {
    if (pageParams.orderBy) {
      query.orderBy(pageParams.orderBy);
    }
    if (pageParams.limit) {
      query.limit(pageParams.limit);
    }
    if (pageParams.offset) {
      query.offset(pageParams.offset);
    }
  }
}