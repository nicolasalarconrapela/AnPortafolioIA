import { apiClient } from "@/shared/api/client";
import type { Profile, UpdateProfilePayload } from "../model/types";

export const profileApi = {
  getProfile: () => apiClient<Profile>("/profile"),

  updateProfile: (data: UpdateProfilePayload) =>
    apiClient<Profile>("/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};
