import { type RouteObject, Navigate } from "react-router";
import { GuardiaRol } from "@maximilian/components/autenticacion/GuardiaRol";
import { CustomLimiteErrorRuta } from "@maximilian/components/common/CustomLimiteErrorRuta";
import { FUNCIONALIDADES_HABILITADAS } from "@maximilian/shared/constants/funcionalidades.constants";

export const rutasTraductor: RouteObject[] = [
  {
    path: "traductor",
    errorElement: <CustomLimiteErrorRuta />,
    lazy: () =>
      import("@maximilian/components/traductor/DisenoTraductor").then((m) => ({
        Component: () => (
          <GuardiaRol rolRequerido="TRADUCTOR">
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
          import("@maximilian/pages/Traductor/BandejaTraductor").then((m) => ({
            Component: m.default,
          })),
      },
      {
        path: "traduccion/:idPedido",
        lazy: () =>
          import("@maximilian/pages/Traductor/InvestigacionTraductor").then((m) => ({
            Component: m.default,
          })),
      },
      ...(FUNCIONALIDADES_HABILITADAS.migracionInformesCreador
        ? [
          {
            path: "migraciones",
            lazy: () =>
              import("@maximilian/pages/Traductor/MigracionesInformeTraductor").then((m) => ({
                Component: m.default,
              })),
          },
          {
            path: "migraciones/nueva",
            lazy: () =>
              import("@maximilian/pages/Traductor/InvestigacionTraductor").then((m) => ({
                Component: m.default,
              })),
          },
          {
            path: "migraciones/:idInformeMigracion",
            lazy: () =>
              import("@maximilian/pages/Traductor/InvestigacionTraductor").then((m) => ({
                Component: m.default,
              })),
          },
          ]
        : []),
    ],
  },
];
