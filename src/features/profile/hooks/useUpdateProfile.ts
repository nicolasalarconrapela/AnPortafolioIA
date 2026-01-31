import { useMutation, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "../api/profileApi";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: profileApi.updateProfile,
    onSuccess: () => {
      // Invalidar cache para refetch automático
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
