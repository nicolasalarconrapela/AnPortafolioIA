import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  userType: "candidate" | "recruiter" | null;

  // Actions
  setAuthenticated: (
    isAuth: boolean,
    userType?: "candidate" | "recruiter"
  ) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      isAuthenticated: false,
      token: null,
      userType: null,

      setAuthenticated: (isAuth, userType) =>
        set({ isAuthenticated: isAuth, userType: userType || null }),

      setToken: (token) => set({ token }),

      logout: () =>
        set({ isAuthenticated: false, token: null, userType: null }),
    }),
    { name: "AuthStore" }
  )
);
