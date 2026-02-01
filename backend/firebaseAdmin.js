import admin from 'firebase-admin';
import { config } from './config.js';

let firebaseApp = null;
let firestore = null;

/**
 * Initialize Firebase Admin SDK for Firestore.
 *
 * Required environment variables:
 * - FIREBASE_PROJECT_ID
 * - FIREBASE_PRIVATE_KEY
 * - FIREBASE_CLIENT_EMAIL
 */
export function initializeFirebaseAdmin() {
    if (firebaseApp) {
        console.log('[INFO] Firebase Admin already initialized.');
        return { firestore };
    }

    try {
        const projectId = config.FIREBASE.PROJECT_ID;
        const privateKey = config.FIREBASE.PRIVATE_KEY;
        const clientEmail = config.FIREBASE.CLIENT_EMAIL;

        if (!projectId || !privateKey || !clientEmail) {
            throw new Error('Missing required Firebase environment variables: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL');
        }

        // --- Private Key Sanitization ---
        let processedPrivateKey = privateKey.trim();

        // 1. Remove surrounding quotes if present
        if (processedPrivateKey.startsWith('"') && processedPrivateKey.endsWith('"')) {
            processedPrivateKey = processedPrivateKey.slice(1, -1);
        }

        // 2. Unescape newlines (convert literal \n to real newline)
        processedPrivateKey = processedPrivateKey.replace(/\\n/g, '\n');

        // 3. Fix common copy-paste errors (missing dashes)
        const BEGIN_HEADER = "-----BEGIN PRIVATE KEY-----";
        const END_HEADER = "-----END PRIVATE KEY-----";

        if (processedPrivateKey.startsWith("----BEGIN PRIVATE KEY")) {
            console.warn("[WARN] Fixed malformed private key header (missing dash).");
            processedPrivateKey = "-" + processedPrivateKey;
        }

        if (!processedPrivateKey.startsWith(BEGIN_HEADER)) {
            // Try to find the header index if there is garbage before it
            const startIndex = processedPrivateKey.indexOf(BEGIN_HEADER);
            if (startIndex > 0) {
                processedPrivateKey = processedPrivateKey.substring(startIndex);
            }
        }

        const credential = admin.credential.cert({
            projectId,
            privateKey: processedPrivateKey,
            clientEmail
        });

        firebaseApp = admin.initializeApp({ credential });
        firestore = admin.firestore();

        console.log('[INFO] Firebase Admin initialized successfully (Firestore only).');
        console.log(`[INFO] Project: ${projectId}`);

        return { firestore };
    } catch (error) {
        console.error('[ERROR] Failed to initialize Firebase Admin:', error.message);
        // Do not re-throw here to allow server to start, but API calls will fail later.
        // Re-throwing causes the whole backend to crash on startup.
        // throw error;
    }
}

/**
 * Get Firestore instance.
 */
export function getFirestore() {
    if (!firestore) {
        throw new Error('Firebase Admin not initialized. Call initializeFirebaseAdmin() first.');
    }
    return firestore;
}

/**
 * Get Auth instance.
 */
export function getAuth() {
    if (!firebaseApp) {
        throw new Error('Firebase Admin not initialized. Call initializeFirebaseAdmin() first.');
    }
    return admin.auth();
}
