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

  /**
   * Login with Google (Calls Backend OAuth Flow)
   */
  async loginGoogle(): Promise<any> {
    // 1. Get the OAuth URL
    const response = await fetch(`${BASE_URL}/google/url`);
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.error || "Failed to get Google Auth URL");

    // 2. Open Popup
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      data.url,
      "Google Login",
      `width=${width},height=${height},top=${top},left=${left}`
    );

    if (!popup) throw new Error("Popup blocked");

    // 3. Wait for message
    return new Promise((resolve, reject) => {
      // Handle message from popup
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.success) {
          window.removeEventListener("message", handleMessage);
          resolve(event.data.user);
        } else if (event.data?.success === false) {
          window.removeEventListener("message", handleMessage);
          reject(new Error(event.data.error || "Google Auth Failed"));
        }
      };

      window.addEventListener("message", handleMessage);

      // Detect closed popup
      const timer = setInterval(() => {
        if (popup.closed) {
          clearInterval(timer);
          window.removeEventListener("message", handleMessage);
          // If no message received yet, it was closed manually
          // reject(new Error("Login window closed"));
        }
      }, 1000);
    });
  }
}

export const authService = new AuthService();
