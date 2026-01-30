import 'dotenv/config';

export const config = {
    PORT: process.env.PORT || 3001,
    HOST: process.env.HOST || '0.0.0.0',
    // External URL for callbacks/redirects
    get EXTERNAL_URL() {
        return process.env.EXTERNAL_URL || `http://localhost:${this.PORT}`;
    },

    GITHUB: {
        CLIENT_ID: process.env.GITHUB_CLIENT_ID,
        CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    },

    FIREBASE: {
        PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
        PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
        CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
        DATABASE_URL: process.env.FIREBASE_DATABASE_URL,
    }
};

// Validation - Relaxed for PortafolioIA if not using GitHub login
// if (!config.GITHUB.CLIENT_ID || !config.GITHUB.CLIENT_SECRET) {
//     console.warn("[WARN] GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET is not set.");
// }
