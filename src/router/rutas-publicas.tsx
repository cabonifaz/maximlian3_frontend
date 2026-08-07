import { type RouteObject } from "react-router";
import { CustomLimiteErrorRuta } from "@maximilian/components/common/CustomLimiteErrorRuta";

export const rutasPublicas: RouteObject[] = [
  {
    errorElement: <CustomLimiteErrorRuta />,
    children: [
      {
        path: "factura/:token",
        lazy: () =>
          import("@maximilian/pages/Publico/PaginaVerificacionFactura").then((m) => ({
            Component: m.default,
          })),
      },
    ],
  },
];
