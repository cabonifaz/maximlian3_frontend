import { type RouteObject } from "react-router";
import { GuardiaAutenticacion } from "@maximilian/components/autenticacion/GuardiaAutenticacion";
import { GuardiaInvitado } from "@maximilian/components/autenticacion/GuardiaInvitado";
import { CustomLimiteErrorRuta } from "@maximilian/components/common/CustomLimiteErrorRuta";

export const rutasAutenticacion: RouteObject[] = [
  {
    errorElement: <CustomLimiteErrorRuta />,
    children: [
      {
        path: "iniciar-sesion",
        lazy: () =>
          import("@maximilian/pages/Autenticacion/PaginaInicioSesion").then((m) => ({
            Component: () => (
              <GuardiaInvitado>
                <m.default />
              </GuardiaInvitado>
            ),
          })),
      },
      {
        path: "olvide-contrasena",
        lazy: () =>
          import("@maximilian/pages/Autenticacion/PaginaOlvideContrasena").then((m) => ({
            Component: () => (
              <GuardiaInvitado>
                <m.default />
              </GuardiaInvitado>
            ),
          })),
      },
      {
        path: "seleccionar-rol",
        lazy: () =>
          import("@maximilian/pages/Autenticacion/PaginaSeleccionRol").then((m) => ({
            Component: () => (
              <GuardiaAutenticacion>
                <m.default />
              </GuardiaAutenticacion>
            ),
          })),
      },
    ],
  },
];
