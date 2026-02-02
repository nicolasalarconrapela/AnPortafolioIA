import express from 'express';
import { getAuth, getFirestore } from '../firebaseAdmin.js';
import { logger } from '../logger.js';
import { syncUserToFirestore } from '../services/userService.js';
// Using global fetch (Node 18+)
import { config } from '../config.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

const SESSION_COOKIE_BASE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
};

const createSessionCookieOptions = (overrides = {}) => ({
    ...SESSION_COOKIE_BASE_OPTIONS,
    ...overrides
});

const clearSessionCookie = (res) => {
    res.clearCookie('session', createSessionCookieOptions());
};

const WORKSPACE_ENV_SUFFIX = process.env.WORKSPACE_ENVIRONMENT || (process.env.NODE_ENV === 'production' ? 'production' : 'development');
const WORKSPACE_COLLECTION = `workspace-${WORKSPACE_ENV_SUFFIX}`;
const USER_SUBCOLLECTION = `users-${WORKSPACE_ENV_SUFFIX}`;

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

const FIREBASE_AUTH_ERROR_TRANSLATIONS = {
    EMAIL_NOT_FOUND: {
        code: "INVALID_LOGIN_CREDENTIALS",
        message: "No encontramos una cuenta con ese correo."
    },
    INVALID_PASSWORD: {
        code: "INVALID_LOGIN_CREDENTIALS",
        message: "Correo o contraseña incorrectos."
    },
    INVALID_LOGIN_CREDENTIALS: {
        code: "INVALID_LOGIN_CREDENTIALS",
        message: "Correo o contraseña incorrectos."
    },
    USER_DISABLED: {
        code: "ACCOUNT_DISABLED",
        message: "Esta cuenta ha sido deshabilitada. Contacta al soporte si crees que fue un error."
    },
    TOO_MANY_ATTEMPTS_TRY_LATER: {
        code: "TOO_MANY_ATTEMPTS",
        message: "Demasiados intentos fallidos. Intenta de nuevo más tarde."
    },
    EMAIL_EXISTS: {
        code: "EMAIL_ALREADY_EXISTS",
        message: "Ya existe una cuenta registrada con ese correo."
    },
    INVALID_EMAIL: {
        code: "INVALID_EMAIL",
        message: "Por favor ingresa un correo con formato válido."
    },
    OPERATION_NOT_ALLOWED: {
        code: "OPERATION_NOT_ALLOWED",
        message: "Este método de autenticación no está habilitado para este proyecto."
    },
    WEAK_PASSWORD: {
        code: "WEAK_PASSWORD",
        message: "La contraseña debe tener al menos 6 caracteres."
    }
};

const translateFirebaseAuthError = (firebaseCode = "UNKNOWN_FIREBASE_ERROR") => {
    const translation = FIREBASE_AUTH_ERROR_TRANSLATIONS[firebaseCode];
    if (translation) {
        return {
            code: translation.code,
            message: translation.message,
            firebaseCode
        };
    }

    return {
        code: firebaseCode,
        message: `Error de autenticación: ${firebaseCode}`,
        firebaseCode
    };
};

const sendFirebaseAuthError = (res, status, error, fallbackMessage) => {
    res.status(status).json({
        code: error?.code || "FIREBASE_AUTH_ERROR",
        error: error?.message || fallbackMessage || "Error de autenticación",
    });
};

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
        const firebaseCode = data.error?.message || "UNKNOWN_FIREBASE_ERROR";
        const translated = translateFirebaseAuthError(firebaseCode);
        const error = new Error(translated.message);
        error.code = translated.code;
        error.firebaseCode = translated.firebaseCode;
        throw error;
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
    const options = createSessionCookieOptions({ maxAge: expiresIn });
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
        // 1. Verify token to get user details for sync
        const auth = getAuth();
        const decodedToken = await auth.verifyIdToken(idToken);
        const { uid, email, picture, name, firebase } = decodedToken;

        // 2. Sync to Firestore (Users collection)
        // This ensures Google logins are recorded same as Email/Pass
        await syncUserToFirestore(uid, {
            email,
            displayName: name,
            photoURL: picture,
            provider: firebase?.sign_in_provider || 'google',
            lastLogin: new Date().toISOString()
        });

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
    clearSessionCookie(res);
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
        logger.error("Login failed", {
            error: error.message,
            firebaseCode: error.firebaseCode,
            code: error.code,
        });
        return sendFirebaseAuthError(res, 401, error, "Correo o contraseña inválidos");
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
        logger.error("Registration failed", {
            error: error.message,
            firebaseCode: error.firebaseCode,
            code: error.code,
        });
        return sendFirebaseAuthError(res, 400, error, "No se pudo crear la cuenta");
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
        logger.error("Guest login failed", {
            error: error.message,
            firebaseCode: error.firebaseCode,
            code: error.code,
        });
        return sendFirebaseAuthError(res, 500, error, "No pudimos crear una sesión de invitado");
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
 * POST /api/auth/generate-share-token
 * Generates or ensures a share token exists for the current user.
 */
router.post('/generate-share-token', requireAuth, async (req, res) => {
    try {
        const { uid } = req.user;
        const { email, photoURL, displayName } = req.userRecord;

        // Sync allows us to ensure the token exists (logic is inside syncUserToFirestore)
        const userData = await syncUserToFirestore(uid, {
            email,
            picture: photoURL,
            name: displayName
        });

        res.json({
            success: true,
            shareToken: userData.shareToken
        });
    } catch (error) {
        logger.error('Failed to generate share token', { uid: req.user?.uid, error: error.message });
        res.status(500).json({ error: 'Failed to generate token' });
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

/**
 * DELETE /api/auth/account
 * Deletes the current authenticated user, including their Firestore document and auth record.
 */
router.delete('/account', requireAuth, async (req, res) => {
    const uid = req.user.uid;
    const firestore = getFirestore();
    const auth = getAuth();

    const userDocRef = firestore
        .collection(WORKSPACE_COLLECTION)
        .doc('global')
        .collection(USER_SUBCOLLECTION)
        .doc(uid);

    try {
        await userDocRef.delete();

        try {
            await auth.deleteUser(uid);
        } catch (deleteError) {
            if (deleteError.code !== 'auth/user-not-found') {
                throw deleteError;
            }
            logger.warn('Account deletion: auth user already missing', { uid });
        }

        clearSessionCookie(res);

        res.json({
            success: true,
            message: 'Account deleted successfully',
        });
    } catch (error) {
        logger.error('Account deletion failed', { uid, error: error.message });
        res.status(500).json({ error: 'Failed to delete account', details: error.message });
    }
});

export default router;
