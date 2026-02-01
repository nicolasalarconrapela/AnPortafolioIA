import express from 'express';
import { getFirestore } from '../firebaseAdmin.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

// --- Middleware: Protect all Firestore routes ---
// --- Middleware: Protect all Firestore routes ---
router.use(requireAuth);

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

// --- Firestore API Endpoints ---

router.get('/workspaces/:userKey', async (req, res) => {
    const { userKey } = req.params;
    const { collectionOverride } = req.query;

    // Security Check: Ensure user matches the requested key
    // We allow "me" alias for convenience
    const targetUid = userKey === 'me' ? req.user.uid : userKey;

    if (targetUid !== req.user.uid) {
        return res.status(403).json({ error: "Unauthorized: You can only access your own workspace." });
    }

    try {
        const firestore = getFirestore();
        // Use environment-specific collection >> global doc >> users collection >> uid doc
        // Structure: workspace-[env]/global/users/[uid]
        const collectionName = collectionOverride || 'users';

        const docRef = getUserDocRef(firestore, collectionName, targetUid);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            // Auto-create workspace for the user with default data
            const defaultWorkspaceId = `ws-${Date.now()}`;
            const initialData = {
                ownerId: targetUid,
                email: req.user.email || null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                workspaces: [
                    {
                        id: defaultWorkspaceId,
                        name: "Mi Espacio de Trabajo",
                        isDefault: true,
                        role: "owner",
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                ],
                profile: {
                    fullName: req.user.name || req.user.email?.split('@')[0] || "Usuario",
                    title: "",
                    location: "",
                    bio: "",
                    avatarUrl: req.user.picture || ""
                },
                settings: {
                    theme: 'system',
                    language: 'es'
                },
                onboardingCompleted: false
            };

            await docRef.set(initialData);
            return res.json(initialData);
        }

        // --- Professional Caching Logic ---
        const lastUpdateDate = docSnap.updateTime.toDate();
        const lastModified = lastUpdateDate.toUTCString();

        // Respect explicit Cache-Control: no-cache to force fresh data (bypass 304)
        const clientCacheControl = req.headers['cache-control'] || '';
        const forceRefresh = clientCacheControl.includes('no-cache');

        if (!forceRefresh && req.headers['if-modified-since'] === lastModified) {
            return res.status(304).end();
        }

        res.setHeader('Last-Modified', lastModified);
        res.setHeader('Cache-Control', 'private, no-cache'); // Private because it's user data
        res.json(docSnap.data());
    } catch (error) {
        console.error('[ERROR] Firestore Get Error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/workspaces/:userKey', async (req, res) => {
    const { userKey } = req.params;
    const { collectionOverride } = req.query;
    const data = req.body;

    const targetUid = userKey === 'me' ? req.user.uid : userKey;
    if (targetUid !== req.user.uid) return res.status(403).json({ error: "Unauthorized" });

    try {
        const firestore = getFirestore();
        const collectionName = collectionOverride || 'users';

        const docRef = getUserDocRef(firestore, collectionName, targetUid);

        // Ensure we don't overwrite critical metadata
        const payload = {
            ...data,
            updatedAt: new Date().toISOString(),
            ownerId: req.user.uid
        };

        await docRef.set(payload, { merge: true });

        res.json({ success: true });
    } catch (error) {
        console.error('[ERROR] Firestore Upsert Error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.delete('/workspaces/:userKey', async (req, res) => {
    const { userKey } = req.params;
    const { collectionOverride } = req.query;

    const targetUid = userKey === 'me' ? req.user.uid : userKey;
    if (targetUid !== req.user.uid) return res.status(403).json({ error: "Unauthorized" });

    try {
        const firestore = getFirestore();
        const collectionName = collectionOverride || 'users-workspaces';

        const docRef = getUserDocRef(firestore, collectionName, targetUid);

        await docRef.delete();
        res.json({ success: true });
    } catch (error) {
        console.error('[ERROR] Firestore Delete Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Child Documents (Sub-collections)
router.get('/workspaces/:userKey/child/:childCollection/:childDocId', async (req, res) => {
    const { userKey, childCollection, childDocId } = req.params;
    const { collectionOverride } = req.query;

    const targetUid = userKey === 'me' ? req.user.uid : userKey;
    if (targetUid !== req.user.uid) return res.status(403).json({ error: "Unauthorized" });

    try {
        const firestore = getFirestore();
        const collectionName = collectionOverride || 'users-workspaces';

        // Sanitize
        const safeChildColl = childCollection.replace(/[^a-zA-Z0-9_.-]/g, '-');
        const safeChildDoc = childDocId.replace(/[^a-zA-Z0-9_.-]/g, '-');

        const docRef = getUserDocRef(firestore, collectionName, targetUid)
            .collection(safeChildColl).doc(safeChildDoc);

        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return res.status(404).json({ error: 'Child document not found' });
        }

        res.json(docSnap.data());
    } catch (error) {
        console.error('[ERROR] Firestore Child Get Error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/workspaces/:userKey/child/:childCollection/:childDocId', async (req, res) => {
    const { userKey, childCollection, childDocId } = req.params;
    const { collectionOverride } = req.query;
    const data = req.body;
    const { merge = true } = req.query;

    const targetUid = userKey === 'me' ? req.user.uid : userKey;
    if (targetUid !== req.user.uid) return res.status(403).json({ error: "Unauthorized" });

    try {
        const firestore = getFirestore();
        const collectionName = collectionOverride || 'users-workspaces';

        const safeChildColl = childCollection.replace(/[^a-zA-Z0-9_.-]/g, '-');
        const safeChildDoc = childDocId.replace(/[^a-zA-Z0-9_.-]/g, '-');

        const docRef = getUserDocRef(firestore, collectionName, targetUid)
            .collection(safeChildColl).doc(safeChildDoc);

        await docRef.set(data, { merge: merge === 'true' || merge === true });

        res.json({ success: true });
    } catch (error) {
        console.error('[ERROR] Firestore Child Upsert Error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.delete('/workspaces/:userKey/child/:childCollection/:childDocId', async (req, res) => {
    const { userKey, childCollection, childDocId } = req.params;
    const { collectionOverride } = req.query;

    const targetUid = userKey === 'me' ? req.user.uid : userKey;
    if (targetUid !== req.user.uid) return res.status(403).json({ error: "Unauthorized" });

    try {
        const firestore = getFirestore();
        const collectionName = collectionOverride || 'users-workspaces';

        const safeChildColl = childCollection.replace(/[^a-zA-Z0-9_.-]/g, '-');
        const safeChildDoc = childDocId.replace(/[^a-zA-Z0-9_.-]/g, '-');

        const docRef = getUserDocRef(firestore, collectionName, targetUid)
            .collection(safeChildColl).doc(safeChildDoc);

        await docRef.delete();
        res.json({ success: true });
    } catch (error) {
        console.error('[ERROR] Firestore Child Delete Error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.post('/logs', async (req, res) => {
    const { collectionOverride } = req.query;
    const data = req.body;

    try {
        const firestore = getFirestore();
        const collectionName = collectionOverride || 'user-action-logs';

        // Add server timestamp and USER ID
        const payload = {
            ...data,
            uid: req.user.uid, // Persist User ID
            email: req.user.email,
            serverTimestamp: new Date().toISOString()
        };

        await firestore.collection(collectionName).add(payload);

        res.json({ success: true });
    } catch (error) {
        console.error('[ERROR] Firestore Log Error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
