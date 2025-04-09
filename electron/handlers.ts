import { ipcMain } from "electron";

import { SqliteDb } from "../db/sqlite";
import { ProductEntity, PageParams, SaleDTO, SaleEntity } from "../models";
import { ProductRepository, CategoryRepository, SaleRepository, SaleItemRepository } from "../repository";

// IPC main handlers
const conn = new SqliteDb('./penny-pos.sqlite');
const productRepo = new ProductRepository(conn);
const categoryRepo = new CategoryRepository(conn);
const saleRepo = new SaleRepository(conn);
const saleItemRepo = new SaleItemRepository(conn);

export const loadHandlers = () => {
  // Items API
  ipcMain.handle('searchItems', async (_, {pageParams}: {pageParams: PageParams}) => {
    const productsPage = await productRepo.pagedSearch(pageParams, ['name', 'description'], true);
    const productsData = await productRepo.loadRelated(categoryRepo, productsPage.items, 'categoryId', 'category');
    
    return {
     ...productsPage,
     items: productsData
    };
  });

  // Sales API
  ipcMain.handle('checkout', (_, saleDTO: SaleDTO) => {    
    return conn.transaction<SaleDTO>(async () => {
      // Get products data
      const productIds = saleDTO.items.map(item => item.itemId);
      const productsMap = new Map((await productRepo.getBulk(productIds))
        .map(product => [product.id, product]));

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
    });
  });

  // Items API
  ipcMain.handle('createItem', (_, {item}: {item: ProductEntity}) => {
    return productRepo.create(item);
  });


  ipcMain.handle('updateItem', (_, {item}: {item: ProductEntity}) => {
    return productRepo.update(item.id, item);
  });

  ipcMain.handle('deleteItem', (_, {id}: {id: number}) => {
    return productRepo.delete(id);
  });

  // Catalogs API
  ipcMain.handle('getCategories', () => {
    return categoryRepo.getAll('name');
  });
}