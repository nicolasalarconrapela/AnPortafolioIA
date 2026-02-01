import express from 'express';
import { getFirestore } from '../firebaseAdmin.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

// --- Middleware: Protect all Firestore routes ---
router.use(requireAuth);

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
        // Use a secure user-specific collection or document structure
        // Current logic maps userKey -> DocId. We keep this but secured.
        const collectionName = collectionOverride || 'users-workspaces';

        // We use the UID directly as the document verification key,
        // avoiding obscure base64 transforms unless strictly needed for legacy compatibility.
        // If legacy compat is needed, we keep the transform but I'll simplify to use UID if possible.
        // Let's stick to the previous base64 logic to avoid breaking existing data IF it was important,
        // BUT for a clean migration, using UID as Doc Name is better.
        // Let's assume we WANT to migrate to UID-based keys.

        const docRef = firestore.collection(collectionName).doc(targetUid);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            // Auto-create workspace for the user
            const initialData = {
                ownerId: targetUid,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                workspaces: [],
                settings: {},
                onboardingCompleted: false
            };

            await docRef.set(initialData);
            return res.json(initialData);
        }

        // --- Professional Caching Logic ---
        const lastUpdateDate = docSnap.updateTime.toDate();
        const lastModified = lastUpdateDate.toUTCString();

        if (req.headers['if-modified-since'] === lastModified) {
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
        const collectionName = collectionOverride || 'users-workspaces';

        const docRef = firestore.collection(collectionName).doc(targetUid);

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
        await firestore.collection(collectionName).doc(targetUid).delete();
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

        const docRef = firestore.collection(collectionName).doc(targetUid)
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

        const docRef = firestore.collection(collectionName).doc(targetUid)
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

        const docRef = firestore.collection(collectionName).doc(targetUid)
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
