import { createBrowserRouter, Navigate } from "react-router";
import { adminRoutes } from "@maximilian/router/admin.routes";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/admin" replace />,
  },
  ...adminRoutes,
  {
    path: "*",
    element: (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-4xl font-bold text-brand-black">404</h1>
        <p className="text-gray-600">Página no encontrada</p>
      </div>
    ),
  },
]);
