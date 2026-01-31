import 'dotenv/config';

export const config = {
    PORT: process.env.PORT || 3001,
    HOST: process.env.HOST || '0.0.0.0',
    // External URL for callbacks/redirects
    get EXTERNAL_URL() {
        return process.env.EXTERNAL_URL || `http://localhost:${this.PORT}`;
    },


    FIREBASE: {
        PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
        PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
        CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
        DATABASE_URL: process.env.FIREBASE_DATABASE_URL,
    }
};

