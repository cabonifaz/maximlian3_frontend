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
        element: (
          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-brand-black">Banco de Información</h1>
            <p className="mt-3 text-sm text-gray-500">Página en construcción...</p>
          </div>
        ),
      },
    ],
  },
];
