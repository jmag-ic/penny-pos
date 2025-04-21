export interface Page<T> {
  items: T[];
  total: number;
}

export type SortOrder = 'ascend' | 'descend';
export type OrderBy = {[key: string]: SortOrder}

export interface PageParams {
  text?: string;
  orderBy?: OrderBy;
  limit?: number;
  offset?: number;
}