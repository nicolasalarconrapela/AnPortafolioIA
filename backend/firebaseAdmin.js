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

        // Process private key: 
        // 1. Remove surrounding quotes if present (sometimes .env parsers leave them)
        // 2. Replace literal \n with actual newlines
        let processedPrivateKey = privateKey.trim();
        if (processedPrivateKey.startsWith('"') && processedPrivateKey.endsWith('"')) {
            processedPrivateKey = processedPrivateKey.slice(1, -1);
        }
        processedPrivateKey = processedPrivateKey.replace(/\\n/g, '\n');

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
        throw error;
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
