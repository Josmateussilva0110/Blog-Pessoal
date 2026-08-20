import { lazy, Suspense, type ComponentType } from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { DocumentMeta } from "@/components/layout/DocumentMeta";
import { ToastScope } from "@/components/ui/toast";
import { AuthScope } from "@/features/auth/components/AuthScope";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { GuestRoute } from "@/features/auth/components/GuestRoute";
import { RequirePasswordUpdated } from "@/features/auth/components/RequirePasswordUpdated";
import { RequireForcedPasswordChange } from "@/features/auth/components/RequireForcedPasswordChange";
import { HomePage } from "@/routes/public/home/HomePage";

const ProjectDetailPage = lazy(() =>
  import("@/routes/public/project/ProjectDetailPage").then((module) => ({
    default: module.ProjectDetailPage,
  })),
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

function AdminFallback() {
  return (
    <div className="admin-shell flex min-h-dvh items-center justify-center grid-bg">
      <span className="font-mono text-sm text-text-subtle animate-pulse">
        <span className="text-terminal">$ </span>
        loading...
      </span>
    </div>
  );
}

function PublicFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <span className="font-mono text-sm text-text-subtle animate-pulse">
        <span className="text-terminal">$ </span>
        loading...
      </span>
    </div>
  );
}

function withSuspense(Component: ComponentType, fallback: "admin" | "public" = "admin") {
  const Fallback = fallback === "public" ? PublicFallback : AdminFallback;

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
    children: [
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "projects/:slug", element: withSuspense(ProjectDetailPage, "public") },
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
              {
                path: "links",
                element: withSuspense(LinksPage),
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
    ],
  },
]);
