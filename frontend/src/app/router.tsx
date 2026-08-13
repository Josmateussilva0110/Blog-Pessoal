import { lazy, Suspense, type ComponentType } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { HomePage } from "@/routes/public/home/HomePage";
import { ProjectDetailPage } from "@/routes/public/project/ProjectDetailPage";

const LoginPage = lazy(() =>
  import("@/routes/admin/login/LoginPage").then((m) => ({
    default: m.LoginPage,
  })),
);
const DashboardPage = lazy(() =>
  import("@/routes/admin/dashboard/DashboardPage").then((m) => ({
    default: m.DashboardPage,
  })),
);
const ProjectListPage = lazy(() =>
  import("@/routes/admin/projects/ProjectListPage").then((m) => ({
    default: m.ProjectListPage,
  })),
);
const ProjectFormPage = lazy(() =>
  import("@/routes/admin/projects/ProjectFormPage").then((m) => ({
    default: m.ProjectFormPage,
  })),
);

function AdminFallback() {
  return (
    <div className="flex items-center justify-center p-20">
      <span className="font-mono text-sm text-text-muted animate-pulse">
        carregando...
      </span>
    </div>
  );
}

function withSuspense(Component: ComponentType) {
  return (
    <Suspense fallback={<AdminFallback />}>
      <Component />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "projetos/:slug", element: <ProjectDetailPage /> },
    ],
  },
  {
    path: "admin/login",
    element: withSuspense(LoginPage),
  },
  {
    path: "admin",
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: withSuspense(DashboardPage) },
          {
            path: "projetos",
            element: withSuspense(ProjectListPage),
          },
          {
            path: "projetos/novo",
            element: withSuspense(ProjectFormPage),
          },
          {
            path: "projetos/:id/editar",
            element: withSuspense(ProjectFormPage),
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
