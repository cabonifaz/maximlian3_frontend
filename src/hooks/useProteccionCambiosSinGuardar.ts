import { useEffect, useState } from "react";
import { useBlocker } from "react-router";
import {
  confirmarSalidaConCambios,
  estaDescarteCambiosConfirmado,
  registrarCambiosPendientes,
  reiniciarProteccionCambios,
} from "@maximilian/shared/utils/proteccion-cambios.util";

export function useProteccionCambiosSinGuardar(contenidoActual: string, activo = true) {
  const [lineaBase, setLineaBase] = useState(contenidoActual);
  const [huboInteraccion, setHuboInteraccion] = useState(false);

  // Hasta que el usuario interactúe, lo que cambia viene de la carga o el autocompletado de la página: es la línea base.
  if (!huboInteraccion && contenidoActual !== lineaBase) setLineaBase(contenidoActual);

  useEffect(() => {
    const registrarInteraccion = () => setHuboInteraccion(true);
    window.addEventListener("pointerdown", registrarInteraccion, true);
    window.addEventListener("keydown", registrarInteraccion, true);
    return () => {
      window.removeEventListener("pointerdown", registrarInteraccion, true);
      window.removeEventListener("keydown", registrarInteraccion, true);
    };
  }, []);

  const tieneCambios = activo && huboInteraccion && contenidoActual !== lineaBase;
  const bloqueo = useBlocker(() => !estaDescarteCambiosConfirmado() && tieneCambios);

  useEffect(() => {
    registrarCambiosPendientes(tieneCambios);
    return () => reiniciarProteccionCambios();
  }, [tieneCambios]);

  useEffect(() => {
    if (bloqueo.state !== "blocked") return;
    void confirmarSalidaConCambios().then((puedeSalir) => {
      if (puedeSalir) bloqueo.proceed();
      else bloqueo.reset();
    });
  }, [bloqueo]);

  useEffect(() => {
    const advertirSalida = (evento: BeforeUnloadEvent) => {
      if (!tieneCambios || estaDescarteCambiosConfirmado()) return;
      evento.preventDefault();
    };
    const interceptarRecarga = (evento: KeyboardEvent) => {
      const esRecarga = evento.key === "F5"
        || ((evento.ctrlKey || evento.metaKey) && evento.key.toLowerCase() === "r");
      if (!esRecarga || !tieneCambios || estaDescarteCambiosConfirmado()) return;

      evento.preventDefault();
      void confirmarSalidaConCambios().then((puedeSalir) => {
        if (puedeSalir) window.location.reload();
      });
    };
    window.addEventListener("beforeunload", advertirSalida);
    window.addEventListener("keydown", interceptarRecarga);
    return () => {
      window.removeEventListener("beforeunload", advertirSalida);
      window.removeEventListener("keydown", interceptarRecarga);
    };
  }, [tieneCambios]);

  return {
    marcarComoGuardado: () => {
      setHuboInteraccion(false);
      setLineaBase(contenidoActual);
    },
  };
}
