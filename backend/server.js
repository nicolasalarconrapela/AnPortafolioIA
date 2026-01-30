import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initializeFirebaseAdmin } from './firebaseAdmin.js';
import firestoreRoutes from './routes/firestoreRoutes.js';
import testRoutes from './routes/testRoutes.js';
import { config } from './config.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- Environment & Config ---
console.log(`[INFO] Backend starting...`);

// --- Firebase Initialization ---
try {
    initializeFirebaseAdmin();
} catch (error) {
    console.warn('[WARN] Firebase Admin initialization failed. Firestore endpoints will not be available.', error.message);
}

// --- Routes ---
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'AnPortafolioIA Backend is running',
    });
});

// Firestore Routes
app.use('/api/firestore', firestoreRoutes);

// Test Routes (for quick Firebase testing)
app.use('/api/test', testRoutes);



// --- Server Start ---
app.listen(config.PORT, config.HOST, () => {
    console.log(`[INFO] Backend listening externally at ${config.EXTERNAL_URL}`);
    console.log(`[INFO] (Internally bound to ${config.HOST}:${config.PORT})`);
});
