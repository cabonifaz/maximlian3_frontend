import { type RouteObject, Navigate } from "react-router";
import { GuardiaRol } from "@maximilian/components/autenticacion/GuardiaRol";
import { CustomLimiteErrorRuta } from "@maximilian/components/common/CustomLimiteErrorRuta";

export const rutasAdministrador: RouteObject[] = [
  {
    path: "administrador",
    errorElement: <CustomLimiteErrorRuta />,
    lazy: () =>
      import("@maximilian/components/administrador/DisenoAdministrador").then((m) => ({
        Component: () => (
          <GuardiaRol rolRequerido="ADMINISTRADOR">
            <m.default />
          </GuardiaRol>
        ),
      })),
    children: [
      {
        index: true,
        element: <Navigate to="usuarios" replace />,
      },
      {
        path: "usuarios",
        lazy: () =>
          import("@maximilian/pages/Administrador/GestionUsuarios").then((m) => ({
            Component: m.default,
          })),
      },
      {
        path: "configuracion",
        lazy: () =>
          import("@maximilian/pages/Administrador/ConfiguracionParametros").then((m) => ({
            Component: m.default,
          })),
      },
    ],
  },
];
