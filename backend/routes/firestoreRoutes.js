
import express from 'express';
import { getFirestore } from '../firebaseAdmin.js';

const router = express.Router();

// --- Firestore API Endpoints ---

router.get('/workspaces/:userKey', async (req, res) => {
    const { userKey } = req.params;
    const { collectionOverride } = req.query;

    try {
        const firestore = getFirestore();
        const collectionName = collectionOverride || 'workspace-test';

        const toBase64Url = (str) => Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        const docKey = toBase64Url(userKey);

        const docRef = firestore.collection(collectionName).doc(docKey);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return res.status(404).json({ error: 'Workspace not found' });
        }

        // --- Professional Caching Logic ---
        // Use Firestore document metadata to handle If-Modified-Since
        const lastUpdateDate = docSnap.updateTime.toDate();
        const lastModified = lastUpdateDate.toUTCString();

        if (req.headers['if-modified-since'] === lastModified) {
            return res.status(304).end();
        }

        res.setHeader('Last-Modified', lastModified);
        res.setHeader('Cache-Control', 'no-cache'); // Force revalidation but allow 304
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

    try {
        const firestore = getFirestore();
        const collectionName = collectionOverride || 'workspace-test';
        const toBase64Url = (str) => Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        const docKey = toBase64Url(userKey);

        const docRef = firestore.collection(collectionName).doc(docKey);
        await docRef.set(data, { merge: true });

        res.json({ success: true });
    } catch (error) {
        console.error('[ERROR] Firestore Upsert Error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.delete('/workspaces/:userKey', async (req, res) => {
    const { userKey } = req.params;
    const { collectionOverride } = req.query;

    try {
        const firestore = getFirestore();
        const collectionName = collectionOverride || 'workspace-test';
        const toBase64Url = (str) => Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        const docKey = toBase64Url(userKey);

        await firestore.collection(collectionName).doc(docKey).delete();

        res.json({ success: true });
    } catch (error) {
        console.error('[ERROR] Firestore Delete Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Child Documents
router.get('/workspaces/:userKey/child/:childCollection/:childDocId', async (req, res) => {
    const { userKey, childCollection, childDocId } = req.params;
    const { collectionOverride } = req.query;

    try {
        const firestore = getFirestore();
        const collectionName = collectionOverride || 'workspace-test';
        const toBase64Url = (str) => Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        const docKey = toBase64Url(userKey);

        // Sanitize segments (simple replacement)
        const sanitize = (str) => str.replace(/[^a-zA-Z0-9_.-]/g, '-');

        const docRef = firestore.collection(collectionName).doc(docKey)
            .collection(sanitize(childCollection)).doc(sanitize(childDocId));

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
    const { merge = true } = req.query; // Allow controlling merge via query param

    try {
        const firestore = getFirestore();
        const collectionName = collectionOverride || 'workspace-test';
        const toBase64Url = (str) => Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        const docKey = toBase64Url(userKey);
        const sanitize = (str) => str.replace(/[^a-zA-Z0-9_.-]/g, '-');

        const docRef = firestore.collection(collectionName).doc(docKey)
            .collection(sanitize(childCollection)).doc(sanitize(childDocId));

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

    try {
        const firestore = getFirestore();
        const collectionName = collectionOverride || 'workspace-test';
        const toBase64Url = (str) => Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        const docKey = toBase64Url(userKey);
        const sanitize = (str) => str.replace(/[^a-zA-Z0-9_.-]/g, '-');

        const docRef = firestore.collection(collectionName).doc(docKey)
            .collection(sanitize(childCollection)).doc(sanitize(childDocId));

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
        const collectionName = collectionOverride || 'firebase-action-logs';

        // Add server timestamp
        const payload = {
            ...data,
            serverTimestamp: new Date().toISOString() // Use ISO string as serverTimestamp proxy
        };

        await firestore.collection(collectionName).add(payload);

        res.json({ success: true });
    } catch (error) {
        console.error('[ERROR] Firestore Log Error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
