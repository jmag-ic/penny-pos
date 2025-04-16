/**
 * Converts a camelCase string to snake_case
 * @param str The string to convert
 * @returns The converted string in snake_case
 */
export const toSnakeCase = (str: string): string => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

/**
 * Converts a snake_case string to camelCase
 * @param str The string to convert
 * @returns The converted string in camelCase
 */
export const toCamelCase = (str: string): string => {
  return str.replace(/(_\w)/g, (_, letter) => letter.toUpperCase().replace('_', ''));
};

/**
 * Converts an object with camelCase keys to snake_case
 * @param obj The object to convert
 * @returns A new object with snake_case keys
 */
export const objectToSnakeCase = <T, D>(obj: T): D | any => {
  if (Array.isArray(obj)) {
    return obj.map(item => objectToSnakeCase(item)) as any;
  }
  
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        toSnakeCase(key),
        objectToSnakeCase(value)
      ])
    ) as any;
  }
  
  return obj as any;
}; 

/**
 * Converts an object with camelCase keys to snake_case
 * @param obj The object to convert
 * @returns A new object with snake_case keys
 */
export const objectToCamelCase = <T>(obj: T): T extends object ? any : T => {
  if (Array.isArray(obj)) {
    return obj.map(item => objectToCamelCase(item)) as any;
  }
  
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        toCamelCase(key),
        objectToCamelCase(value)
      ])
    ) as any;
  }

  return obj as any;
};

export const toSlug = (str: string): string => {
  return str.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
};
