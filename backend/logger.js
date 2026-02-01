/**
 * Unified Structured Logger for AnPortafolioIA Backend
 *
 * Features:
 * - Circular FIFO buffer (500 entries, O(1) operations)
 * - Async mutex for thread-safe file writes
 * - Rotating file stream (daily, 7 days retention) in JSONL format
 * - SSE subscribers for real-time log streaming
 * - Stack trace extraction for file:line metadata
 * - Sensitive data redaction
 */

import fs from 'fs';
import path from 'path';
import { Mutex } from 'async-mutex';
import * as rfs from 'rotating-file-stream';
import { config } from './config.js';

/** @typedef {'LOG'|'INFO'|'WARN'|'ERROR'|'DEBUG'|'TRACE'} LogLevel */
/** @typedef {'frontend'|'backend'} LogSource */

/**
 * @typedef {Object} UnifiedLogEntry
 * @property {LogLevel} level
 * @property {string} message
 * @property {any} [data]
 * @property {string} timestamp - ISO string
 * @property {LogSource} source
 * @property {string} [file]
 * @property {number} [line]
 * @property {string} [requestId]
 */

// Sensitive keys regex for redaction
const SENSITIVE_KEYS = /token|password|secret|auth|key|cookie|authorization|credential/i;

/**
 * Circular buffer with FIFO eviction - O(1) push and access
 */
class CircularBuffer {
  constructor(maxSize) {
    this.maxSize = maxSize;
    this.buffer = new Array(maxSize);
    this.head = 0;  // Next write position
    this.count = 0; // Current item count
  }

  push(item) {
    this.buffer[this.head] = item;
    this.head = (this.head + 1) % this.maxSize;
    if (this.count < this.maxSize) {
      this.count++;
    }
  }

  toArray() {
    if (this.count === 0) return [];

    const result = [];
    const start = this.count < this.maxSize ? 0 : this.head;

    for (let i = 0; i < this.count; i++) {
      const idx = (start + i) % this.maxSize;
      result.push(this.buffer[idx]);
    }
    return result;
  }

  clear() {
    this.buffer = new Array(this.maxSize);
    this.head = 0;
    this.count = 0;
  }

  get length() {
    return this.count;
  }
}

/**
 * Main Logger Class
 */
class Logger {
  constructor() {
    this.buffer = new CircularBuffer(config.LOGGING.MAX_BUFFER_SIZE);
    this.mutex = new Mutex();
    this.sseSubscribers = new Set();
    this.fileStream = null;

    this._initFileStream();
  }

  /**
   * Initialize rotating file stream
   */
  _initFileStream() {
    const logDir = config.LOGGING.LOG_DIR;

    // Ensure log directory exists
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // Create rotating write stream
    this.fileStream = rfs.createStream(
      (time, index) => {
        if (!time) return 'app-current.jsonl';

        const year = time.getFullYear();
        const month = String(time.getMonth() + 1).padStart(2, '0');
        const day = String(time.getDate()).padStart(2, '0');

        return `app-${year}${month}${day}.jsonl`;
      },
      {
        path: logDir,
        interval: config.LOGGING.ROTATION_INTERVAL,
        maxFiles: config.LOGGING.MAX_FILES,
        compress: false, // Keep as plain text for easy debugging
      }
    );

    this.fileStream.on('error', (err) => {
      console.error('[Logger] File stream error:', err);
    });
  }

  /**
   * Extract caller file and line from stack trace
   * @returns {{file: string, line: number} | null}
   */
  _extractCaller() {
    const err = new Error();
    const stack = err.stack || '';
    const lines = stack.split('\n');

    // Skip: Error, _extractCaller, _createEntry, log method, public method
    // Find first line that's not from logger.js
    for (let i = 3; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('logger.js')) continue;

      // Match patterns like "at Function (file.js:10:5)" or "at file.js:10:5"
      const match = line.match(/at\s+(?:.*?\s+\()?(.+?):(\d+):\d+\)?/);
      if (match) {
        let filePath = match[1];
        const lineNum = parseInt(match[2], 10);

        // Extract just filename from path
        const fileName = path.basename(filePath);

        return { file: fileName, line: lineNum };
      }
    }
    return null;
  }

  /**
   * Redact sensitive data from objects
   */
  _redactSensitive(data) {
    if (data === undefined || data === null) return data;

    if (data instanceof Error) {
      return {
        name: data.name,
        message: data.message,
        stack: data.stack,
      };
    }

    if (typeof data === 'object') {
      const copy = Array.isArray(data) ? [] : {};
      for (const key in data) {
        if (data[key] instanceof Error) {
          copy[key] = this._redactSensitive(data[key]);
        } else if (SENSITIVE_KEYS.test(key) && typeof data[key] === 'string') {
          copy[key] = '[REDACTED]';
        } else if (typeof data[key] === 'object' && data[key] !== null) {
          copy[key] = this._redactSensitive(data[key]);
        } else {
          copy[key] = data[key];
        }
      }
      return copy;
    }

    return data;
  }

  /**
   * Create a unified log entry
   * @param {LogLevel} level
   * @param {string} message
   * @param {any} [meta]
   * @param {string} [requestId]
   * @returns {UnifiedLogEntry}
   */
  _createEntry(level, message, meta, requestId) {
    const caller = this._extractCaller();
    const entry = {
      level,
      message,
      data: this._redactSensitive(meta),
      timestamp: new Date().toISOString(),
      source: 'backend',
      file: caller?.file,
      line: caller?.line,
      requestId,
    };
    return entry;
  }

  /**
   * Core logging method with mutex-protected file write
   * @param {LogLevel} level
   * @param {string} message
   * @param {any} [meta]
   * @param {string} [requestId]
   */
  async _log(level, message, meta, requestId) {
    const entry = this._createEntry(level, message, meta, requestId);

    // Add to circular buffer (no mutex needed - single-threaded JS)
    this.buffer.push(entry);

    // Broadcast to SSE subscribers
    this._broadcastToSSE(entry);

    // Console output (for container logs / debugging)
    const consoleMethod = level === 'ERROR' ? console.error
      : level === 'WARN' ? console.warn
      : level === 'DEBUG' || level === 'TRACE' ? console.debug
      : console.log;

    consoleMethod(JSON.stringify(entry));

    // Write to file with mutex protection
    await this._writeToFile(entry);
  }

  /**
   * Write entry to file stream with mutex
   */
  async _writeToFile(entry) {
    const release = await this.mutex.acquire();
    try {
      if (this.fileStream && this.fileStream.writable) {
        this.fileStream.write(JSON.stringify(entry) + '\n');
      }
    } catch (err) {
      console.error('[Logger] Write error:', err);
    } finally {
      release();
    }
  }

  /**
   * Broadcast log entry to all SSE subscribers
   */
  _broadcastToSSE(entry) {
    const data = `data: ${JSON.stringify(entry)}\n\n`;

    for (const subscriber of this.sseSubscribers) {
      try {
        if (!subscriber.writableEnded) {
          subscriber.write(data);
        } else {
          // Clean up dead connections
          this.sseSubscribers.delete(subscriber);
        }
      } catch (err) {
        this.sseSubscribers.delete(subscriber);
      }
    }
  }

  // =========================================================
  // Public logging methods
  // =========================================================

  log(message, meta, requestId) {
    this._log('LOG', message, meta, requestId);
  }

  info(message, meta, requestId) {
    this._log('INFO', message, meta, requestId);
  }

  warn(message, meta, requestId) {
    this._log('WARN', message, meta, requestId);
  }

  error(message, meta, requestId) {
    this._log('ERROR', message, meta, requestId);
  }

  debug(message, meta, requestId) {
    this._log('DEBUG', message, meta, requestId);
  }

  trace(message, meta, requestId) {
    this._log('TRACE', message, meta, requestId);
  }

  // =========================================================
  // SSE subscription management
  // =========================================================

  /**
   * Subscribe an SSE response stream to receive log broadcasts
   * @param {import('express').Response} res
   */
  subscribeSSE(res) {
    this.sseSubscribers.add(res);
  }

  /**
   * Unsubscribe an SSE response stream
   * @param {import('express').Response} res
   */
  unsubscribeSSE(res) {
    this.sseSubscribers.delete(res);
  }

  /**
   * Get current subscriber count
   */
  getSubscriberCount() {
    return this.sseSubscribers.size;
  }

  // =========================================================
  // Buffer access
  // =========================================================

  /**
   * Get all buffered logs (for initial SSE payload)
   * @returns {UnifiedLogEntry[]}
   */
  getBufferedLogs() {
    return this.buffer.toArray();
  }

  /**
   * Clear log buffer
   */
  clearBuffer() {
    this.buffer.clear();
  }

  /**
   * Get buffer stats
   */
  getBufferStats() {
    return {
      count: this.buffer.length,
      maxSize: config.LOGGING.MAX_BUFFER_SIZE,
      sseSubscribers: this.sseSubscribers.size,
    };
  }
}

// Export singleton instance
export const logger = new Logger();

/**
 * Express middleware for request logging
 * (Preserved from original for compatibility)
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      durationMs: duration,
      userAgent: req.get('user-agent'),
      ip: req.ip
    }, req.requestId);
  });

  next();
};
