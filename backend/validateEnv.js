import { config } from './config.js';
import { logger } from './logger.js';

export function validateEnvironment() {
    const errors = [];

    // Checked required variables
    const required = [
        { key: 'FIREBASE.PROJECT_ID', value: config.FIREBASE.PROJECT_ID },
        { key: 'FIREBASE.CLIENT_EMAIL', value: config.FIREBASE.CLIENT_EMAIL },
        { key: 'FIREBASE.PRIVATE_KEY', value: config.FIREBASE.PRIVATE_KEY },
    ];

    if (config.FIREBASE.API_KEY || process.env.FIREBASE_API_KEY) {
        // Optional but recommended for Auth
    } else {
        logger.warn("FIREBASE_API_KEY is missing. Email/Password Auth via REST API will fail.");
    }



    required.forEach(item => {
        if (!item.value) {
            errors.push(`Missing required environment variable: ${item.key}`);
        }
    });

    if (errors.length > 0) {
        logger.error("Environment Validation Failed", { errors });
        // We might choose to exit here, or just log loud error
        // process.exit(1); 
        throw new Error("Environment Validation Failed: " + errors.join(", "));
    }

    logger.info("Environment validation passed.");
}
