type LogLevel = "LOG" | "INFO" | "WARN" | "ERROR" | "TRACE" | "DEBUG";
type LogListener = (log: LogEntry | null) => void;

export interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: Date;
}

class LoggingService {
  private logs: LogEntry[] = [];
  private listeners: Set<LogListener> = new Set();

  log(message: string, data?: any) {
    this.addLog("LOG", message, data);
  }

  info(message: string, data?: any) {
    this.addLog("INFO", message, data);
  }

  warn(message: string, data?: any) {
    this.addLog("WARN", message, data);
  }

  error(message: string, data?: any) {
    this.addLog("ERROR", message, data);
    console.error(message, data);
  }

  debug(message: string, data?: any) {
    this.addLog("DEBUG", message, data);
  }

  trace(message: string, data?: any) {
    this.addLog("TRACE", message, data);
  }

  private serializeData(data: any): any {
    if (data === undefined || data === null) return data;

    if (data instanceof Error) {
      return {
        name: data.name,
        message: data.message,
        stack: data.stack,
        // capturing additional properties if any
        ...data,
      };
    }

    if (typeof data === "object") {
      try {
        // Shallow check for Error objects in properties to fix common case
        const copy: any = Array.isArray(data) ? [] : {};
        const SENSITIVE_KEYS = /token|password|secret|auth|key/i;
        for (const key in data) {
          if (data[key] instanceof Error) {
            copy[key] = this.serializeData(data[key]);
          } else if (
            SENSITIVE_KEYS.test(key) &&
            typeof data[key] === "string"
          ) {
            copy[key] = "[REDACTED]";
          } else {
            copy[key] = data[key];
          }
        }
        return copy;
      } catch (e) {
        return data;
      }
    }

    return data;
  }

  private addLog(level: LogLevel, message: string, data?: any) {
    const processedData = this.serializeData(data);
    const logEntry: LogEntry = {
      level,
      message,
      data: processedData,
      timestamp: new Date(),
    };
    this.logs.push(logEntry);
    this.listeners.forEach((listener) => listener(logEntry));
  }

  clearLogs() {
    this.logs = [];
    this.listeners.forEach((listener) => listener(null)); // Notify listeners to clear
    this.log("Logs cleared by user.");
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  subscribe(listener: LogListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const loggingService = new LoggingService();
