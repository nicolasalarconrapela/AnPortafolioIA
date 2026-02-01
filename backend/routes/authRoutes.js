import express from 'express';
import { getAuth } from '../firebaseAdmin.js';
import { logger } from '../logger.js';
import { syncUserToFirestore } from '../services/userService.js';
// Using global fetch (Node 18+)
import { config } from '../config.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

/**
 * GET /api/auth/verify
 * Verifica si la cookie de sesión es válida y devuelve el usuario.
 * Útil para comprobar estado al cargar la SPA.
 */
router.get('/verify', requireAuth, async (req, res) => {
    // req.userRecord is guaranteed by requireAuth
    const userRecord = req.userRecord;

    res.json({
        success: true,
        user: {
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName,
            photoURL: userRecord.photoURL,
            // Add session claims metadata if needed
            iat: req.user.iat,
            exp: req.user.exp
        }
    });
});

// Use the API Key from config (requires configuring FIREBASE_API_KEY in backend .env)
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;

// Helper to call Firebase REST API
const callFirebaseREST = async (endpoint, body) => {
    if (!FIREBASE_API_KEY) throw new Error("FIREBASE_API_KEY is not configured in backend.");
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:${endpoint}?key=${FIREBASE_API_KEY}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, returnSecureToken: true })
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error?.message || "Firebase REST API Error");
    }
    return data;
};

/**
 * GET /api/auth/config/firebase-public
 * Serves public Firebase configuration to the frontend.
 * This allows the frontend to initialize the Client SDK even if .env injection fails (e.g. in some preview environments).
 */
router.get('/config/firebase-public', (req, res) => {
    // These calls read from the Server's environment variables.
    // Ensure these are set in your Backend deployment / .env
    const publicConfig = {
        apiKey: process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY, // Fallback to either
        authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.VITE_FIREBASE_APP_ID,
    };

    if (!publicConfig.apiKey) {
        return res.status(500).json({ error: "Firebase Public Config not set on Backend" });
    }

    res.json(publicConfig);
});

// --- Session Helper ---
const setSessionCookie = async (res, idToken) => {
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const auth = getAuth();
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
    const options = {
        maxAge: expiresIn,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    };
    res.cookie('session', sessionCookie, options);
};

/**
 * POST /api/auth/session-login
 * Exchanges an ID Token for a Session Cookie.
 */
router.post('/session-login', async (req, res) => {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: "idToken is required" });

    try {
        await setSessionCookie(res, idToken);
        res.json({ success: true, message: "Session created" });
    } catch (error) {
        logger.error("Session creation failed", { error: error.message });
        res.status(401).json({ error: "Unauthorized" });
    }
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', (req, res) => {
    res.clearCookie('session', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });
    res.json({ success: true, message: "Logged out" });
});


// --- Firebase Auth API Endpoints (Enhanced with Session Cookie) ---

/**
 * POST /api/auth/login
 * Log in with Email/Password -> Sets Session Cookie
 */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    try {
        // 1. Authenticate via REST to get ID Token
        const data = await callFirebaseREST('signInWithPassword', { email, password });

        // 2. Create Session Cookie immediately
        await setSessionCookie(res, data.idToken);

        res.json({
            success: true,
            user: {
                uid: data.localId,
                email: data.email,
                idToken: data.idToken, // Optional to return, but cookie is primary now
                refreshToken: data.refreshToken
            }
        });
    } catch (error) {
        logger.error("Login failed", { error: error.message });
        res.status(401).json({ error: error.message });
    }
});

/**
 * POST /api/auth/register
 * Register with Email/Password -> Syncs to Firestore -> Sets Session Cookie
 */
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    try {
        const data = await callFirebaseREST('signUp', { email, password });

        // Sync to Firestore
        await syncUserToFirestore(data.localId, {
            email: data.email,
            isAnonymous: false,
            provider: 'password'
        });

        await setSessionCookie(res, data.idToken);

        res.json({
            success: true,
            user: {
                uid: data.localId,
                email: data.email,
                // Client usually doesn't need idToken if using cookies, but keeping for compatibility if needed
                // idToken: data.idToken,
                // refreshToken: data.refreshToken
            }
        });
    } catch (error) {
        logger.error("Registration failed", { error: error.message });
        res.status(400).json({ error: error.message });
    }
});

/**
 * POST /api/auth/guest
 * Guest Login -> Syncs to Firestore -> Sets Session Cookie
 */
router.post('/guest', async (req, res) => {
    try {
        const data = await callFirebaseREST('signUp', {});

        // Sync to Firestore
        await syncUserToFirestore(data.localId, {
            isAnonymous: true,
            provider: 'anonymous'
        });

        await setSessionCookie(res, data.idToken);

        res.json({
            success: true,
            user: {
                uid: data.localId,
                isAnonymous: true,
                // idToken: data.idToken,
                // refreshToken: data.refreshToken
            }
        });
    } catch (error) {
        logger.error("Guest login failed", { error: error.message });
        res.status(500).json({ error: error.message });
    }
});



// Legacy create-user (optional, kept for admin usage if needed)
router.post('/create-user-admin', async (req, res) => {
    // ... implementation ...
    res.status(501).json({ error: "Deprecated. Use /register" });
});

/**
 * POST /api/auth/custom-token
 * Genera un custom token para autenticación
 */
router.post('/custom-token', async (req, res) => {
    const { uid } = req.body;

    if (!uid) {
        return res.status(400).json({ error: 'UID is required' });
    }

    try {
        const auth = getAuth();
        const customToken = await auth.createCustomToken(uid);

        res.json({
            success: true,
            token: customToken,
        });
    } catch (error) {
        logger.error('Custom token creation failed', { error: error.message });
        res.status(500).json({ error: 'Failed to create custom token', details: error.message });
    }
});

/**
 * GET /api/auth/user/:uid
 * Obtiene información de un usuario por UID
 */
router.get('/user/:uid', async (req, res) => {
    const { uid } = req.params;

    try {
        const auth = getAuth();
        const userRecord = await auth.getUser(uid);

        res.json({
            success: true,
            user: {
                uid: userRecord.uid,
                email: userRecord.email,
                displayName: userRecord.displayName,
                photoURL: userRecord.photoURL,
                emailVerified: userRecord.emailVerified,
                disabled: userRecord.disabled,
                metadata: {
                    creationTime: userRecord.metadata.creationTime,
                    lastSignInTime: userRecord.metadata.lastSignInTime,
                },
            },
        });
    } catch (error) {
        logger.error('Failed to get user', { uid, error: error.message });
        res.status(404).json({ error: 'User not found', details: error.message });
    }
});

/**
 * PUT /api/auth/user/:uid
 * Actualiza información de un usuario
 */
router.put('/user/:uid', async (req, res) => {
    const { uid } = req.params;
    const updates = req.body;

    try {
        const auth = getAuth();
        await auth.updateUser(uid, updates);

        res.json({
            success: true,
            message: 'User updated successfully',
        });
    } catch (error) {
        logger.error('Failed to update user', { uid, error: error.message });
        res.status(400).json({ error: 'Failed to update user', details: error.message });
    }
});

/**
 * DELETE /api/auth/user/:uid
 * Elimina un usuario
 */
router.delete('/user/:uid', async (req, res) => {
    const { uid } = req.params;

    try {
        const auth = getAuth();
        await auth.deleteUser(uid);

        res.json({
            success: true,
            message: 'User deleted successfully',
        });
    } catch (error) {
        logger.error('Failed to delete user', { uid, error: error.message });
        res.status(400).json({ error: 'Failed to delete user', details: error.message });
    }
});

export default router;
