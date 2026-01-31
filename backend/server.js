import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initializeFirebaseAdmin } from './firebaseAdmin.js';
import firestoreRoutes from './routes/firestoreRoutes.js';
import authRoutes from './routes/authRoutes.js';
import testRoutes from './routes/testRoutes.js';
import { config } from './config.js';
import { logger, requestLogger } from './logger.js';
import { validateEnvironment } from './validateEnv.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(requestLogger); // Observability

// --- Environment & Config ---
logger.info("Backend starting...", { port: config.PORT, env: process.env.NODE_ENV });

// --- Environment Validation ---
try {
    validateEnvironment();
} catch (error) {
    logger.error("Startup Aborted due to Environment Error", { error: error.message });
    process.exit(1);
}

// --- Firebase Initialization ---
try {
    initializeFirebaseAdmin();
} catch (error) {
    logger.warn('Firebase Admin initialization failed. Firestore endpoints will not be available.', { error: error.message });
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

// Auth Routes
app.use('/api/auth', authRoutes);

// Test Routes (for quick Firebase testing)
app.use('/api/test', testRoutes);



// --- Server Start ---
app.listen(config.PORT, config.HOST, () => {
    logger.info(`Backend listening externally at ${config.EXTERNAL_URL}`);
    logger.info(`Internally bound to ${config.HOST}:${config.PORT}`);
});
