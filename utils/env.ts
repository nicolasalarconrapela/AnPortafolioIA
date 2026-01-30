/**
 * Centralized Environment Configuration
 *
 * This file provides a single source of truth for all environment variables
 * used in the application. It handles validation and type safety.
 */

import { loggingService } from "./loggingService";

const metaEnv = (import.meta as any).env || {};

// Fallback for environments where .env cannot be injected (e.g. Google AI Studio)
// This points to a deployed instance that serves compatible Firestore endpoints.
const VITE_BACKEND_GAIS_API_URL = "https://anportafolioia-egy8.onrender.com";
const DEFAULT_LOCAL_URL = "http://localhost:3001";

export const env = {
  // Priority: VITE_BACKEND_API_URL -> GAIS Fallback (Deployed) -> Localhost
  // If you are running locally and want to use local backend, ensure VITE_BACKEND_API_URL is set in .env
  // or modify this priority.
  BACKEND_URL:
    metaEnv.VITE_BACKEND_API_URL ||
    VITE_BACKEND_GAIS_API_URL ||
    DEFAULT_LOCAL_URL,


  IS_DEV: metaEnv.DEV || false,
  IS_PROD: metaEnv.PROD || false,
  MODE: metaEnv.MODE || "unknown",
  APP_ENV: metaEnv.MODE || "unknown",
} as const;

loggingService.info("[CONFIG] Environment loaded:", {
  mode: env.MODE,
  appEnv: env.APP_ENV,
  backendUrl: env.BACKEND_URL,
  usingFallback: !metaEnv.VITE_BACKEND_API_URL,
});
