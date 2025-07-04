import { ipcMain } from "electron";
import { DatabaseManager, Transactional } from "../db";
import { ProductEntity, PageParams, SaleDTO, SaleEntity } from "../models";
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
  async searchProducts(pageParams: PageParams<ProductEntity>) {
    const productsPage = await productRepo.getPage(pageParams);
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
    const productIds = saleDTO.items.map(item => item.productId);
    const productsMap = await productRepo.getBulkMap(productIds);

    // Calculate total amount of the sale
    const totalAmount = saleDTO.items.reduce((acc, item) => {
      const product = productsMap.get(item.productId);
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
      const product = productsMap.get(item.productId);
      return saleItemRepo.create({
        saleId: saleEntity.id,
        productId: item.productId,
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
    return categoryRepo.getAll({name: 'ascend'});
  }


  // Sales API
  @Transactional()
  async getSalesAmount(startDate: string, endDate: string) {
    return saleRepo.getSalesAmount(startDate, endDate);
  }
  
  @Transactional()
  async searchSales(pageParams: PageParams<SaleEntity>) {
    return saleRepo.getPage(pageParams);
  }

  @Transactional()
  async deleteSale(id: number) {
    return saleRepo.delete(id);
  }

  @Transactional()
  async updateSale(sale: SaleEntity) {
    // get the sale from the database
    const saleDB = await saleRepo.getById(sale.id);
    // preserve the total amount. It can't be changed unless the items are changed
    sale.totalAmount = saleDB.totalAmount;
    
    return saleRepo.update(sale.id, sale);
  }
}

const handlers = new Handlers();
export const loadHandlers = () => {
  // Register IPC handlers
  // Products API
  ipcMain.handle('searchProducts', (_, params: PageParams<ProductEntity>) =>  handlers.searchProducts(params));
  ipcMain.handle('createProduct', (_, params: ProductEntity) => handlers.createProduct(params));
  ipcMain.handle('updateProduct', (_, params: ProductEntity) => handlers.updateProduct(params));
  ipcMain.handle('deleteProduct', (_, id: number) => handlers.deleteProduct(id));

  // Sales API
  ipcMain.handle('checkout', (_, params: SaleDTO) => handlers.checkout(params));
  ipcMain.handle('searchSales', (_, params: PageParams<SaleEntity>) => handlers.searchSales(params));
  ipcMain.handle('deleteSale', (_, id: number) => handlers.deleteSale(id));
  ipcMain.handle('getSalesAmount', (_, startDate: string, endDate: string) => handlers.getSalesAmount(startDate, endDate));
  ipcMain.handle('updateSale', (_, params: SaleEntity) => handlers.updateSale(params));
  // Catalogs API
  ipcMain.handle('getCategories', () => handlers.getCategories());
};