// services/firebaseConfig.ts
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { env } from "../utils/env";

// Type for the config object
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

let app: FirebaseApp | undefined;
let authClient: Auth | undefined;
let initPromise: Promise<Auth | undefined> | null = null;

/**
 * Fetches public config from the backend.
 * Useful for environments like GAIS where we can't inject frontend .env files easy.
 */
async function fetchConfigFromBackend(): Promise<FirebaseConfig | null> {
  try {
    const url = `${env.BACKEND_URL}/api/auth/config/firebase-public`;
    console.log(`[Firebase Client] Fetching config from: ${url}`);
    const res = await fetch(url);
    if (!res.ok) throw new Error("Backend did not return config");
    return await res.json();
  } catch (e) {
    console.warn("[Firebase Client] Could not fetch config from backend:", e);
    return null;
  }
}

/**
 * Singleton initializer.
 * Ensures we only initialize once, fetching config from the backend.
 */
export async function getFirebaseAuth(): Promise<Auth> {
  if (authClient) return authClient;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    console.log("[Firebase Client] Fetching config from backend...");
    const config = await fetchConfigFromBackend();

    if (!config) {
      throw new Error("Missing Firebase Configuration (Env or Backend)");
    }

    app = initializeApp(config);
    authClient = getAuth(app);
    console.log("[Firebase Client] Initialized successfully.");
    return authClient;
  })();

  const result = await initPromise;
  if (!result) throw new Error("Failed to initialize Firebase Auth");
  return result;
}

// Export for backward compatibility (may be undefined initially if using async flow)
export { authClient, app };
