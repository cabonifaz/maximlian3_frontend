import { type RouteObject, Navigate } from "react-router";
import { GuardiaRol } from "@maximilian/components/autenticacion/GuardiaRol";
import { CustomLimiteErrorRuta } from "@maximilian/components/common/CustomLimiteErrorRuta";
import {
  ID_ROL_GERENTE,
  NOMBRE_ROL_GERENTE,
} from "@maximilian/shared/constants/router/rutas-gerente.constants";

export const rutasGerente: RouteObject[] = [
  {
    path: "gerente",
    errorElement: <CustomLimiteErrorRuta />,
    lazy: () =>
      import("@maximilian/components/gerente/DisenoGerente").then((modulo) => ({
        Component: () => (
          <GuardiaRol
            rolRequerido={NOMBRE_ROL_GERENTE}
            idRolRequerido={ID_ROL_GERENTE}
          >
            <modulo.default />
          </GuardiaRol>
        ),
      })),
    children: [
      {
        index: true,
        element: <Navigate to="dashboard" replace />,
      },
      {
        path: "dashboard",
        lazy: () =>
          import("@maximilian/pages/Gerente/DashboardGerente").then((modulo) => ({
            Component: modulo.default,
          })),
      },
    ],
  },
];
