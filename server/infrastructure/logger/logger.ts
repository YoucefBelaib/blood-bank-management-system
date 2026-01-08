type LogLevel = "info" | "warn" | "error" | "debug";

interface Logger {
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
  log(message: string): void;
}

function formatTime(): string {
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

export const logger: Logger = {
  info(message: string, ...args: any[]): void {
    console.log(`[${formatTime()}] INFO: ${message}`, ...args);
  },
  warn(message: string, ...args: any[]): void {
    console.warn(`[${formatTime()}] WARN: ${message}`, ...args);
  },
  error(message: string, ...args: any[]): void {
    console.error(`[${formatTime()}] ERROR: ${message}`, ...args);
  },
  debug(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV === "development") {
      console.log(`[${formatTime()}] DEBUG: ${message}`, ...args);
    }
  },
  log(message: string): void {
    console.log(`[${formatTime()}] ${message}`);
  },
};
