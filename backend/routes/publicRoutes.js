import express from 'express';
import { getFirestore } from '../firebaseAdmin.js';

const router = express.Router();

/* Helper to resolve User Document Reference
 * Structure: workspace-[env] > global > users-[env] > [uid]
 */
const getUserDocRef = (firestore, collectionName, targetUid) => {
    if (collectionName.startsWith('workspace-')) {
        const envSuffix = collectionName.replace('workspace-', '');
        return firestore.collection(collectionName)
            .doc('global')
            .collection(`users-${envSuffix}`)
            .doc(targetUid);
    }
    return firestore.collection(collectionName).doc(targetUid);
};

// GET /api/public/profile/:token
router.get('/profile/:token', async (req, res) => {
    const { token } = req.params;
    const { collectionOverride } = req.query;

    if (!token) {
        return res.status(400).json({ error: "Missing token" });
    }

    try {
        const firestore = getFirestore();
        const collectionName = process.env.NODE_ENV === 'production' ? 'users' : 'users_dev';

        // 1. Find Query by shareToken
        const snapshot = await firestore.collection(collectionName)
            .where('shareToken', '==', token)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return res.status(404).json({ error: "Profile not found or invalid token." });
        }

        const userDoc = snapshot.docs[0];
        const targetUid = userDoc.id;

        // 2. Resolve Workspace Collection Path
        const isDev = process.env.NODE_ENV !== 'production';
        const workspaceCollection = isDev ? "workspace-development" : "workspace-production";
        const usersCollection = isDev ? "users-development" : "users-production";

        // Structure: workspace-[env] > global > users-[env] > [uid]
        const workspaceDocRef = firestore.collection(workspaceCollection)
            .doc('global')
            .collection(usersCollection)
            .doc(targetUid);

        const workspaceSnap = await workspaceDocRef.get();

        if (!workspaceSnap.exists) {
            console.warn(`[WARN] Public Profile: User ${targetUid} found but workspace missing.`);
            return res.status(404).json({ error: "Profile data not initialized." });
        }

        const workspaceData = workspaceSnap.data();

        // 3. Return Data + userKey (uid) for decryption
        // We do NOT decrypt here. The frontend has the logic.
        // We strip sensitive fields if necessary, but for now we assume workspace 'profile' is what matters.
        // If encrypted, workspaceData.encryptedPayload is present.
        // If plain, workspaceData.profile is present.

        const responseData = {
            ...workspaceData,
            userKey: targetUid // Critical for frontend decryption
        };

        // Cache control
        res.setHeader('Cache-Control', 'public, max-age=60');
        res.json({ profile: responseData }); // Wrap in 'profile' key to match expected structure or adjust frontend



    } catch (error) {
        console.error('[ERROR] Public Profile Get Error:', error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
