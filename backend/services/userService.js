
import { getFirestore } from '../firebaseAdmin.js';
import { logger } from '../logger.js';
import crypto from 'crypto';

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
    role: userData.role || 'candidate', // Default to candidate if not specified
    updatedAt: new Date().toISOString(),
  };

  // If new user, set createdAt
  try {
    const doc = await userRef.get();

    // Generate public token if it doesn't exist
    let existingData = doc.exists ? doc.data() : {};
    if (!existingData.shareToken) {
        payload.shareToken = crypto.randomUUID(); // Secure unique token
    }

    if (!doc.exists) {
      payload.createdAt = new Date().toISOString();
      payload.credits = 10;
    }

    await userRef.set(payload, { merge: true });
    logger.info('User synced to Firestore', { uid, collection: USERS_COLLECTION, role: payload.role });

    // Also sync shareToken to workspace doc for convenience if it exists
    if (payload.shareToken) {
       const WORKSPACE_ENV_SUFFIX = process.env.WORKSPACE_ENVIRONMENT || (process.env.NODE_ENV === 'production' ? 'production' : 'development');
       const workspaceUserRef = db.collection(`workspace-${WORKSPACE_ENV_SUFFIX}`)
            .doc('global')
            .collection(`users-${WORKSPACE_ENV_SUFFIX}`)
            .doc(uid);

       workspaceUserRef.set({ shareToken: payload.shareToken }, { merge: true }).catch(() => {});
    }

    return payload; // Return data so caller can use generated fields like shareToken
  } catch (error) {
    logger.error('Failed to sync user to Firestore', { uid, error: error.message });
    throw error;
  }
};
