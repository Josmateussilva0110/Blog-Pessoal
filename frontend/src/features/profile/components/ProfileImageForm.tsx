import { useRef, useState, type ChangeEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Image } from "@/components/ui/Image";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { mapAuthUser } from "@/features/auth/lib/mapAuthUser";
import { resolveProfileImageUrl } from "@/lib/profileImageUrl";
import {
  deleteProfileImage,
  uploadProfileImage,
} from "@/service/profile.service";
import { PROFILE_IMAGE_ACCEPT } from "../constants";

export function ProfileImageForm() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const currentImageUrl =
    previewUrl ??
    resolveProfileImageUrl(user?.profileImagePublicUrl);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setIsUploading(true);

    try {
      const result = await uploadProfileImage(file);

      if (!result.success) {
        throw new Error(result.message);
      }

      const updatedUser = mapAuthUser(result.data);
      if (updatedUser) {
        await refreshUser();
      }

      setPreviewUrl(null);
      await refreshUser();
      await queryClient.invalidateQueries({ queryKey: ["public-profile-image"] });
      toast.success("Foto de perfil atualizada.");
    } catch (error) {
      setPreviewUrl(null);
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar a foto.",
      );
    } finally {
      setIsUploading(false);
      URL.revokeObjectURL(objectUrl);
    }
  }

  async function handleRemove() {
    if (!user?.hasProfileImage) return;

    setIsRemoving(true);

    try {
      const result = await deleteProfileImage();

      if (!result.success) {
        throw new Error(result.message);
      }

      setPreviewUrl(null);
      await refreshUser();
      await queryClient.invalidateQueries({ queryKey: ["public-profile-image"] });
      toast.success("Foto de perfil removida.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível remover a foto.",
      );
    } finally {
      setIsRemoving(false);
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
      <Image
        src={currentImageUrl}
        alt="Foto de perfil do portfólio"
        variant="profile"
        size="3xl"
        frame
        glow
        wrapperClassName="mx-auto sm:mx-0"
      />

      <div className="flex flex-col gap-3 flex-1 w-full">
        <p className="text-sm text-text-muted leading-relaxed">
          Esta foto aparece na página inicial do portfólio. Formatos aceitos:
          JPEG, PNG e WebP (máx. 2 MB).
        </p>

        <input
          ref={inputRef}
          type="file"
          accept={PROFILE_IMAGE_ACCEPT}
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex flex-col sm:flex-row flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            className="w-full sm:w-auto"
            disabled={isUploading || isRemoving}
            onClick={() => inputRef.current?.click()}
          >
            {isUploading
              ? "Enviando..."
              : user?.hasProfileImage
                ? "Trocar foto"
                : "Enviar foto"}
          </Button>

          {user?.hasProfileImage && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="w-full sm:w-auto"
              disabled={isUploading || isRemoving}
              onClick={handleRemove}
            >
              {isRemoving ? "Removendo..." : "Remover foto"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
