import { type RouteObject, Navigate } from "react-router";
import { GuardiaRol } from "@maximilian/components/autenticacion/GuardiaRol";
import { CustomLimiteErrorRuta } from "@maximilian/components/common/CustomLimiteErrorRuta";

export const rutasAnalista: RouteObject[] = [
  {
    path: "analista",
    errorElement: <CustomLimiteErrorRuta />,
    lazy: () =>
      import("@maximilian/components/analista/DisenoAnalista").then((m) => ({
        Component: () => (
          <GuardiaRol rolRequerido="ANALISTA">
            <m.default />
          </GuardiaRol>
        ),
      })),
    children: [
      {
        index: true,
        element: <Navigate to="bandeja" replace />,
      },
      {
        path: "bandeja",
        lazy: () =>
          import("@maximilian/pages/Analista/BandejaAnalista").then((m) => ({
            Component: m.default,
          })),
      },
      {
        path: "investigacion/:idPedido",
        lazy: () =>
          import("@maximilian/pages/Analista/InvestigacionAnalista").then((m) => ({
            Component: m.default,
          })),
      },
      {
        path: "banco-informacion",
        lazy: () =>
          import("@maximilian/pages/Analista/BancoInformacionAnalista").then((m) => ({
            Component: m.default,
          })),
      },
    ],
  },
];
