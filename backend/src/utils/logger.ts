// ============================================
// Logger Utility - Console logging ka wrapper
// Yeh file application mein consistent logging
// provide karti hai with timestamps
// ============================================

// Log levels define karte hain - kaunsa level kab use hoga
enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
}

// Logger class - singleton pattern use kar rahe hain
// taaki poori app mein ek hi logger instance ho
class Logger {
  // Current timestamp return karta hai formatted string mein
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  // Format karta hai log message ko readable tarike se
  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = this.getTimestamp();
    const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] ${message}${metaStr}`;
  }

  // Info level log - normal operations ke liye
  info(message: string, meta?: any): void {
    console.log(this.formatMessage(LogLevel.INFO, message, meta));
  }

  // Warning level log - potential issues ke liye
  warn(message: string, meta?: any): void {
    console.warn(this.formatMessage(LogLevel.WARN, message, meta));
  }

  // Error level log - errors aur exceptions ke liye
  error(message: string, meta?: any): void {
    console.error(this.formatMessage(LogLevel.ERROR, message, meta));
  }

  // Debug level log - development mein debugging ke liye
  // Production mein yeh automatically band ho jaata hai
  debug(message: string, meta?: any): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, meta));
    }
  }
}

// Ek hi instance export karte hain poori app ke liye
export const logger = new Logger();
