const DEBUG_PREFIX = '[WPROTECT-DEBUG]';

export const debugLog = (scope: string, message: string, data?: unknown): void => {
  if (data !== undefined) {
    console.log(`${DEBUG_PREFIX} [${scope}] ${message}`, data);
    return;
  }

  console.log(`${DEBUG_PREFIX} [${scope}] ${message}`);
};

export const debugError = (scope: string, message: string, error: unknown): void => {
  console.error(`${DEBUG_PREFIX} [${scope}] ${message}`, error);
};
