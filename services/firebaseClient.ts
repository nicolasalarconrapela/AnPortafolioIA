import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  User,
} from "firebase/auth";
import { env } from "../utils/env";
import { loggingService } from "../utils/loggingService";

// Backend API base URL
const API_URL = env.BACKEND_URL;

const firebaseConfig = {
  apiKey: env.FIREBASE.API_KEY,
  authDomain: env.FIREBASE.AUTH_DOMAIN,
  projectId: env.FIREBASE.PROJECT_ID,
  storageBucket: env.FIREBASE.STORAGE_BUCKET,
  messagingSenderId: env.FIREBASE.MESSAGING_SENDER_ID,
  appId: env.FIREBASE.APP_ID,
};

// Singleton initialization - Solo si hay configuración de Firebase
let app;
let auth: ReturnType<typeof getAuth> | null = null;
let useBackendAuth = false;

// Verificar si Firebase está configurado en el frontend
const isFirebaseConfigured = firebaseConfig.apiKey && firebaseConfig.projectId;

if (isFirebaseConfigured) {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    auth = getAuth(app);
    loggingService.info("Firebase Client initialized successfully (Frontend).");
  } catch (error) {
    loggingService.error("Failed to initialize Firebase Client.", error);
    useBackendAuth = true;
  }
} else {
  loggingService.info("Firebase not configured in frontend. Using backend authentication.");
  useBackendAuth = true;
}

export const googleProvider = new GoogleAuthProvider();

// Backend authentication helpers
const callBackendAuth = async (endpoint: string, method = "POST", body?: any) => {
  const url = `${API_URL}/api/auth${endpoint}`;
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Authentication failed");
  }

  return response.json();
};

export const signInWithGoogle = async () => {
  if (useBackendAuth || !auth) {
    throw new Error("Google Sign-In requires Firebase Auth configuration in frontend");
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    
    // Enviar el token al backend para validación
    const token = await result.user.getIdToken();
    await callBackendAuth("/verify-token", "POST", { token });
    
    return result.user;
  } catch (error) {
    loggingService.error("Google Sign In Error", error);
    throw error;
  }
};

export const signInGuest = async () => {
  if (useBackendAuth || !auth) {
    // Crear usuario anónimo vía backend
    try {
      const result = await callBackendAuth("/create-user", "POST", {
        email: `guest-${Date.now()}@anportafolio.local`,
        password: Math.random().toString(36),
        displayName: "Guest User",
      });
      loggingService.info("Guest user created via backend", result);
      return result as any; // Simular User object
    } catch (error) {
      loggingService.error("Anonymous Sign In Error (Backend)", error);
      throw error;
    }
  }

  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    loggingService.error("Anonymous Sign In Error", error);
    throw error;
  }
};

export const logout = async () => {
  if (useBackendAuth || !auth) {
    loggingService.info("Logged out (Backend mode)");
    return;
  }

  try {
    await firebaseSignOut(auth);
  } catch (error) {
    loggingService.error("Logout Error", error);
    throw error;
  }
};

export {
  auth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
};
