import { env } from "../utils/env";

const BASE_URL = `${env.BACKEND_URL}/api/auth`;

class AuthService {
  /**
   * Login with Email and Password
   * Calls POST /api/auth/login
   */
  async login(email, password) {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include", // Ensure cookie is set
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Login failed");

    return data.user;
  }

  /**
   * Verify Session Validity
   * Calls GET /api/auth/verify (Protected by requireAuth)
   */
  async verifySession() {
    const response = await fetch(`${BASE_URL}/verify`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error("Session Invalid");
    }

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Verification failed");

    return data.user;
  }

  /**
   * Register with Email and Password
   * Calls POST /api/auth/register
   */
  async register(email, password) {
    const response = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include", // Ensure cookie is set
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Registration failed");

    return data.user;
  }

  /**
   * Login/Register as Guest
   * Calls POST /api/auth/guest
   */
  async loginGuest() {
    const response = await fetch(`${BASE_URL}/guest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Ensure cookie is set
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Guest login failed");

    return data.user;
  }

  /**
   * Login with Google (Frontend Popup -> Backend Session Cookie)
   */
  async loginGoogle(): Promise<any> {
    // Dynamic import to avoid hard dependency if Firebase not configured
    const { GoogleAuthProvider, signInWithPopup } = await import(
      "firebase/auth"
    );
    // Use the async getter to ensure config is loaded (Env or Backend Fallback)
    const { getFirebaseAuth } = await import("./firebaseConfig");

    // Use the asynchronous getter
    const authClient = await getFirebaseAuth();

    const provider = new GoogleAuthProvider();

    // 1. Open Google Popup
    const result = await signInWithPopup(authClient, provider);
    const user = result.user;

    // 2. Get ID Token
    const idToken = await user.getIdToken();

    // 3. Send to Backend to create HTTP-only Session Cookie
    const response = await fetch(`${BASE_URL}/session-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
      credentials: "include", // Important!
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Session creation failed");
    }

    // Return user info
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    };
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    await fetch(`${BASE_URL}/logout`, {
      method: "POST",
      credentials: "include",
    });

    // Also sign out from client SDK to clear client-side state
    const { getFirebaseAuth } = await import("./firebaseConfig");
    try {
      const authClient = await getFirebaseAuth();
      await authClient.signOut();
    } catch (e) {
      // Include console log or logging service
    }
  }
}

export const authService = new AuthService();
