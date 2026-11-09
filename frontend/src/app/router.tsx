import { lazy, Suspense, type ComponentType } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { DocumentMeta } from "@/components/layout/DocumentMeta";
import { FullPageStatus } from "@/components/ui/FullPageStatus";
import { ToastScope } from "@/components/ui/toast";
import { AuthScope } from "@/features/auth/components/AuthScope";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { GuestRoute } from "@/features/auth/components/GuestRoute";
import { RequirePasswordUpdated } from "@/features/auth/components/RequirePasswordUpdated";
import { RequireForcedPasswordChange } from "@/features/auth/components/RequireForcedPasswordChange";
import { HomePage } from "@/routes/public/home/HomePage";
import { RouteErrorPage } from "@/components/layout/RouteErrorPage";
import { ROUTES } from "@/config/routes";
import {
  loadProjectDetailPage,
  ProjectDetailPageLazy,
} from "@/routes/public/project/loadProjectDetailPage";


const ProjectUpdatePage = lazy(() =>
  import("@/routes/public/project/ProjectUpdatePage").then((module) => ({
    default: module.ProjectUpdatePage,
  })),
);

// Layout do admin (menu, ícones) fora do chunk da home: visitante nunca o usa
const AdminLayout = lazy(() =>
  import("@/components/layout/AdminLayout").then((module) => ({ default: module.AdminLayout })),
);
const LoginPage = lazy(() => import("@/routes/admin/login/LoginPage"));
const ChangePasswordPage = lazy(
  () => import("@/routes/admin/change-password/ChangePasswordPage"),
);
const SettingsPage = lazy(() => import("@/routes/admin/settings/SettingsPage"));
const LinksPage = lazy(() => import("@/routes/admin/links/LinksPage"));
const DashboardPage = lazy(() => import("@/routes/admin/dashboard/DashboardPage"));
const ProjectListPage = lazy(
  () => import("@/routes/admin/projects/ProjectListPage"),
);
const ProjectFormPage = lazy(
  () => import("@/routes/admin/projects/ProjectFormPage"),
);

function PublicFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <span role="status" className="animate-pulse text-sm text-home-muted">
        Carregando…
      </span>
    </div>
  );
}

function withSuspense(Component: ComponentType, fallback: "admin" | "public" = "admin") {
  const Fallback = fallback === "public" ? PublicFallback : FullPageStatus;

  return (
    <Suspense fallback={<Fallback />}>
      <Component />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    element: (
      <>
        <DocumentMeta />
        <AuthScope />
        <ToastScope />
        <Outlet />
      </>
    ),
    errorElement: <RouteErrorPage fullPage />,
    children: [
      {
        element: <PublicLayout preloadProjectPage={loadProjectDetailPage} />,
        children: [
          {
            // Rota sem caminho só para o erro aparecer dentro do layout (cabeçalho e rodapé ficam)
            errorElement: <RouteErrorPage />,
            children: [
              { index: true, element: <HomePage /> },
              { path: "projects/:slug", element: withSuspense(ProjectDetailPageLazy, "public") },
              {
                path: "projects/:slug/atualizacoes/:updateId",
                element: withSuspense(ProjectUpdatePage, "public"),
              },
            ],
          },
        ],
      },
      {
        element: <GuestRoute />,
        errorElement: <RouteErrorPage fullPage />,
        children: [{ path: "admin/login", element: withSuspense(LoginPage) }],
      },
      {
        path: "admin",
        element: <ProtectedRoute />,
        errorElement: <RouteErrorPage fullPage />,
        children: [
          {
            path: "new-password",
            element: <RequireForcedPasswordChange />,
            children: [{ index: true, element: withSuspense(ChangePasswordPage) }],
          },
          {
            element: <RequirePasswordUpdated />,
            children: [
              {
                element: withSuspense(AdminLayout),
                children: [
                  {
                    errorElement: <RouteErrorPage />,
                    children: [
                      { index: true, element: withSuspense(DashboardPage) },
                      { path: "projects", element: withSuspense(ProjectListPage) },
                      { path: "projects/new", element: withSuspense(ProjectFormPage) },
                      { path: "projects/:id/edit", element: withSuspense(ProjectFormPage) },
                      { path: "settings", element: withSuspense(SettingsPage) },
                      { path: "links", element: withSuspense(LinksPage) },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        path: "*",
        element: <Navigate to={ROUTES.home} replace />,
      },
    ],
  },
]);
