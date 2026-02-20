import { loggingService } from "../utils/loggingService";
import { env } from "../utils/env";

const BACKEND_URL = env.BACKEND_URL;
// Default collection to use if not specified
const DEFAULT_TEST_COLLECTION = "workspace-test";

export type Unsubscribe = () => void;

// Encryption enabled in production/non-dev environments
const SHOULD_ENCRYPT = !env.IS_DEV;

function forceLogout() {
  loggingService.warn(
    "FirestoreWorkspaces: 401/404 encountered. Forcing logout.",
  );
  // localStorage.removeItem("anportafolio_user_id"); // Removed: We rely on Session Cookie only
  window.location.href = "/";
}

function resolveWorkspaceCollection(): string {
  // STRICT: Always return workspace-[mode] to ensure correct backend nesting
  // Structure: workspace-development -> global -> users -> [uid]
  return env.IS_DEV ? "workspace-development" : "workspace-production";
}

const WORKSPACE_COLLECTION = resolveWorkspaceCollection();

export function getWorkspaceCollectionName(): string {
  return WORKSPACE_COLLECTION;
}

function resolveCollectionName(collectionOverride?: string): string {
  if (collectionOverride && collectionOverride.trim().length > 0) {
    return collectionOverride.trim();
  }
  return WORKSPACE_COLLECTION;
}

function toBase64Url(value: string): string {
  try {
    const encoded = btoa(unescape(encodeURIComponent(value)));
    return encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  } catch (error) {
    loggingService.error("FirestoreWorkspaces: error al encriptar valor.", {
      error,
    });
    throw error;
  }
}

function sanitizeCollectionSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9_.-]/g, "-");
}

function fromBase64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + "=".repeat(padLength);

  try {
    return decodeURIComponent(escape(atob(padded)));
  } catch (error) {
    loggingService.error("FirestoreWorkspaces: error al desencriptar valor.", {
      error,
    });
    throw error;
  }
}

export function getEncryptedUserKey(userKey: string): string {
  return toBase64Url(userKey);
}

const SALT = new TextEncoder().encode("AnPortafolioIA_Secure_Salt_v1");

function bufferToBase64Url(buffer: Uint8Array): string {
  const binary = String.fromCharCode(...buffer);
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBuffer(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + "=".repeat(padLength);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

const CryptoUtils = {
  async deriveKey(secret: string): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "PBKDF2" },
      false,
      ["deriveKey"],
    );
    return window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: SALT,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"],
    );
  },

  async encrypt(data: any, key: CryptoKey): Promise<string> {
    const enc = new TextEncoder();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encodedData = enc.encode(JSON.stringify(data));

    const encryptedContent = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      encodedData,
    );

    // Combine IV and Ciphertext
    const combined = new Uint8Array(iv.length + encryptedContent.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedContent), iv.length);

    return bufferToBase64Url(combined);
  },

  async decrypt(encryptedString: string, key: CryptoKey): Promise<any> {
    const bytes = base64UrlToBuffer(encryptedString);

    if (bytes.length < 12)
      throw new Error("Invalid encrypted data (too short)");

    const iv = bytes.slice(0, 12);
    const data = bytes.slice(12);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      data,
    );

    const dec = new TextDecoder();
    return JSON.parse(dec.decode(decryptedBuffer));
  },
};

function sanitizeForFirestore<T>(value: T): T {
  if (value === undefined) {
    return undefined as unknown as T;
  }

  if (value === null) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => {
      const cleaned = sanitizeForFirestore(item);
      return cleaned === undefined ? null : cleaned;
    }) as unknown as T;
  }

  if (typeof value === "object") {
    const result: Record<string, unknown> = {};
    Object.entries(value as Record<string, unknown>).forEach(([key, entry]) => {
      const cleaned = sanitizeForFirestore(entry);
      if (cleaned !== undefined) {
        result[key] = cleaned;
      }
    });
    return result as unknown as T;
  }

  return value;
}

export async function encryptPayload(
  payload: Record<string, unknown>,
  userKey: string,
): Promise<string> {
  try {
    const key = await CryptoUtils.deriveKey(userKey);
    return await CryptoUtils.encrypt(payload, key);
  } catch (e) {
    loggingService.error("FirestoreWorkspaces: Encryption failed", e);
    throw e;
  }
}

export async function decryptPayload(
  encryptedPayload: string | undefined,
  userKey: string,
): Promise<any | null> {
  if (!encryptedPayload) return null;
  try {
    const key = await CryptoUtils.deriveKey(userKey);
    return await CryptoUtils.decrypt(encryptedPayload, key);
  } catch (error) {
    loggingService.error(
      "FirestoreWorkspaces: error al recuperar payload encriptado.",
      { error },
    );
    throw new Error("Decryption failed: " + (error as any).message);
  }
}

async function buildEncryptedEnvelope(
  userKey: string,
  data: Record<string, unknown>,
) {
  const docKey = getEncryptedUserKey(userKey);
  const stampedPayload = {
    ...data,
    metadata: {
      ...(data.metadata as Record<string, unknown> | undefined),
      userKey,
      encryptedUserKey: docKey,
      updatedAt: new Date().toISOString(),
    },
    lastAction:
      data?.["type"] || data?.["etapa"] || data?.["action"] || "workspace",
    updatedAt: new Date().toISOString(),
    encryptedUserKey: docKey,
    encryptionType: "AES-GCM", // Marker for new encryption
    encryptionMode: SHOULD_ENCRYPT ? "encrypted" : "plain",
  };

  const sanitizedPayload = sanitizeForFirestore(stampedPayload);

  if (!SHOULD_ENCRYPT) {
    return sanitizedPayload;
  }

  return {
    encryptedPayload: await encryptPayload(sanitizedPayload, userKey),
    lastAction: sanitizedPayload.lastAction,
    updatedAt: sanitizedPayload.updatedAt,
    encryptedUserKey: docKey,
    encryptionMode: "encrypted",
    encryptionType: "AES-GCM",
  };
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export async function getWorkspaceByUserFromFirestore(
  userKey: string,
  collectionOverride?: string,
): Promise<any | null> {
  const collectionName = resolveCollectionName(collectionOverride);
  const docKey = getEncryptedUserKey(userKey);
  const url = `${BACKEND_URL}/api/firestore/workspaces/${encodeURIComponent(
    userKey,
  )}?collectionOverride=${encodeURIComponent(collectionName)}`;

  try {
    // Force no-store to ensure we always get the full document (200) on initial load,
    // avoiding 304s which this function isn't equipped to handle (no local cache).
    const response = await fetch(url, {
      credentials: "include",
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    });

    // Handle Auth Errors (401), Forbidden (403), or Not Found (404)
    if (
      response.status === 401 ||
      response.status === 403 ||
      response.status === 404
    ) {
      forceLogout();
      return null;
    }

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();

    let decrypted = null;
    if (data.encryptedPayload) {
      if (data.encryptionType === "AES-GCM") {
        decrypted = await decryptPayload(data.encryptedPayload, userKey);
      } else {
        if (!data.encryptionType) {
          // Try legacy decryption (Base64 decode)
          try {
            const legacyDecoded = fromBase64Url(data.encryptedPayload);
            decrypted = JSON.parse(legacyDecoded);
            loggingService.warn(
              "FirestoreWorkspaces: Legacy weak encryption detected. Saving next time will upgrade.",
            );
          } catch (e) {
            // Ignore legacy decrypt fail
          }
        }
      }
    }

    loggingService.info(
      "FirestoreWorkspaces: workspace de usuario recuperado correctamente (Backend).",
      {
        userKey,
        encryptedUserKey: docKey,
        collection: collectionName,
      },
    );

    return decrypted ?? data;
  } catch (error) {
    const msg = getErrorMessage(error);
    loggingService.error(
      `FirestoreWorkspaces: error al leer workspace de usuario (Backend). ${msg}`,
      {
        userKey,
        encryptedUserKey: docKey,
        collection: collectionName,
        error,
      },
    );

    throw error;
  }
}

/**
 * Professional Smart-Polling Listener for Workspace Data
 * Features: Adaptive Backoff, HTTP 304 Handling, Visibility integration.
 */
export function listenWorkspaceByUser(
  userKey: string,
  onData: (data: any | null) => void,
  onError?: (error: Error) => void,
  collectionOverride?: string,
): Unsubscribe {
  const collectionName = resolveCollectionName(collectionOverride);
  const url = `${BACKEND_URL}/api/firestore/workspaces/${encodeURIComponent(
    userKey,
  )}?collectionOverride=${encodeURIComponent(collectionName)}`;

  let isActive = true;
  let timeoutId: any = null;
  let inFlight: AbortController | null = null;

  // Polling Stats
  const MIN_INTERVAL = 5000;
  const MAX_INTERVAL = 60000;
  const BACKOFF_STEP = 2000;
  let currentInterval = MIN_INTERVAL;

  // Cache metadata
  let lastModifiedHeader: string | null = null;
  let lastAppliedHash: string | null = null;

  const isPageVisible = () =>
    typeof document === "undefined"
      ? true
      : document.visibilityState === "visible";

  const schedule = (ms: number) => {
    if (!isActive) return;
    if (timeoutId) clearTimeout(timeoutId);
    // Add random jitter to avoid thundering herd on server
    const jitter = 0.9 + Math.random() * 0.2;
    timeoutId = setTimeout(poll, Math.round(ms * jitter));
  };

  const poll = async () => {
    if (!isActive) return;

    // If tab is hidden, wait and try again later
    if (!isPageVisible()) {
      schedule(MIN_INTERVAL);
      return;
    }

    inFlight?.abort();
    inFlight = new AbortController();

    try {
      const headers: HeadersInit = {
        Accept: "application/json",
      };
      if (lastModifiedHeader) {
        headers["If-Modified-Since"] = lastModifiedHeader;
      }

      const response = await fetch(url, {
        headers,
        signal: inFlight.signal,
        cache: "no-store",
        credentials: "include",
      });

      // Standard Optimization: Data hasn't changed at the server level
      if (response.status === 304) {
        currentInterval = Math.min(
          currentInterval + BACKOFF_STEP,
          MAX_INTERVAL,
        );
        schedule(currentInterval);
        return;
      }

      // Handle Auth Errors
      if (
        response.status === 401 ||
        response.status === 403 ||
        response.status === 404
      ) {
        forceLogout();
        isActive = false;
        return;
      }

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      // Update cache header for next time
      lastModifiedHeader = response.headers.get("Last-Modified");

      const data = await response.json();

      // Content processing
      let decrypted = null;
      if (data.encryptedPayload) {
        if (data.encryptionType === "AES-GCM") {
          decrypted = await decryptPayload(data.encryptedPayload, userKey);
        } else if (!data.encryptionType) {
          try {
            decrypted = JSON.parse(fromBase64Url(data.encryptedPayload));
          } catch {}
        }
      }

      const payload = decrypted ?? data;
      const newHash = JSON.stringify(payload);

      // Even if 304 wasn't used (e.g. server restart), check hash locally
      if (newHash === lastAppliedHash) {
        currentInterval = Math.min(
          currentInterval + BACKOFF_STEP,
          MAX_INTERVAL,
        );
      } else {
        lastAppliedHash = newHash;
        currentInterval = MIN_INTERVAL; // Reset interval on actual changes
        onData(payload);
      }

      schedule(currentInterval);
    } catch (error: any) {
      if (error.name === "AbortError") return;

      const msg = getErrorMessage(error);
      // Non-critical network logs as warnings
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
        loggingService.warn(
          `Workspace Sync: temporary connection issue. Retrying...`,
        );
      } else {
        loggingService.error(`Workspace Sync: permanent failure. ${msg}`, {
          userKey,
        });
      }

      onError?.(error as Error);
      // Exponential backoff on real errors
      currentInterval = Math.min(currentInterval * 2, MAX_INTERVAL);
      schedule(currentInterval);
    }
  };

  // Immediate sync on focus
  const handleVisibilityChange = () => {
    if (isPageVisible() && isActive) {
      loggingService.debug(
        "Workspace Sync: Window focused, triggering immediate sync.",
      );
      poll();
    }
  };

  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", handleVisibilityChange);
  }

  // Start first poll
  poll();

  return () => {
    isActive = false;
    inFlight?.abort();
    if (timeoutId) clearTimeout(timeoutId);
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    }
  };
}

export async function upsertWorkspaceForUser(
  userKey: string,
  data: Record<string, unknown>,
  collectionOverride?: string,
): Promise<void> {
  const collectionName = resolveCollectionName(collectionOverride);
  const docKey = getEncryptedUserKey(userKey);
  const url = `${BACKEND_URL}/api/firestore/workspaces/${encodeURIComponent(
    userKey,
  )}?collectionOverride=${encodeURIComponent(collectionName)}`;

  const envelope = await buildEncryptedEnvelope(userKey, data);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(envelope),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    loggingService.info(
      "FirestoreWorkspaces: workspace de usuario actualizado/creado correctamente (Backend).",
      {
        userKey,
        encryptedUserKey: docKey,
        collection: collectionName,
      },
    );
  } catch (error) {
    const msg = getErrorMessage(error);
    loggingService.error(
      `FirestoreWorkspaces: error al escribir workspace de usuario (Backend). ${msg}`,
      {
        userKey,
        encryptedUserKey: docKey,
        collection: collectionName,
        error,
      },
    );

    throw error;
  }
}

export async function deleteWorkspaceForUser(
  userKey: string,
  collectionOverride?: string,
): Promise<void> {
  const collectionName = resolveCollectionName(collectionOverride);
  const docKey = getEncryptedUserKey(userKey);
  const url = `${BACKEND_URL}/api/firestore/workspaces/${encodeURIComponent(
    userKey,
  )}?collectionOverride=${encodeURIComponent(collectionName)}`;

  try {
    const response = await fetch(url, {
      method: "DELETE",
      credentials: "include",
    });

    if (
      response.status === 401 ||
      response.status === 403 ||
      response.status === 404
    ) {
      forceLogout();
      return;
    }

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    loggingService.info(
      "FirestoreWorkspaces: workspace de usuario eliminado correctamente (Backend).",
      {
        userKey,
        encryptedUserKey: docKey,
        collection: collectionName,
      },
    );
  } catch (error) {
    const msg = getErrorMessage(error);
    loggingService.error(
      `FirestoreWorkspaces: error al eliminar workspace de usuario (Backend). ${msg}`,
      {
        userKey,
        encryptedUserKey: docKey,
        collection: collectionName,
        error,
      },
    );

    throw error;
  }
}

export async function upsertWorkspaceChildDocument(
  userKey: string,
  childCollection: string,
  childDocumentId: string,
  data: Record<string, unknown>,
  collectionOverride?: string,
  merge = true,
): Promise<void> {
  const collectionName = resolveCollectionName(collectionOverride);
  const docKey = getEncryptedUserKey(userKey);
  const sanitizedChildCollection = sanitizeCollectionSegment(childCollection);
  const sanitizedChildDocument = sanitizeCollectionSegment(childDocumentId);

  const url = `${BACKEND_URL}/api/firestore/workspaces/${encodeURIComponent(
    userKey,
  )}/child/${encodeURIComponent(sanitizedChildCollection)}/${encodeURIComponent(
    sanitizedChildDocument,
  )}?collectionOverride=${encodeURIComponent(collectionName)}&merge=${merge}`;

  try {
    const envelope = await buildEncryptedEnvelope(userKey, {
      ...data,
      subcollection: sanitizedChildCollection,
      childDocumentId,
    });

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(envelope),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    loggingService.info(
      "FirestoreWorkspaces: documento hijo actualizado/creado correctamente (Backend).",
      {
        userKey,
        encryptedUserKey: docKey,
        collection: collectionName,
        childCollection: sanitizedChildCollection,
        childDocumentId,
      },
    );
  } catch (error) {
    const msg = getErrorMessage(error);
    loggingService.error(
      `FirestoreWorkspaces: error al escribir documento hijo de workspace (Backend). ${msg}`,
      {
        userKey,
        encryptedUserKey: docKey,
        collection: collectionName,
        childCollection: sanitizedChildCollection,
        childDocumentId,
        error,
      },
    );

    throw error;
  }
}

export async function deleteWorkspaceChildDocument(
  userKey: string,
  childCollection: string,
  childDocumentId: string,
  collectionOverride?: string,
): Promise<void> {
  const collectionName = resolveCollectionName(collectionOverride);
  const docKey = getEncryptedUserKey(userKey);
  const sanitizedChildCollection = sanitizeCollectionSegment(childCollection);
  const sanitizedChildDocument = sanitizeCollectionSegment(childDocumentId);

  const url = `${BACKEND_URL}/api/firestore/workspaces/${encodeURIComponent(
    userKey,
  )}/child/${encodeURIComponent(sanitizedChildCollection)}/${encodeURIComponent(
    sanitizedChildDocument,
  )}?collectionOverride=${encodeURIComponent(collectionName)}`;

  try {
    const response = await fetch(url, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    loggingService.info(
      "FirestoreWorkspaces: documento hijo eliminado correctamente (Backend).",
      {
        userKey,
        encryptedUserKey: docKey,
        collection: collectionName,
        childCollection: sanitizedChildCollection,
        childDocumentId,
      },
    );
  } catch (error) {
    const msg = getErrorMessage(error);
    loggingService.error(
      `FirestoreWorkspaces: error al eliminar documento hijo del workspace (Backend). ${msg}`,
      {
        userKey,
        encryptedUserKey: docKey,
        collection: collectionName,
        childCollection: sanitizedChildCollection,
        childDocumentId,
        error,
      },
    );

    throw error;
  }
}

export async function getWorkspaceChildDocument(
  userKey: string,
  childCollection: string,
  childDocumentId: string,
  collectionOverride?: string,
): Promise<any | null> {
  const collectionName = resolveCollectionName(collectionOverride);
  const docKey = getEncryptedUserKey(userKey);
  const sanitizedChildCollection = sanitizeCollectionSegment(childCollection);
  const sanitizedChildDocument = sanitizeCollectionSegment(childDocumentId);

  const url = `${BACKEND_URL}/api/firestore/workspaces/${encodeURIComponent(
    userKey,
  )}/child/${encodeURIComponent(sanitizedChildCollection)}/${encodeURIComponent(
    sanitizedChildDocument,
  )}?collectionOverride=${encodeURIComponent(collectionName)}`;

  try {
    const response = await fetch(url, { credentials: "include" });

    if (response.status === 404) {
      loggingService.info(
        "FirestoreWorkspaces: documento hijo no existe (Backend).",
        {
          userKey,
          encryptedUserKey: docKey,
          collection: collectionName,
          childCollection: sanitizedChildCollection,
          childDocumentId,
        },
      );

      return null;
    }

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();

    let decrypted = null;
    if (data.encryptedPayload) {
      if (data.encryptionType === "AES-GCM") {
        decrypted = await decryptPayload(data.encryptedPayload, userKey);
      } else if (!data.encryptionType) {
        try {
          const legacyDecoded = fromBase64Url(data.encryptedPayload);
          decrypted = JSON.parse(legacyDecoded);
        } catch {}
      }
    }

    loggingService.info(
      "FirestoreWorkspaces: documento hijo recuperado correctamente (Backend).",
      {
        userKey,
        encryptedUserKey: docKey,
        collection: collectionName,
      },
    );

    return decrypted ?? data;
  } catch (error) {
    const msg = getErrorMessage(error);
    loggingService.error(
      `FirestoreWorkspaces: error al leer documento hijo (Backend). ${msg}`,
      { error },
    );
    throw error;
  }
}

export async function getPublicProfile(
  shareToken: string,
  collectionOverride?: string,
): Promise<any | null> {
  const collectionName = resolveCollectionName(collectionOverride);
  // Use the new public route which accepts shareToken
  const url = `${BACKEND_URL}/api/public/profile/${encodeURIComponent(
    shareToken,
  )}?collectionOverride=${encodeURIComponent(collectionName)}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      // distinct from other calls: NO credentials needed for public info
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();

    // Backend returns { profile: { ...workspaceData, userKey } }
    if (!data || !data.profile) return null;

    const wsData = data.profile;
    let decryptedWorkspace = null;

    if (wsData.encryptedPayload) {
      // If we have the key, we can decrypt.
      // The backend now returns userKey (uid) in the payload for this specific purpose.
      if (wsData.userKey) {
        if (wsData.encryptionType === "AES-GCM") {
          decryptedWorkspace = await decryptPayload(
            wsData.encryptedPayload,
            wsData.userKey,
          );
        } else if (!wsData.encryptionType) {
          // Legacy
          try {
            const legacyDecoded = fromBase64Url(wsData.encryptedPayload);
            decryptedWorkspace = JSON.parse(legacyDecoded);
          } catch {}
        }
      } else {
        loggingService.warn(
          "PublicProfile: Encrypted data received but no key provided.",
        );
      }
    } else {
      // Plain text
      decryptedWorkspace = wsData;
    }

    return decryptedWorkspace;
  } catch (error) {
    loggingService.error("FirestoreWorkspaces: error fetching public profile", {
      error,
      shareToken,
    });
    return null;
  }
}

export const TEST_WORKSPACE_COLLECTION = DEFAULT_TEST_COLLECTION;
