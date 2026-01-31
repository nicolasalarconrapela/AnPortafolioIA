import express from 'express';
import { getAuth } from '../firebaseAdmin.js';
import { config } from '../config.js';

const router = express.Router();
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

// --- Firebase Auth API Endpoints ---

/**
 * POST /api/auth/verify-token
 * Verifica un token de Firebase Auth
 */
router.post('/verify-token', async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ error: 'Token is required' });
    }

    try {
        const auth = getAuth();
        const decodedToken = await auth.verifyIdToken(token);

        res.json({
            success: true,
            uid: decodedToken.uid,
            email: decodedToken.email,
            emailVerified: decodedToken.email_verified,
        });
    } catch (error) {
        console.error('[ERROR] Token verification failed:', error);
        res.status(401).json({ error: 'Invalid token', details: error.message });
    }
});

/**
 * POST /api/auth/login
 * Log in with Email/Password via Firebase REST API
 */
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    try {
        const data = await callFirebaseREST('signInWithPassword', { email, password });
        res.json({
            success: true,
            user: {
                uid: data.localId,
                email: data.email,
                idToken: data.idToken,
                refreshToken: data.refreshToken
            }
        });
    } catch (error) {
        console.error("Login failed:", error);
        res.status(401).json({ error: error.message });
    }
});

/**
 * POST /api/auth/register
 * Register with Email/Password via Firebase REST API
 */
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    try {
        const data = await callFirebaseREST('signUp', { email, password });
        res.json({
            success: true,
            user: {
                uid: data.localId,
                email: data.email,
                idToken: data.idToken,
                refreshToken: data.refreshToken
            }
        });
    } catch (error) {
        console.error("Registration failed:", error);
        res.status(400).json({ error: error.message });
    }
});

/**
 * POST /api/auth/guest
 * Create Anonymous User via Firebase REST API
 */
router.post('/guest', async (req, res) => {
    try {
        // Calling signUp without email/password creates anonymous account
        const data = await callFirebaseREST('signUp', {});
        res.json({
            success: true,
            user: {
                uid: data.localId,
                isAnonymous: true,
                idToken: data.idToken,
                refreshToken: data.refreshToken
            }
        });
    } catch (error) {
        console.error("Guest login failed:", error);
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
        console.error('[ERROR] Custom token creation failed:', error);
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
        console.error('[ERROR] Failed to get user:', error);
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
        console.error('[ERROR] Failed to update user:', error);
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
        console.error('[ERROR] Failed to delete user:', error);
        res.status(400).json({ error: 'Failed to delete user', details: error.message });
    }
});

export default router;
