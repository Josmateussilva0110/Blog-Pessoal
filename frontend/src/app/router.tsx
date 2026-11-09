import { lazy, Suspense, type ComponentType, type ReactNode } from "react";
import { createBrowserRouter, Navigate, Outlet, useParams } from "react-router-dom";
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
import { ProjectDetailSkeleton } from "@/features/projects/components/ProjectDetailSkeleton";
import { ProjectUpdateSkeleton } from "@/features/projects/components/ProjectUpdateSkeleton";
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

/**
 * Enquanto o código da página baixa, esqueleto igual ao da busca dos dados: quem abre o
 * link direto não vê um "Carregando…" antes dele
 */
function ProjectDetailFallback() {
  const { slug = "" } = useParams();
  return <ProjectDetailSkeleton slug={slug} />;
}

function withSuspense(Component: ComponentType, fallback: ReactNode = <FullPageStatus />) {
  return (
    <Suspense fallback={fallback}>
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
              {
                path: "projects/:slug",
                element: withSuspense(ProjectDetailPageLazy, <ProjectDetailFallback />),
              },
              {
                path: "projects/:slug/updates/:updateId",
                element: withSuspense(ProjectUpdatePage, <ProjectUpdateSkeleton />),
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
