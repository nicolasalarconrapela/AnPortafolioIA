import { useQuery } from "@tanstack/react-query";
import { profileApi } from "../api/profileApi";

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: profileApi.getProfile,
    // Opciones adicionales según necesidad
    staleTime: 1000 * 60 * 5, // 5 min
  });
}
