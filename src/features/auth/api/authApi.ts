import { apiClient } from "@/shared/api/client";
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
} from "../model/types";

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  register: (payload: RegisterPayload) =>
    apiClient<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  loginGuest: () =>
    apiClient<AuthResponse>("/auth/guest", {
      method: "POST",
    }),

  logout: () =>
    apiClient<void>("/auth/logout", {
      method: "POST",
    }),
};
