// src/utils/logger.ts
// Centralized lightweight logging utility. In production, only errors are emitted.
// In development, all levels log. Swap implementations or extend as needed.
type LogFn = (...args: any[]) => void;

const isDev = process.env.NODE_ENV !== 'production';

const noop: LogFn = () => {};

export const logger = {
  log: isDev ? ((...args: any[]) => console.log(...args)) : noop,
  info: isDev ? ((...args: any[]) => console.info(...args)) : noop,
  warn: isDev ? ((...args: any[]) => console.warn(...args)) : noop,
  debug: isDev ? ((...args: any[]) => console.debug(...args)) : noop,
  error: ((...args: any[]) => console.error(...args)), // always log errors
};

export default logger;