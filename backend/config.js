import 'dotenv/config';

export const config = {
    PORT: process.env.PORT || 3001,
    HOST: process.env.HOST || '0.0.0.0',
    // External URL for callbacks/redirects
    get EXTERNAL_URL() {
        return process.env.EXTERNAL_URL || `http://localhost:${this.PORT}`;
    },

    // Logging configuration
    LOGGING: {
        LOG_DIR: process.env.LOG_DIR || './logs',
        MAX_BUFFER_SIZE: 500,           // FIFO buffer size for in-memory logs
        ROTATION_INTERVAL: '1d',         // Rotate logs daily
        MAX_FILES: 7,                    // Keep 7 days of logs
        FILENAME_PATTERN: 'app-%Y%m%d.jsonl',  // Log filename pattern
    },

    FIREBASE: {
        PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
        PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
        CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
        DATABASE_URL: process.env.FIREBASE_DATABASE_URL,
        STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET,
    }
};

