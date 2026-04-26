function timestamp(): string {
  return new Date().toISOString();
}

const logger = {
  info(message: string, ...args: unknown[]): void {
    console.log(`[${timestamp()}] INFO: ${message}`, ...args);
  },

  warn(message: string, ...args: unknown[]): void {
    console.warn(`[${timestamp()}] WARN: ${message}`, ...args);
  },

  error(message: string, ...args: unknown[]): void {
    console.error(`[${timestamp()}] ERROR: ${message}`, ...args);
  },
};

export { logger };
export default logger;
