import { objectToSnakeCase, toSnakeCase } from './strings';

describe('Case Conversion Utils', () => {
  describe('toSnakeCase', () => {
    it('should convert camelCase to snake_case', () => {
      expect(toSnakeCase('categoryId')).toBe('category_id');
      expect(toSnakeCase('firstName')).toBe('first_name');
      expect(toSnakeCase('userAddress')).toBe('user_address');
      expect(toSnakeCase('productCategoryId')).toBe('product_category_id');
    });
  });

  describe('objectToSnakeCase', () => {
    it('should convert object keys from camelCase to snake_case', () => {
      const input = {
        categoryId: 1,
        productName: 'Test Product',
        priceAmount: 100,
        nestedObject: {
          innerValue: 'test',
          deepNested: {
            anotherValue: 123
          }
        },
        arrayItems: [
          { itemId: 1, itemName: 'Item 1' },
          { itemId: 2, itemName: 'Item 2' }
        ]
      };

      const expected = {
        category_id: 1,
        product_name: 'Test Product',
        price_amount: 100,
        nested_object: {
          inner_value: 'test',
          deep_nested: {
            another_value: 123
          }
        },
        array_items: [
          { item_id: 1, item_name: 'Item 1' },
          { item_id: 2, item_name: 'Item 2' }
        ]
      };

      expect(objectToSnakeCase(input)).toEqual(expected);
    });

    it('should handle arrays', () => {
      const input = [
        { categoryId: 1, productName: 'Product 1' },
        { categoryId: 2, productName: 'Product 2' }
      ];

      const expected = [
        { category_id: 1, product_name: 'Product 1' },
        { category_id: 2, product_name: 'Product 2' }
      ];

      expect(objectToSnakeCase(input)).toEqual(expected);
    });

    it('should handle primitive values', () => {
      expect(objectToSnakeCase('test')).toBe('test');
      expect(objectToSnakeCase(123)).toBe(123);
      expect(objectToSnakeCase(null)).toBe(null);
      expect(objectToSnakeCase(undefined)).toBe(undefined);
    });
  });
}); 