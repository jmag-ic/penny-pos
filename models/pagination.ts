export interface Page<T> {
  items: T[];
  total: number;
}

export type SortOrder = 'ascend' | 'descend';
export type OrderBy<T> = {[key in keyof T]?: SortOrder}

export interface PageParams<T> {
  text?: string;
  orderBy?: OrderBy<T>;
  limit?: number;
  offset?: number;
}