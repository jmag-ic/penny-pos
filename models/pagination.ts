export interface Page<T> {
  items: T[];
  total: number;
}

export type SortOrder = 'ascend' | 'descend';
export type OrderBy<T> = {[key in keyof T]?: SortOrder}

export type FilterOperator = 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'like';
export type FilterCondition = {op: FilterOperator, value: any}
export type Filter = FilterCondition | FilterCondition[];

export interface PageParams<T> {
  filter?: {[key in keyof T]?: Filter};
  orderBy?: OrderBy<T>;
  limit?: number;
  offset?: number;
}