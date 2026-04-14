import { type RouteObject, Navigate } from "react-router";

export const coordinatorRoutes: RouteObject[] = [
  {
    path: "coordinator",
    lazy: () =>
      import("@maximilian/components/coordinator/CoordinatorLayout").then((m) => ({
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
        lazy: () =>
          import("@maximilian/pages/Coordinator/PedidoManagement").then((m) => ({
            Component: m.default,
          })),
      },
      {
        path: "assignments",
        lazy: () =>
          import("@maximilian/pages/Coordinator/AssignmentManagement").then((m) => ({
            Component: m.default,
          })),
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
