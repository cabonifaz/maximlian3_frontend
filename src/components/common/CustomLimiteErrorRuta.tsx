import { useEffect } from "react";
import { isRouteErrorResponse, useRouteError } from "react-router";
import PantallaCarga from "./PantallaCarga";
import { cerrarSesionExpirada, esErrorCargaDinamica } from "@maximilian/services/sesion.service";

export function CustomLimiteErrorRuta() {
  const error = useRouteError();

  useEffect(() => {
    if (esErrorCargaDinamica(error)) {
      void cerrarSesionExpirada();
    }
  }, [error]);

  if (esErrorCargaDinamica(error)) {
    return <PantallaCarga />;
  }

  const mensaje = isRouteErrorResponse(error)
    ? error.statusText
    : error instanceof Error
      ? error.message
      : "Ocurrió un error inesperado";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <h1 className="mb-3 text-3xl font-black text-brand-black">Error</h1>
      <p className="mb-8 max-w-md text-sm font-medium text-gray-500">{mensaje}</p>
      <button
        type="button"
        onClick={() => window.location.assign("/iniciar-sesion")}
        className="rounded-xl bg-brand-black px-6 py-3 text-sm font-bold text-brand-white shadow-lg transition-all hover:bg-brand-black/90"
      >
        Volver al login
      </button>
    </div>
  );
}
