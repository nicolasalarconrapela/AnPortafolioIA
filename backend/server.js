// server.js (ESM)
// ------------------------------------------------------------
// ✅ CORS robusto (normaliza origin, soporta credentials)
// ✅ Preflight OPTIONS resuelto
// ✅ trust proxy para Render
// ✅ Observabilidad segura: request-id, latencia, status, error handler
// ✅ Redacción de secretos (no cookies, no authorization, no body)
// ------------------------------------------------------------

import "dotenv/config";
import crypto from "crypto";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { initializeFirebaseAdmin } from "./firebaseAdmin.js";
import firestoreRoutes from "./routes/firestoreRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import testRoutes from "./routes/testRoutes.js";

import { config } from "./config.js";
import { logger } from "./logger.js";
import { validateEnvironment } from "./validateEnv.js";

const app = express();

// ------------------------------------------------------------
// 0) Trust proxy (Render / reverse proxy) - importante para HTTPS
// ------------------------------------------------------------
app.set("trust proxy", 1);

// ------------------------------------------------------------
// 1) Utilidades de logging seguro
// ------------------------------------------------------------

/** Crea un request-id breve */
function newRequestId() {
  // 12 hex ~ suficiente para correlación sin ser enorme
  return crypto.randomBytes(6).toString("hex");
}

/** Redacta headers sensibles antes de loguear */
function sanitizeHeaders(headers = {}) {
  const out = {};
  const allowlist = [
    "host",
    "origin",
    "referer",
    "user-agent",
    "content-type",
    "content-length",
    "accept",
    "accept-encoding",
    "accept-language",
    "x-forwarded-for",
    "x-forwarded-proto",
    "x-forwarded-host",
    "x-request-id",
  ];

  for (const k of allowlist) {
    const v = headers[k];
    if (v !== undefined) out[k] = v;
  }

  // Redacciones explícitas (por si aparecen en allowlist futuro)
  if (headers.authorization) out.authorization = "[REDACTED]";
  if (headers.cookie) out.cookie = "[REDACTED]";
  if (headers["set-cookie"]) out["set-cookie"] = "[REDACTED]";

  return out;
}

/** Redacta query params potencialmente sensibles */
function sanitizeQuery(query = {}) {
  const out = {};
  const sensitiveKeys = new Set([
    "token",
    "access_token",
    "id_token",
    "refresh_token",
    "password",
    "pass",
    "secret",
    "api_key",
    "apikey",
    "key",
    "code",
    "auth",
  ]);

  for (const [k, v] of Object.entries(query)) {
    if (sensitiveKeys.has(k.toLowerCase())) out[k] = "[REDACTED]";
    else out[k] = v;
  }
  return out;
}

/** No loguees IP completa si no la necesitas: la “enmascaramos” */
function maskIp(ip) {
  if (!ip) return undefined;
  // Express puede traer "::ffff:127.0.0.1" o IPv6
  // Enmascarado simple: deja solo el bloque/parte inicial para debugging sin identificar.
  if (ip.includes(".")) {
    const parts = ip.split(".");
    if (parts.length === 4) return `${parts[0]}.${parts[1]}.x.x`;
    return "x.x.x.x";
  }
  // IPv6: deja un prefijo
  return ip.slice(0, 8) + "::/64";
}

/** Decide si una ruta debe ser “silenciosa” (healthchecks suelen spamear) */
function isNoisyPath(path) {
  return path === "/health";
}

// ------------------------------------------------------------
// 2) Middleware: request context + request-id + logs básicos
// ------------------------------------------------------------
app.use((req, res, next) => {
  // request-id: usa el que venga, o genera
  const incoming = req.headers["x-request-id"];
  const rid = (typeof incoming === "string" && incoming.trim()) ? incoming.trim() : newRequestId();

  req.requestId = rid; // <-- attach
  res.setHeader("x-request-id", rid);

  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;

    // Evita loguear health demasiado (opcional)
    if (isNoisyPath(req.path)) return;

    // Nivel por status
    const status = res.statusCode;
    const level = status >= 500 ? "error" : status >= 400 ? "warn" : "info";

    const xfwd = req.headers["x-forwarded-for"];
    const rawIp = (typeof xfwd === "string" ? xfwd.split(",")[0].trim() : req.ip);

    const payload = {
      rid,
      method: req.method,
      path: req.path,
      status,
      duration_ms: Math.round(durationMs),
      origin: req.headers.origin,
      // Enmascarado
      ip: maskIp(rawIp),
      // Query sanitizada (sin tokens)
      query: sanitizeQuery(req.query),
    };

    if (level === "error") logger.error("http_request", payload);
    else if (level === "warn") logger.warn("http_request", payload);
    else logger.info("http_request", payload);
  });

  next();
});

// ------------------------------------------------------------
// 3) CORS robusto
// ------------------------------------------------------------
const rawAllowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  config.EXTERNAL_URL,
  "https://anportafolioia.onrender.com",
  "https://anportafolioia-egy8.onrender.com",
]
  .filter(Boolean)
  .map((s) => String(s).trim())
  .filter((s) => s.length > 0);

function normalizeOrigin(origin) {
  try {
    const u = new URL(origin);
    return `${u.protocol}//${u.host}`;
  } catch {
    return null;
  }
}

const allowedSet = new Set(rawAllowedOrigins.map(normalizeOrigin).filter(Boolean));

function isDevLocalhost(normalized) {
  if (!normalized) return false;
  return (
    normalized.startsWith("http://localhost:") ||
    normalized.startsWith("http://127.0.0.1:")
  );
}

const allowGoogleAiStudio = (origin) =>
  typeof origin === "string" &&
  /^https:\/\/[a-z0-9-]+\.scf\.usercontent\.goog$/i.test(origin);

const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true);

    const normalized = normalizeOrigin(origin);

    // ✅ Permite Ai Studio / entornos de Google que sirvan desde *.scf.usercontent.goog
    // (solo HTTPS + host exacto por regex)
    if (allowGoogleAiStudio(normalized)) {
      logger.info("cors_allowed_google_ai_studio", { origin, normalized });
      return cb(null, true);
    }

    // DEV: permite localhost variants
    if (process.env.NODE_ENV !== "production" && isDevLocalhost(normalized)) {
      return cb(null, true);
    }

    // PROD: allowlist estricta
    if (normalized && allowedSet.has(normalized)) {
      return cb(null, true);
    }

    logger.warn("cors_blocked", {
      origin,
      normalized,
      allowed: [...allowedSet],
      nodeEnv: process.env.NODE_ENV,
    });

    return cb(new Error(`CORS blocked for origin: ${origin}`), false);
  },

  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// ------------------------------------------------------------
// 4) Body + cookies
//    OJO: no logueamos body.
// ------------------------------------------------------------
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

// ------------------------------------------------------------
// 5) Startup logs: sin secretos
// ------------------------------------------------------------
logger.info("backend_starting", {
  port: config.PORT,
  nodeEnv: process.env.NODE_ENV,
  externalUrl: config.EXTERNAL_URL,
  allowedOrigins: [...allowedSet],
});

// ------------------------------------------------------------
// 6) Environment Validation
// ------------------------------------------------------------
try {
  validateEnvironment();
} catch (error) {
  logger.error("startup_env_invalid", { error: error?.message || String(error) });
  process.exit(1);
}

// ------------------------------------------------------------
// 7) Firebase Initialization
// ------------------------------------------------------------
try {
  initializeFirebaseAdmin();
  logger.info("firebase_admin_initialized", { ok: true });
} catch (error) {
  logger.warn("firebase_admin_init_failed", { error: error?.message || String(error) });
}

// ------------------------------------------------------------
// 8) Routes
// ------------------------------------------------------------
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "AnPortafolioIA Backend is running",
  });
});
app.get("/healthz", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/firestore", firestoreRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);

// ------------------------------------------------------------
// 9) 404 handler (log “suave”)
// ------------------------------------------------------------
app.use((req, res) => {
  logger.warn("route_not_found", {
    rid: req.requestId,
    method: req.method,
    path: req.path,
  });
  res.status(404).json({ error: "NOT_FOUND" });
});

// ------------------------------------------------------------
// 10) Error handler global (MUY importante)
//     - No expone stack al cliente.
//     - Loguea stack solo en servidor.
//     - Redacta headers antes de loguear.
// ------------------------------------------------------------
app.use((err, req, res, _next) => {
  const status = err?.statusCode && Number.isInteger(err.statusCode) ? err.statusCode : 500;

  // Log completo en servidor, pero seguro: sin cookies/auth/body
  logger.error("unhandled_error", {
    rid: req.requestId,
    message: err?.message || String(err),
    status,
    stack: err?.stack, // OK en logs server (no al cliente)
    request: {
      method: req.method,
      path: req.path,
      origin: req.headers.origin,
      headers: sanitizeHeaders(req.headers),
      query: sanitizeQuery(req.query),
    },
  });

  // Respuesta al cliente: mínima, sin detalles sensibles
  if (String(err?.message || "").startsWith("CORS blocked")) {
    return res.status(403).json({ error: "CORS_BLOCKED" });
  }

  return res.status(status).json({
    error: status >= 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR",
    rid: req.requestId,
  });
});

// ------------------------------------------------------------
// 11) Listen
// ------------------------------------------------------------
const port = Number(config.PORT) || 3001;

app.listen(port, () => {
  logger.info("backend_listening", {
    port,
    nodeEnv: process.env.NODE_ENV,
    externalUrl: config.EXTERNAL_URL,
  });
});
