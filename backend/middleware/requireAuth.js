import { getAuth } from '../firebaseAdmin.js';
import { logger } from '../logger.js';

/**
 * Middleware to verify a Firebase Session Cookie.
 * Attaches decodedClaims to req.user.
 */
export const requireAuth = async (req, res, next) => {
    // 1. Get Cookie
    const sessionCookie = req.cookies.session || "";

    if (!sessionCookie) {
        return res.status(401).json({ error: "Unauthorized: No session cookie" });
    }

    try {
        // 2. Verify Session Cookie
        // checkRevoked = true ensures validation fails if user info has changed or revoked
        const decodedClaims = await getAuth().verifySessionCookie(sessionCookie, true);

        // 3. Attach User
        req.user = decodedClaims;
        next();
    } catch (error) {
        logger.warn("Session Cookie Verification Failed", { error: error.message });
        res.status(401).json({ error: "Unauthorized: Invalid session" });
    }
};
