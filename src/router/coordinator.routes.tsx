import { type RouteObject, Navigate } from "react-router";

export const coordinatorRoutes: RouteObject[] = [
  {
    path: "coordinator",
    lazy: () =>
      import("@maximilian/components/CoordinatorLayout").then((m) => ({
        Component: m.default,
      })),
    children: [
      {
        index: true,
        element: <Navigate to="clients" replace />,
      },
      {
        path: "clients",
        lazy: () =>
          import("@maximilian/pages/Coordinator/ClientManagement").then((m) => ({
            Component: m.default,
          })),
      },
      {
        path: "bank",
        element: (
          <div className="p-8">
            <h1 className="text-2xl font-bold text-brand-black">Banco de Información</h1>
            <p className="mt-4 text-gray-600">Página en construcción...</p>
          </div>
        ),
      },
      {
        path: "orders",
        element: (
          <div className="p-8">
            <h1 className="text-2xl font-bold text-brand-black">Pedidos</h1>
            <p className="mt-4 text-gray-600">Página en construcción...</p>
          </div>
        ),
      },
      {
        path: "assignments",
        element: (
          <div className="p-8">
            <h1 className="text-2xl font-bold text-brand-black">Asignaciones</h1>
            <p className="mt-4 text-gray-600">Página en construcción...</p>
          </div>
        ),
      },
      {
        path: "review",
        element: (
          <div className="p-8">
            <h1 className="text-2xl font-bold text-brand-black">Revisión y Aprobación</h1>
            <p className="mt-4 text-gray-600">Página en construcción...</p>
          </div>
        ),
      },
      {
        path: "billing",
        element: (
          <div className="p-8">
            <h1 className="text-2xl font-bold text-brand-black">Facturación</h1>
            <p className="mt-4 text-gray-600">Página en construcción...</p>
          </div>
        ),
      },
    ],
  },
];
