import { createBrowserRouter, Navigate, Outlet } from "react-router";
import { rutasAdministrador } from "@maximilian/router/rutas-administrador";
import { rutasAnalista } from "@maximilian/router/rutas-analista";
import { rutasAutenticacion } from "@maximilian/router/rutas-autenticacion";
import { rutasCoordinador } from "@maximilian/router/rutas-coordinador";
import { rutasTraductor } from "@maximilian/router/rutas-traductor";
import { rutasGerente } from "@maximilian/router/rutas-gerente";
import { CustomLimiteErrorRuta } from "@maximilian/components/common/CustomLimiteErrorRuta";
import PantallaCarga from "@maximilian/components/common/PantallaCarga";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Outlet />,
    errorElement: <CustomLimiteErrorRuta />,
    hydrateFallbackElement: <PantallaCarga />,
    children: [
      {
        index: true,
        element: <Navigate to="/iniciar-sesion" replace />,
      },
      ...rutasAutenticacion,
      ...rutasAdministrador,
      ...rutasAnalista,
      ...rutasCoordinador,
      ...rutasTraductor,
      ...rutasGerente,
      {
        path: "*",
        element: (
          <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
            <h1 className="text-6xl font-black text-brand-black mb-4">404</h1>
            <p className="text-gray-500 font-medium mb-8 text-xl">Página no encontrada</p>
            <button
              onClick={() => {
                window.location.href = "/iniciar-sesion";
              }}
              className="px-8 py-3 bg-brand-black text-brand-white rounded-xl font-bold hover:bg-brand-black/90 transition-all shadow-lg"
            >
              Volver al Inicio
            </button>
          </div>
        ),
      },
    ],
  },
]);
