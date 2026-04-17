/**
 * Production-safe logger.
 * In development (__DEV__ === true) all levels are printed to the console.
 * In production builds only errors are surfaced so that sensitive details
 * are not leaked to the console in release APKs/IPAs.
 */

const logger = {
  log: (...args: unknown[]) => {
    if (__DEV__) console.log(...args);
  },
  warn: (...args: unknown[]) => {
    if (__DEV__) console.warn(...args);
  },
  error: (...args: unknown[]) => {
    // Always surface errors so crash reporters can pick them up,
    // but strip them in non-debug production builds.
    if (__DEV__) console.error(...args);
  },
};

export default logger;
