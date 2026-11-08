import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { unwrap } from "@/service";
import { deleteProfileImage, uploadProfileImage } from "@/service/profile.service";
import { profileKeys } from "./usePublicProfileImage";

/** Envio e remoção da foto de perfil: atualiza o usuário logado e a foto da home */
export function useProfileImage() {
  const { refreshUser } = useAuth();
  const queryClient = useQueryClient();

  async function syncAfterChange() {
    await Promise.all([
      refreshUser(),
      queryClient.invalidateQueries({ queryKey: profileKeys.publicImage() }),
    ]);
  }

  const upload = useMutation({
    mutationFn: async (file: File) => unwrap(await uploadProfileImage(file)),
    onSuccess: syncAfterChange,
  });

  const remove = useMutation({
    mutationFn: async () => unwrap(await deleteProfileImage()),
    onSuccess: syncAfterChange,
  });

  return { upload, remove };
}
