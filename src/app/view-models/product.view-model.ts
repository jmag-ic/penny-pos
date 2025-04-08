import { Product } from "@pos/models";

export interface ProductViewModel extends Product {
  categoryName: string;
}