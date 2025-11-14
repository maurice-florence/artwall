// src/utils/performance.ts
// filepath: c:\Users\friem\OneDrive\Documenten\GitHub\artwall\src\utils\performance.ts
import { logger } from '@/utils/logger';

export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  logger.debug(`${name} took ${(end - start).toFixed(2)} ms`);
};

export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};