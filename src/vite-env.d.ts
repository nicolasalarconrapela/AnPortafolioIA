/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Backend
  readonly VITE_BACKEND_API_URL: string;

  // AI (Gemini)
  readonly VITE_GEMINI_API_KEY: string;

  // Analytics
  readonly VITE_GA_ID: string;

  // Company Logos
  readonly VITE_LOGO_DEV_TOKEN: string;

  // Firebase (fetched from backend, kept here for documentation)
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
