import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { isAdminRoute } from "@/lib/isAdminRoute";
import { useAuth } from "../hooks/useAuth";

/**
 * Restaura a sessão ao entrar no admin. No site público não consulta a API (visitante
 * comum não paga essa requisição), mas mantém o usuário já carregado: o admin que volta
 * ao site continua vendo o botão "Editar" e o detalhe sem cache HTTP.
 */
export function AuthScope() {
  const location = useLocation();
  const { bootstrapAuth } = useAuth();
  const wasAdminRef = useRef(false);

  useEffect(() => {
    const isAdmin = isAdminRoute(location.pathname);

    if (isAdmin && !wasAdminRef.current) {
      void bootstrapAuth();
    }
    wasAdminRef.current = isAdmin;
  }, [location.pathname, bootstrapAuth]);

  return null;
}
