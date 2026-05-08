import { createBrowserRouter, Navigate } from "react-router";
import { rutasAdministrador } from "@maximilian/router/rutas-administrador";
import { rutasAnalista } from "@maximilian/router/rutas-analista";
import { rutasAutenticacion } from "@maximilian/router/rutas-autenticacion";
import { rutasCoordinador } from "@maximilian/router/rutas-coordinador";
import { CustomLimiteErrorRuta } from "@maximilian/components/common/CustomLimiteErrorRuta";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/iniciar-sesion" replace />,
    errorElement: <CustomLimiteErrorRuta />,
  },
  ...rutasAutenticacion,
  ...rutasAdministrador,
  ...rutasAnalista,
  ...rutasCoordinador,
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
]);
