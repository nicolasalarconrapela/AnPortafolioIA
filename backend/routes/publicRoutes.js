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
        // Determine collection name based on env, similar to other routes
        // IMPORTANT: The shareToken is stored in the 'users' (or 'users_dev') collection,
        // NOT primarily in the workspace collection (though we sync it there).
        // For public access, we should search the primary user registry.
        const collectionName = process.env.NODE_ENV === 'production' ? 'users' : 'users_dev';

        // Query by shareToken instead of doc ID
        const snapshot = await firestore.collection(collectionName)
            .where('shareToken', '==', token)
            .limit(1)
            .get();

        if (snapshot.empty) {
            // Fallback: Check workspace collection if not found in main users
            // This handles cases where maybe it was only written to one place
            // although our sync logic tries to keep them consistent.
            return res.status(404).json({ error: "Profile not found or invalid token." });
        }

        const docSnap = snapshot.docs[0];
        const data = docSnap.data();

        // Security: ONLY return the profile section
        // We preferentially use 'profile' structure, but fall back to root fields
        const publicData = {
            profile: {
                fullName: data.displayName || data.profile?.fullName || 'User',
                avatarUrl: data.photoURL || data.profile?.avatarUrl || '',
                bio: data.profile?.bio || '',
                title: data.profile?.title || '',
                // Add any other public allowed fields here
            }
        };

        // Cache control - Public data can be cached briefly
        res.setHeader('Cache-Control', 'public, max-age=60');
        res.json(publicData);

    } catch (error) {
        console.error('[ERROR] Public Profile Get Error:', error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
