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
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Login failed");

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
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Guest login failed");

    return data.user;
  }
}

export const authService = new AuthService();
