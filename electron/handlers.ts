import { ipcMain } from "electron";
import { DatabaseManager, Transactional } from "../db";
import { ProductEntity, PageParams, SaleDTO } from "../models";
import { ProductRepository, CategoryRepository, SaleRepository, SaleItemRepository } from "../repository";

// Create repository instances using the singleton database connection
const db = DatabaseManager.getInstance();
const productRepo = new ProductRepository(db);
const categoryRepo = new CategoryRepository(db);
const saleRepo = new SaleRepository(db);
const saleItemRepo = new SaleItemRepository(db);

class Handlers {
  // Products API
  @Transactional()
  async searchProducts(pageParams: PageParams) {
    const productsPage = await productRepo.pagedSearch(pageParams, ['name', 'description'], true);
    const productsData = await productRepo.loadRelated(categoryRepo, productsPage.items, 'categoryId', 'category');
    
    return {
      ...productsPage,
      items: productsData
    };
  }

  @Transactional()
  async createProduct(product: ProductEntity) {
    const category = await categoryRepo.getOrCreate(product.categoryId);
    product.categoryId = category.id;
    return productRepo.create(product);
  }

  @Transactional()
  async updateProduct(product: ProductEntity) {
    const category = await categoryRepo.getOrCreate(product.categoryId);
    product.categoryId = category.id;
    return productRepo.update(product.id, product);
  }

  @Transactional()
  async deleteProduct(id: number) {
    return productRepo.delete(id);
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

  // Catalogs API
  @Transactional()
  async getCategories() {
    return categoryRepo.getAll('name');
  }
}

const handlers = new Handlers();
export const loadHandlers = () => {
  // Register IPC handlers
  // Products API
  ipcMain.handle('searchProducts', (_, params: PageParams) =>  handlers.searchProducts(params));
  ipcMain.handle('createProduct', (_, params: ProductEntity) => handlers.createProduct(params));
  ipcMain.handle('updateProduct', (_, params: ProductEntity) => handlers.updateProduct(params));
  ipcMain.handle('deleteProduct', (_, id: number) => handlers.deleteProduct(id));

  // Sales API
  ipcMain.handle('checkout', (_, params: SaleDTO) => handlers.checkout(params));

  // Catalogs API
  ipcMain.handle('getCategories', () => handlers.getCategories());
};