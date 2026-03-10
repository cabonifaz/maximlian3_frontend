import { type RouteObject, Navigate } from "react-router";
import AdminLayout from "@maximilian/components/AdminLayout";
import UserManagement from "@maximilian/pages/Admin/UserManagement";

export const adminRoutes: RouteObject[] = [
  {
    path: "admin",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="users" replace />,
      },
      {
        path: "users",
        element: <UserManagement />,
      },
      {
        path: "config",
        element: (
          <div className="p-8">
            <h1 className="text-2xl font-bold text-brand-black">
              Configuración
            </h1>
            <p className="mt-4 text-gray-600">
              Página en construcción...
            </p>
          </div>
        ),
      },
    ],
  },
];
