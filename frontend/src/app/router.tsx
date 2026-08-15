import { lazy, Suspense, type ComponentType } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { GuestRoute } from "@/features/auth/components/GuestRoute";
import { RequirePasswordUpdated } from "@/features/auth/components/RequirePasswordUpdated";
import { RequireForcedPasswordChange } from "@/features/auth/components/RequireForcedPasswordChange";
import { HomePage } from "@/routes/public/home/HomePage";
import { ProjectDetailPage } from "@/routes/public/project/ProjectDetailPage";

const LoginPage = lazy(() =>
  import("@/routes/admin/login/LoginPage").then((m) => ({
    default: m.LoginPage,
  })),
);
const ChangePasswordPage = lazy(() =>
  import("@/routes/admin/change-password/ChangePasswordPage").then((m) => ({
    default: m.ChangePasswordPage,
  })),
);
const SettingsPage = lazy(() =>
  import("@/routes/admin/settings/SettingsPage").then((m) => ({
    default: m.SettingsPage,
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
      <span className="text-sm text-text-muted animate-pulse">
        Carregando...
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
      { path: "projects/:slug", element: <ProjectDetailPage /> },
    ],
  },
  {
    element: <GuestRoute />,
    children: [
      {
        path: "admin/login",
        element: withSuspense(LoginPage),
      },
    ],
  },
  {
    path: "admin",
    element: <ProtectedRoute />,
    children: [
      {
        path: "new-password",
        element: <RequireForcedPasswordChange />,
        children: [
          {
            index: true,
            element: withSuspense(ChangePasswordPage),
          },
        ],
      },
      {
        element: <RequirePasswordUpdated />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { index: true, element: withSuspense(DashboardPage) },
              {
                path: "projects",
                element: withSuspense(ProjectListPage),
              },
              {
                path: "projects/new",
                element: withSuspense(ProjectFormPage),
              },
              {
                path: "projects/:id/edit",
                element: withSuspense(ProjectFormPage),
              },
              {
                path: "settings",
                element: withSuspense(SettingsPage),
              },
            ],
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
