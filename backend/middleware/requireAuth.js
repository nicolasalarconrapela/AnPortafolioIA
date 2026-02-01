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

    // 3. STRICT CHECK: Verify user exists in Firebase Auth
    // This ensures that even if the session cookie is valid, the user record must exist.
    try {
      const userRecord = await getAuth().getUser(decodedClaims.uid);
      req.userRecord = userRecord;
    } catch (userError) {
      logger.warn("RequireAuth: User record missing in Firebase", { uid: decodedClaims.uid });
      return res.status(401).json({ error: "Unauthorized: User does not exist" });
    }

    // 4. Attach User Claims
    req.user = decodedClaims;
    next();
  } catch (error) {
    logger.warn("Session Cookie Verification Failed", { error: error.message });
    res.status(401).json({ error: "Unauthorized: Invalid session" });
  }
};
