/**
 * Centralized Environment Configuration
 */

import { loggingService } from "./loggingService";

const metaEnv = (import.meta as any).env || {};

// Default local backend URL (matching server.js default port 3001)
const DEFAULT_BACKEND_URL = "http://localhost:3001";

export const env = {
  // Priority: VITE_BACKEND_API_URL -> Defaults
  BACKEND_URL: metaEnv.VITE_BACKEND_API_URL || DEFAULT_BACKEND_URL,

  IS_DEV: metaEnv.DEV || false,
  IS_PROD: metaEnv.PROD || false,
  MODE: metaEnv.MODE || "unknown",
} as const;

loggingService.info("[CONFIG] Environment loaded:", {
  mode: env.MODE,
  backendUrl: env.BACKEND_URL,
  usingFallback: !metaEnv.VITE_BACKEND_API_URL,
});
