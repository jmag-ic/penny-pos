import { ipcMain } from "electron";
import { DatabaseManager } from "../db/manager";
import { ProductEntity, PageParams, SaleDTO } from "../models";
import { ProductRepository, CategoryRepository, SaleRepository, SaleItemRepository } from "../repository";
import { Transactional } from "./decorators";

// Create repository instances using the singleton database connection
const db = DatabaseManager.getInstance();
const productRepo = new ProductRepository(db);
const categoryRepo = new CategoryRepository(db);
const saleRepo = new SaleRepository(db);
const saleItemRepo = new SaleItemRepository(db);

class Handlers {
  // Items API
  @Transactional()
  async searchItems(pageParams: PageParams) {
    const productsPage = await productRepo.pagedSearch(pageParams, ['name', 'description'], true);
    const productsData = await productRepo.loadRelated(categoryRepo, productsPage.items, 'categoryId', 'category');
    
    return {
      ...productsPage,
      items: productsData
    };
  }

  // Sales API
  @Transactional()
  async checkout(saleDTO: SaleDTO) {
    // Get products data
    const productIds = saleDTO.items.map(item => item.itemId);
    const productsMap = await productRepo.getBulkMap(productIds);

    // Calculate total amount of the sale
    const totalAmount = saleDTO.items.reduce((acc, item) => {
      const product = productsMap.get(item.itemId);
      if (!product) return acc;
      return acc + product.price * item.quantity;
    }, 0); 

    const saleEntity = await saleRepo.create({
      totalAmount: totalAmount,
      paymentAmount: saleDTO.paymentAmount,
      customerName: saleDTO.customerName,
      paymentMethod: saleDTO.paymentMethod
    });

    const saleItems = await Promise.all(saleDTO.items.map(item => {
      const product = productsMap.get(item.itemId);
      return saleItemRepo.create({
        saleId: saleEntity.id,
        itemId: item.itemId,
        quantity: item.quantity,
        price: product?.price,
        cost: product?.cost
      }); 
    }));

    return {
      ...saleEntity,
      items: saleItems
    };
  }

  // Items API
  @Transactional()
  async createItem(item: ProductEntity) {
    return productRepo.create(item);
  }

  @Transactional()
  async updateItem(item: ProductEntity) {
    return productRepo.update(item.id, item);
  }

  @Transactional()
  async deleteItem(id: number) {
    return productRepo.delete(id);
  }

  // Catalogs API
  @Transactional()
  async getCategories() {
    return categoryRepo.getAll('name');
  }
}

const handlers = new Handlers();
export const loadHandlers = () => {
  // Register IPC handlers
  ipcMain.handle('searchItems', (_, params: PageParams) =>  handlers.searchItems(params));
  ipcMain.handle('checkout', (_, params: SaleDTO) => handlers.checkout(params));
  ipcMain.handle('createItem', (_, params: ProductEntity) => handlers.createItem(params));
  ipcMain.handle('updateItem', (_, params: ProductEntity) => handlers.updateItem(params));
  ipcMain.handle('deleteItem', (_, id: number) => handlers.deleteItem(id));
  ipcMain.handle('getCategories', () => handlers.getCategories());
};