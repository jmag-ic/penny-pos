import { signalStore } from "@ngrx/signals";
import { Product } from "@pos/models";
import { withPagination } from "../shared/with-pagination";
import { InventoryService } from "./inventory-service";

export const InventoryStore = signalStore(
  { providedIn: 'root' },
  withPagination<Product>(InventoryService),
);