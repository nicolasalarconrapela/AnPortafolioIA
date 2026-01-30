
import express from 'express';
import { getFirestore } from '../firebaseAdmin.js';

const router = express.Router();

/**
 * Simple Hello World endpoint to test Firebase connection
 * Creates a document in a test collection and reads it back
 */
router.post('/hello-world', async (req, res) => {
    const timestamp = new Date().toISOString();
    const { message = 'Hello from AnPortafolioIA!' } = req.body;

    try {
        const firestore = getFirestore();

        // Create a test document
        const testDoc = {
            message,
            timestamp,
            type: 'hello-world-test',
            serverVersion: 'v1.0.0'
        };

        const docRef = await firestore.collection('test-connection').add(testDoc);

        // Read it back to confirm
        const createdDoc = await docRef.get();
        const data = createdDoc.data();

        res.json({
            success: true,
            message: 'Firebase connection successful! ✅',
            documentId: docRef.id,
            data: data,
            tests: {
                write: '✅ Write operation successful',
                read: '✅ Read operation successful',
                timestamp: timestamp
            }
        });

        console.log('[TEST] Hello World test completed successfully:', docRef.id);

    } catch (error) {
        console.error('[ERROR] Hello World test failed:', error);
        res.status(500).json({
            success: false,
            message: 'Firebase connection failed ❌',
            error: error.message,
            troubleshooting: {
                tip1: 'Check if Firebase Admin is initialized',
                tip2: 'Verify .env file has correct credentials',
                tip3: 'Ensure Firestore is enabled in Firebase Console',
                tip4: 'Check firestore.rules allow write to test-connection collection'
            }
        });
    }
});

/**
 * Read all hello-world test documents
 */
router.get('/hello-world', async (req, res) => {
    try {
        const firestore = getFirestore();
        const snapshot = await firestore.collection('test-connection')
            .where('type', '==', 'hello-world-test')
            .orderBy('timestamp', 'desc')
            .limit(10)
            .get();

        const documents = [];
        snapshot.forEach(doc => {
            documents.push({
                id: doc.id,
                ...doc.data()
            });
        });

        res.json({
            success: true,
            count: documents.length,
            documents,
            message: documents.length > 0
                ? `Found ${documents.length} test document(s)`
                : 'No test documents found. Try POST /api/test/hello-world first.'
        });

    } catch (error) {
        console.error('[ERROR] Reading test documents failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Clean up test documents
 */
router.delete('/hello-world', async (req, res) => {
    try {
        const firestore = getFirestore();
        const snapshot = await firestore.collection('test-connection')
            .where('type', '==', 'hello-world-test')
            .get();

        const batch = firestore.batch();
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();

        res.json({
            success: true,
            message: `Deleted ${snapshot.size} test document(s)`,
            count: snapshot.size
        });

        console.log('[TEST] Cleaned up test documents:', snapshot.size);

    } catch (error) {
        console.error('[ERROR] Cleanup failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Comprehensive Firebase feature test
 */
router.get('/comprehensive', async (req, res) => {
    const results = {
        timestamp: new Date().toISOString(),
        tests: {}
    };

    try {
        const firestore = getFirestore();

        // Test 1: Write
        try {
            const docRef = await firestore.collection('test-connection').add({
                test: 'write',
                timestamp: new Date().toISOString()
            });
            results.tests.write = { status: '✅', documentId: docRef.id };
        } catch (e) {
            results.tests.write = { status: '❌', error: e.message };
        }

        // Test 2: Read
        try {
            const snapshot = await firestore.collection('test-connection').limit(1).get();
            results.tests.read = {
                status: '✅',
                documentsFound: snapshot.size
            };
        } catch (e) {
            results.tests.read = { status: '❌', error: e.message };
        }

        // Test 3: Update
        try {
            const testDoc = await firestore.collection('test-connection').add({
                test: 'update-initial'
            });
            await testDoc.update({ test: 'update-modified', updated: true });
            results.tests.update = { status: '✅', documentId: testDoc.id };
        } catch (e) {
            results.tests.update = { status: '❌', error: e.message };
        }

        // Test 4: Delete
        try {
            const testDoc = await firestore.collection('test-connection').add({
                test: 'delete-me'
            });
            await testDoc.delete();
            results.tests.delete = { status: '✅' };
        } catch (e) {
            results.tests.delete = { status: '❌', error: e.message };
        }

        // Test 5: Query
        try {
            const snapshot = await firestore.collection('test-connection')
                .where('test', '==', 'write')
                .get();
            results.tests.query = {
                status: '✅',
                resultsFound: snapshot.size
            };
        } catch (e) {
            results.tests.query = { status: '❌', error: e.message };
        }

        // Summary
        const passed = Object.values(results.tests).filter(t => t.status === '✅').length;
        const total = Object.keys(results.tests).length;

        results.summary = {
            passed,
            total,
            percentage: Math.round((passed / total) * 100),
            overall: passed === total ? '✅ All tests passed!' : `⚠️ ${passed}/${total} tests passed`
        };

        res.json(results);

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            results
        });
    }
});

export default router;
