import { ROUTES } from "@/config/routes";

export function isAdminRoute(pathname: string): boolean {
  return pathname === ROUTES.admin || pathname.startsWith(`${ROUTES.admin}/`);
}
