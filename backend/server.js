import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { initializeFirebaseAdmin } from './firebaseAdmin.js';
import firestoreRoutes from './routes/firestoreRoutes.js';
import authRoutes from './routes/authRoutes.js';
import testRoutes from './routes/testRoutes.js';
import { config } from './config.js';
import { logger, requestLogger } from './logger.js';
import { validateEnvironment } from './validateEnv.js';

const app = express();

// CORS Config for secure cookies (credentials: true)
const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000', config.EXTERNAL_URL, 'https://anportafolioia.onrender.com', 'https://anportafolioia-egy8.onrender.com'];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            // In dev mode, let's be lenient to avoid blocking localhost variations
            if (process.env.NODE_ENV !== 'production') return callback(null, true);
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
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
