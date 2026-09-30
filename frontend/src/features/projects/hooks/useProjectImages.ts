import type { ImageOrderEntry } from "@blog/shared";
import { useCallback, useEffect, useRef, useState } from "react";

/** Imagem no formulário: já salva (URL pública) ou recém-escolhida (arquivo + URL local) */
export type LocalImage = {
  id: string;
  url: string;
  file?: File;
  isExisting?: boolean;
};

/**
 * Monta o que o backend espera: URLs mantidas, a ordem final (novas como
 * { pending: n }, na ordem dos arquivos enviados) e os arquivos novos.
 */
export function buildImageSubmission(images: LocalImage[]) {
  let pendingIndex = 0;
  const imageOrder: ImageOrderEntry[] = images.map((image) => {
    if (image.isExisting) return image.url;

    const entry = { pending: pendingIndex };
    pendingIndex += 1;
    return entry;
  });

  return {
    images: images.filter((item) => item.isExisting).map((item) => item.url),
    imageOrder,
    files: images.filter((item) => item.file).map((item) => item.file!),
  };
}

function toExistingImages(urls: string[]): LocalImage[] {
  return urls.map((url) => ({ id: url, url, isExisting: true }));
}

/** Estado das imagens do formulário de projeto: adicionar, remover e reordenar */
export function useProjectImages(initialUrls: string[] = []) {
  const [images, setImages] = useState<LocalImage[]>(() => toExistingImages(initialUrls));
  const imagesRef = useRef(images);
  imagesRef.current = images;

  // Libera as URLs locais (blob:) ao sair do formulário
  useEffect(
    () => () => {
      for (const image of imagesRef.current) {
        if (image.file) URL.revokeObjectURL(image.url);
      }
    },
    [],
  );

  const resetImages = useCallback((urls: string[]) => {
    setImages(toExistingImages(urls));
  }, []);

  const addFiles = useCallback((files: File[]) => {
    const nextImages = files.map((file) => ({
      id: `${file.name}-${file.lastModified}`,
      url: URL.createObjectURL(file),
      file,
    }));
    setImages((current) => [...current, ...nextImages]);
  }, []);

  const removeImage = useCallback((id: string) => {
    setImages((current) => {
      const target = current.find((item) => item.id === id);
      if (target?.file) URL.revokeObjectURL(target.url);
      return current.filter((item) => item.id !== id);
    });
  }, []);

  const moveImage = useCallback((id: string, direction: "up" | "down") => {
    setImages((current) => {
      const index = current.findIndex((item) => item.id === id);
      if (index === -1) return current;

      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= current.length) return current;

      const next = [...current];
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  }, []);

  return { images, resetImages, addFiles, removeImage, moveImage };
}
