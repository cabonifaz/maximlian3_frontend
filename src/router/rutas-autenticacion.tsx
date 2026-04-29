import { type RouteObject } from "react-router";
import { GuardiaInvitado } from "@maximilian/components/autenticacion/GuardiaInvitado";

export const rutasAutenticacion: RouteObject[] = [
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
        Component: m.default,
      })),
  },
];
