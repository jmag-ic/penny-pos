export interface Page<T> {
  items: T[];
  total: number;
}

export interface PageParams {
  text?: string;
  orderBy?: string;
  limit?: number;
  offset?: number;
}