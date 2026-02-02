import type { UnifiedLogEntry, LogLevel, LogSource } from "../types";
import { env } from "./env";

type LogListener = (log: UnifiedLogEntry | null) => void;

// Re-export types for backwards compatibility
export type { UnifiedLogEntry as LogEntry } from "../types";

// Sensitive keys regex for redaction
const SENSITIVE_KEYS =
  /token|password|secret|auth|key|cookie|authorization|credential/i;

/**
 * SSE Connection States
 */
export type SSEConnectionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting";

/**
 * Circular buffer with FIFO eviction - O(1) operations
 */
class CircularBuffer<T> {
  private buffer: (T | undefined)[];
  private head: number = 0;
  private count: number = 0;

  constructor(private maxSize: number) {
    this.buffer = new Array(maxSize);
  }

  push(item: T): void {
    this.buffer[this.head] = item;
    this.head = (this.head + 1) % this.maxSize;
    if (this.count < this.maxSize) {
      this.count++;
    }
  }

  toArray(): T[] {
    if (this.count === 0) return [];

    const result: T[] = [];
    const start = this.count < this.maxSize ? 0 : this.head;

    for (let i = 0; i < this.count; i++) {
      const idx = (start + i) % this.maxSize;
      result.push(this.buffer[idx] as T);
    }
    return result;
  }

  clear(): void {
    this.buffer = new Array(this.maxSize);
    this.head = 0;
    this.count = 0;
  }

  get length(): number {
    return this.count;
  }
}

/**
 * Promise-based queue for async operations to prevent race conditions
 */
class AsyncQueue {
  private queue: Promise<void> = Promise.resolve();

  enqueue<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue = this.queue
        .then(() => operation())
        .then(resolve)
        .catch(reject);
    });
  }
}

/**
 * Unified Frontend Logging Service
 *
 * Features:
 * - Circular FIFO buffer (500 entries)
 * - Source tracking ('frontend')
 * - File:line extraction from stack traces
 * - SSE connection to backend for unified logs
 * - Automatic reconnection with exponential backoff
 */
class LoggingService {
  private buffer = new CircularBuffer<UnifiedLogEntry>(500);
  private listeners = new Set<LogListener>();
  private asyncQueue = new AsyncQueue();

  // SSE connection state
  private eventSource: EventSource | null = null;
  private sseState: SSEConnectionState = "disconnected";
  private sseStateListeners = new Set<(state: SSEConnectionState) => void>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: number | null = null;

  /**
   * Extract caller file and line from stack trace
   */
  private extractCaller(): { file: string; line: number } | null {
    const err = new Error();
    const stack = err.stack || "";
    const lines = stack.split("\n");

    // Skip Error line and internal methods, find first external caller
    for (let i = 3; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes("loggingService")) continue;

      // Match patterns like "at Component (file.tsx:10:5)" or "at file.tsx:10:5"
      // Also handle webpack/vite transformed paths
      const match = line.match(
        /at\s+(?:.*?\s+\()?(?:.*?\/)?([^\/\s]+?):(\d+):\d+\)?/
      );
      if (match) {
        return { file: match[1], line: parseInt(match[2], 10) };
      }
    }
    return null;
  }

  /**
   * Serialize and redact sensitive data
   */
  private serializeData(data: any): any {
    if (data === undefined || data === null) return data;

    if (data instanceof Error) {
      return {
        name: data.name,
        message: data.message,
        stack: data.stack,
      };
    }

    if (typeof data === "object") {
      try {
        const copy: any = Array.isArray(data) ? [] : {};
        for (const key in data) {
          if (data[key] instanceof Error) {
            copy[key] = this.serializeData(data[key]);
          } else if (
            SENSITIVE_KEYS.test(key) &&
            typeof data[key] === "string"
          ) {
            copy[key] = "[REDACTED]";
          } else if (typeof data[key] === "object" && data[key] !== null) {
            copy[key] = this.serializeData(data[key]);
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

  /**
   * Create a unified log entry
   */
  private createEntry(
    level: LogLevel,
    message: string,
    data?: any
  ): UnifiedLogEntry {
    const caller = this.extractCaller();
    return {
      level,
      message,
      data: this.serializeData(data),
      timestamp: new Date().toISOString(),
      source: "frontend" as LogSource,
      file: caller?.file,
      line: caller?.line,
    };
  }

  /**
   * Add log entry to buffer and notify listeners
   */
  private addLog(level: LogLevel, message: string, data?: any): void {
    const entry = this.createEntry(level, message, data);
    this.buffer.push(entry);
    this.listeners.forEach((listener) => listener(entry));
  }

  // =========================================================
  // Public logging methods
  // =========================================================

  log(message: string, data?: any): void {
    this.addLog("LOG", message, data);
  }

  info(message: string, data?: any): void {
    this.addLog("INFO", message, data);
  }

  warn(message: string, data?: any): void {
    this.addLog("WARN", message, data);
  }

  error(message: string, data?: any): void {
    this.addLog("ERROR", message, data);
    console.error(`[LoggingService] ${message}`, data);
  }

  debug(message: string, data?: any): void {
    this.addLog("DEBUG", message, data);
  }

  trace(message: string, data?: any): void {
    this.addLog("TRACE", message, data);
  }

  // =========================================================
  // Buffer management
  // =========================================================

  clearLogs(): void {
    this.buffer.clear();
    this.listeners.forEach((listener) => listener(null));
    this.log("Logs cleared by user.");
  }

  getLogs(): UnifiedLogEntry[] {
    return this.buffer.toArray();
  }

  subscribe(listener: LogListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // =========================================================
  // SSE Connection to Backend
  // =========================================================

  /**
   * Get current SSE connection state
   */
  getSSEState(): SSEConnectionState {
    return this.sseState;
  }

  /**
   * Subscribe to SSE state changes
   */
  subscribeSSEState(listener: (state: SSEConnectionState) => void): () => void {
    this.sseStateListeners.add(listener);
    // Immediately notify of current state
    listener(this.sseState);
    return () => this.sseStateListeners.delete(listener);
  }

  private setSSEState(state: SSEConnectionState): void {
    this.sseState = state;
    this.sseStateListeners.forEach((listener) => listener(state));
  }

  /**
   * Connect to backend SSE log stream
   * Note: Uses cookies for auth (withCredentials)
   */
  connectToBackendStream(): void {
    if (this.eventSource) {
      this.info("SSE: Already connected or connecting");
      return;
    }

    this.setSSEState("connecting");

    const baseUrl = env.BACKEND_URL.replace(/\/$/, "");
    const url = `${baseUrl}/api/logs/stream`;

    this.info("SSE: Connecting to backend log stream", { url });

    const connectStartTime = Date.now();

    try {
      // EventSource with credentials for session cookie
      this.eventSource = new EventSource(url, { withCredentials: true });

      this.eventSource.onopen = () => {
        this.setSSEState("connected");
        this.reconnectAttempts = 0;
        this.info("SSE: Connected to backend log stream");
      };

      // Handle initial payload
      this.eventSource.addEventListener("init", (event: MessageEvent) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.logs && Array.isArray(payload.logs)) {
            // Merge backend logs into buffer, sorted by timestamp
            this.asyncQueue.enqueue(async () => {
              this.mergeBackendLogs(payload.logs);
            });
            this.info("SSE: Received initial logs", {
              count: payload.logs.length,
            });
          }
        } catch (e) {
          this.error("SSE: Failed to parse init payload", { error: e });
        }
      });

      // Handle streaming log messages
      this.eventSource.onmessage = (event: MessageEvent) => {
        try {
          const entry: UnifiedLogEntry = JSON.parse(event.data);
          if (entry.source === "backend") {
            this.buffer.push(entry);
            this.listeners.forEach((listener) => listener(entry));
          }
        } catch (e) {
          // Ignore parse errors for heartbeats
        }
      };

      this.eventSource.onerror = (event: Event) => {
        // Check if it's an auth error (401) - don't retry in that case
        // EventSource doesn't expose HTTP status, but we can detect immediate failure
        const timeSinceConnect = Date.now() - connectStartTime;
        if (timeSinceConnect < 1000 && this.reconnectAttempts === 0) {
          // Immediate failure on first attempt likely means auth issue
          this.warn(
            "SSE: Connection failed immediately - likely auth required. Not retrying."
          );
          this.disconnectBackendStream();
          this.setSSEState("disconnected");
          return;
        }
        this.handleSSEError();
      };
    } catch (e) {
      this.error("SSE: Failed to create EventSource", { error: e });
      this.handleSSEError();
    }
  }

  /**
   * Merge backend logs into buffer maintaining timestamp order
   */
  private mergeBackendLogs(backendLogs: UnifiedLogEntry[]): void {
    const currentLogs = this.buffer.toArray();

    // Combine and sort by timestamp
    const allLogs = [...currentLogs, ...backendLogs].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Take only the last 500 (buffer max size)
    const trimmedLogs = allLogs.slice(-500);

    // Rebuild buffer
    this.buffer.clear();
    trimmedLogs.forEach((log) => this.buffer.push(log));

    // Notify listeners with null to trigger full refresh
    this.listeners.forEach((listener) => listener(null));
  }

  /**
   * Handle SSE connection errors with exponential backoff
   */
  private handleSSEError(): void {
    this.disconnectBackendStream();

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.setSSEState("reconnecting");

      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      const jitter = Math.random() * 1000;

      this.warn("SSE: Connection error, reconnecting...", {
        attempt: this.reconnectAttempts + 1,
        delayMs: delay + jitter,
      });

      this.reconnectTimeout = window.setTimeout(() => {
        this.reconnectAttempts++;
        this.eventSource = null; // Reset to allow reconnect
        this.connectToBackendStream();
      }, delay + jitter);
    } else {
      this.setSSEState("disconnected");
      this.error("SSE: Max reconnect attempts reached, giving up");
    }
  }

  /**
   * Disconnect from backend SSE stream
   */
  disconnectBackendStream(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.setSSEState("disconnected");
  }

  /**
   * Reset reconnect attempts (call when manually reconnecting)
   */
  resetReconnect(): void {
    this.reconnectAttempts = 0;
    this.disconnectBackendStream();
    this.connectToBackendStream();
  }
}

export const loggingService = new LoggingService();
