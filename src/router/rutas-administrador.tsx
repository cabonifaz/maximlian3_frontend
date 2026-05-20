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
        element: (
          <div className="p-8">
            <h1 className="text-2xl font-bold text-brand-black">
              Configuración
            </h1>
            <p className="mt-4 text-gray-600">Página en construcción...</p>
          </div>
        ),
      },
    ],
  },
];
