import { useRef, useState, type ChangeEvent } from "react";
import {
  formatMegabytes,
  IMAGE_FORMAT_LABELS,
  PROFILE_IMAGE_MAX_BYTES,
  PROFILE_IMAGE_MIME_TYPES,
} from "@blog/shared/constants";
import { Image } from "@/components/ui/Image";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { partitionImageFiles } from "@/lib/imageFiles";
import { resolveProfileImageUrl } from "@/lib/profileImageUrl";
import { PROFILE_IMAGE_ACCEPT } from "../constants";
import { useProfileImage } from "../hooks/useProfileImage";

export function ProfileImageForm() {
  const { user } = useAuth();
  const toast = useToast();
  const { upload, remove } = useProfileImage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const isUploading = upload.isPending;
  const isRemoving = remove.isPending;

  const currentImageUrl = previewUrl ?? resolveProfileImageUrl(user?.profileImagePublicUrl);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const { rejected } = partitionImageFiles([file], {
      mimeTypes: PROFILE_IMAGE_MIME_TYPES,
      maxBytes: PROFILE_IMAGE_MAX_BYTES,
    });
    if (rejected.length > 0) {
      toast.error(`Use ${IMAGE_FORMAT_LABELS} de até ${formatMegabytes(PROFILE_IMAGE_MAX_BYTES)}.`);
      return;
    }

    // Prévia local enquanto o envio acontece
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    try {
      await upload.mutateAsync(file);
      toast.success("Foto de perfil atualizada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível enviar a foto.");
    } finally {
      setPreviewUrl(null);
      URL.revokeObjectURL(objectUrl);
    }
  }

  async function handleRemove() {
    if (!user?.hasProfileImage) return;

    try {
      await remove.mutateAsync();
      toast.success("Foto de perfil removida.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível remover a foto.");
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
        wrapperClassName="mx-auto sm:mx-0"
      />

      <div className="flex flex-col gap-3 flex-1 w-full">
        <p className="text-sm leading-relaxed text-home-muted">
          Esta foto aparece na página inicial do portfólio. Formatos aceitos:
          {IMAGE_FORMAT_LABELS} (máx. {formatMegabytes(PROFILE_IMAGE_MAX_BYTES)}).
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
              variant="secondary"
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
