import { DatabaseManager } from "./manager";

/**
 * Decorator that wraps a method with a database transaction
 * @returns MethodDecorator
 */
export function Transactional() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    // Validate thet the descriptor is a function
    if (typeof descriptor.value !== 'function') {
      throw new Error('Transactional decorator can only be applied to methods');
    }

    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      return DatabaseManager.getInstance().tx(async () => {
        return originalMethod.apply(this, args);
      });
    };

    return descriptor;
  };
} 