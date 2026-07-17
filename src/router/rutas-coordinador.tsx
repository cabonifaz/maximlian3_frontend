import { type RouteObject, Navigate } from "react-router";
import { GuardiaRol } from "@maximilian/components/autenticacion/GuardiaRol";
import { CustomLimiteErrorRuta } from "@maximilian/components/common/CustomLimiteErrorRuta";

export const rutasCoordinador: RouteObject[] = [
  {
    path: "coordinador",
    errorElement: <CustomLimiteErrorRuta />,
    lazy: () =>
      import("@maximilian/components/coordinador/DisenoCoordinador").then((m) => ({
        Component: () => (
          <GuardiaRol rolRequerido="COORDINADOR">
            <m.default />
          </GuardiaRol>
        ),
      })),
    children: [
      {
        index: true,
        element: <Navigate to="clientes" replace />,
      },
      {
        path: "clientes",
        lazy: () =>
          import("@maximilian/pages/Coordinador/GestionClientes").then((m) => ({
            Component: m.default,
          })),
      },
      {
        path: "banco-informacion",
        lazy: () =>
          import("@maximilian/pages/Coordinador/BancoInformacionCoordinador").then((m) => ({
            Component: m.default,
          })),
      },
      {
        path: "pedidos",
        lazy: () =>
          import("@maximilian/pages/Coordinador/GestionPedidos").then((m) => ({
            Component: m.default,
          })),
      },
      {
        path: "asignaciones",
        lazy: () =>
          import("@maximilian/pages/Coordinador/GestionAsignaciones").then((m) => ({
            Component: m.default,
          })),
      },
      {
        path: "revision",
        lazy: () =>
          import("@maximilian/pages/Coordinador/GestionRevisionAprobacion").then((m) => ({
            Component: m.default,
          })),
      },
      {
        path: "revision/:idPedido",
        lazy: () =>
          import("@maximilian/pages/Coordinador/RevisionInformeCoordinador").then((m) => ({
            Component: m.default,
          })),
      },
      {
        path: "facturacion",
        lazy: () =>
          import("@maximilian/pages/Coordinador/GestionFacturacion").then((m) => ({
            Component: m.default,
          })),
      },
    ],
  },
];
