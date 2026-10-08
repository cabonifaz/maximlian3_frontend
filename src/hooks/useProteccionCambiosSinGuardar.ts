import { useEffect, useRef } from "react";
import { useBlocker } from "react-router";

export function useProteccionCambiosSinGuardar(contenidoActual: string, activo = true) {
  const contenidoGuardadoRef = useRef(contenidoActual);
  const bloqueo = useBlocker(() => activo && contenidoActual !== contenidoGuardadoRef.current);

  useEffect(() => {
    if (bloqueo.state !== "blocked") return;
    if (window.confirm("Tiene cambios sin guardar. ¿Desea salir y descartarlos?")) bloqueo.proceed();
    else bloqueo.reset();
  }, [bloqueo]);

  useEffect(() => {
    const advertirSalida = (evento: BeforeUnloadEvent) => {
      if (!activo || contenidoActual === contenidoGuardadoRef.current) return;
      evento.preventDefault();
    };
    window.addEventListener("beforeunload", advertirSalida);
    return () => window.removeEventListener("beforeunload", advertirSalida);
  }, [activo, contenidoActual]);

  return {
    marcarComoGuardado: () => {
      contenidoGuardadoRef.current = contenidoActual;
    },
  };
}
