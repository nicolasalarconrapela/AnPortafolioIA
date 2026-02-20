/**
 * Centralized Environment Configuration
 *
 * Single source of truth for ALL environment variables in the frontend.
 * Every file should import from here instead of reading import.meta.env directly.
 *
 * Variables are resolved with this priority:
 *   1. Vite env (import.meta.env.VITE_*)
 *   2. Hardcoded fallbacks for special environments (Google AI Studio)
 *   3. Sensible defaults for local development
 */

import { loggingService } from "./loggingService";

const metaEnv = (import.meta as any).env || {};

// ─── Fallbacks ────────────────────────────────────────────────────────
// For environments where .env cannot be injected (e.g. Google AI Studio),
// we fall back to a deployed backend instance.
const GAIS_BACKEND_FALLBACK = "https://anportafolioia-egy8.onrender.com";
const LOCAL_BACKEND_DEFAULT = "http://localhost:3001";

// ─── Exported Config ──────────────────────────────────────────────────
export const env = {
  // ── Backend ──
  BACKEND_URL:
    metaEnv.VITE_BACKEND_API_URL ||
    GAIS_BACKEND_FALLBACK ||
    LOCAL_BACKEND_DEFAULT,

  // ── AI (Gemini) ──
  // Priority: localStorage override → VITE env → Vite define (legacy) → empty
  GEMINI_API_KEY:
    (typeof localStorage !== "undefined" &&
      localStorage.getItem("user_gemini_api_key")) ||
    metaEnv.VITE_GEMINI_API_KEY ||
    (typeof process !== "undefined" && (process as any).env?.API_KEY) ||
    "",

  // ── Analytics ──
  GA_ID: metaEnv.VITE_GA_ID || "",

  // ── Company Logos ──
  LOGO_DEV_TOKEN: metaEnv.VITE_LOGO_DEV_TOKEN || "",

  // ── Runtime Info ──
  IS_DEV: metaEnv.DEV === true,
  IS_PROD: metaEnv.PROD === true,
  MODE: (metaEnv.MODE as string) || "unknown",

  // ── Derived Flags ──
  /** True when running inside Google AI Studio (no .env, using fallback backend) */
  IS_GAIS: !metaEnv.VITE_BACKEND_API_URL,
  /** True when Gemini AI features are available */
  get HAS_AI(): boolean {
    return !!this.GEMINI_API_KEY;
  },
} as const;

// ─── Startup Log ──────────────────────────────────────────────────────
loggingService.info("[CONFIG] Environment loaded:", {
  mode: env.MODE,
  backendUrl: env.BACKEND_URL,
  hasAI: !!env.GEMINI_API_KEY,
  hasGA: !!env.GA_ID,
  isGAIS: env.IS_GAIS,
});
