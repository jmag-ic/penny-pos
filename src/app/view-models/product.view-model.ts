import { ProductEntity } from "@pos/models";

export interface ProductViewModel extends ProductEntity {
  categoryName: string;
}