import { useEffect } from "react";
import { setDocumentTitleOverride } from "@/lib/documentMeta";

export function useDocumentTitle(title: string | null | undefined) {
  useEffect(() => {
    setDocumentTitleOverride(title ?? null);

    return () => {
      setDocumentTitleOverride(null);
    };
  }, [title]);
}
