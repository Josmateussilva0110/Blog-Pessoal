import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { applyDocumentMeta } from "@/lib/documentMeta";

export function DocumentMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    applyDocumentMeta(pathname);
  }, [pathname]);

  return null;
}
