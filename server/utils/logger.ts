/**
 * 统一的日志工具
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
}

class Logger {
  private static instance: Logger;
  
  private constructor() {}
  
  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }
  
  private formatMessage(level: LogLevel, message: string, context?: Record<string, any>): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context
    };
  }
  
  private log(entry: LogEntry): void {
    const logString = JSON.stringify(entry);
    
    switch (entry.level) {
      case 'error':
        console.error(logString);
        break;
      case 'warn':
        console.warn(logString);
        break;
      case 'debug':
        console.debug(logString);
        break;
      default:
        console.log(logString);
    }
    
    // 这里可以添加日志持久化逻辑
    // 例如写入文件或发送到日志服务
  }
  
  info(message: string, context?: Record<string, any>): void {
    this.log(this.formatMessage('info', message, context));
  }
  
  warn(message: string, context?: Record<string, any>): void {
    this.log(this.formatMessage('warn', message, context));
  }
  
  error(message: string, context?: Record<string, any>): void {
    this.log(this.formatMessage('error', message, context));
  }
  
  debug(message: string, context?: Record<string, any>): void {
    if (process.env.NODE_ENV === 'development') {
      this.log(this.formatMessage('debug', message, context));
    }
  }
}

export const logger = Logger.getInstance(); 