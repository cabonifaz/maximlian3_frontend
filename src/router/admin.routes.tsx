import { type RouteObject, Navigate } from "react-router";

export const adminRoutes: RouteObject[] = [
  {
    path: "admin",
    lazy: () =>
      import("@maximilian/components/AdminLayout").then((m) => ({
        Component: m.default,
      })),
    children: [
      {
        index: true,
        element: <Navigate to="users" replace />,
      },
      {
        path: "users",
        lazy: () =>
          import("@maximilian/pages/Admin/UserManagement").then((m) => ({
            Component: m.default,
          })),
      },
      {
        path: "config",
        element: (
          <div className="p-8">
            <h1 className="text-2xl font-bold text-brand-black">
              Configuración
            </h1>
            <p className="mt-4 text-gray-600">Página en construcción...</p>
          </div>
        ),
      },
    ],
  },
];
