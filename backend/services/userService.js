
import { getFirestore } from '../firebaseAdmin.js';
import { logger } from '../logger.js';

// Collection name based on environment
const USERS_COLLECTION = process.env.NODE_ENV === 'production' ? 'users' : 'users_dev';

/**
 * Creates or updates a user document in Firestore.
 * @param {string} uid - Firebase User ID
 * @param {object} userData - User data (email, role, etc.)
 */
export const syncUserToFirestore = async (uid, userData) => {
  if (!uid) {
    logger.warn('syncUserToFirestore called without uid');
    return;
  }

  const db = getFirestore();
  const userRef = db.collection(USERS_COLLECTION).doc(uid);

  const payload = {
    ...userData,
    updatedAt: new Date().toISOString(),
  };

  // If new user, set createdAt
  // We use set with merge: true to avoid overwriting if exists but ensure fields are there
  try {
    // Check if exists to set createdAt only on creation if not passed
    const doc = await userRef.get();
    if (!doc.exists) {
      payload.createdAt = new Date().toISOString();
      // Default credits or other init logic can go here
      payload.credits = 10; // Example initial credits
    }

    await userRef.set(payload, { merge: true });
    logger.info('User synced to Firestore', { uid, collection: USERS_COLLECTION });
  } catch (error) {
    logger.error('Failed to sync user to Firestore', { uid, error: error.message });
    // We don't throw here to avoid failing the auth response if just the DB write fails?
    // User requested "guarde en firestore", so maybe we should throw or handle gracefully.
    throw error;
  }
};
