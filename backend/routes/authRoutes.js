import express from 'express';
import { getAuth } from '../firebaseAdmin.js';

const router = express.Router();

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
 * POST /api/auth/create-user
 * Crea un nuevo usuario en Firebase Auth
 */
router.post('/create-user', async (req, res) => {
    const { email, password, displayName } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const auth = getAuth();
        const userRecord = await auth.createUser({
            email,
            password,
            displayName: displayName || null,
        });

        res.json({
            success: true,
            uid: userRecord.uid,
            email: userRecord.email,
        });
    } catch (error) {
        console.error('[ERROR] User creation failed:', error);
        res.status(400).json({ error: 'Failed to create user', details: error.message });
    }
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
