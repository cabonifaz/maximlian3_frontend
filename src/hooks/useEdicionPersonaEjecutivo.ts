import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { servicioDirectorioEjecutivo } from "@maximilian/services/directorio-ejecutivo.service";
import type {
  RegistroDirectorioEjecutivoAnalista,
  RegistroPersonaDirectorioAnalista,
} from "@maximilian/shared/types/investigacion.type";

interface ParametrosUseEdicionPersonaEjecutivo {
  onActualizar: (registro: RegistroPersonaDirectorioAnalista) => void;
}

export function useEdicionPersonaEjecutivo({ onActualizar }: ParametrosUseEdicionPersonaEjecutivo) {
  const [registroEdicion, setRegistroEdicion] = useState<RegistroPersonaDirectorioAnalista | null>(null);

  const cargarRegistroMutation = useMutation({
    mutationFn: (idDirectorioEjecutivo: number) =>
      servicioDirectorioEjecutivo.obtener({ idDirectorioEjecutivo }),
    onSuccess: (registro) => {
      if (registro) setRegistroEdicion(registro);
    },
  });

  const abrirEdicion = (ejecutivo: RegistroDirectorioEjecutivoAnalista) => {
    if (!ejecutivo.idDirectorioEjecutivo || cargarRegistroMutation.isPending) return;
    cargarRegistroMutation.mutate(ejecutivo.idDirectorioEjecutivo);
  };

  const cerrarEdicion = () => setRegistroEdicion(null);

  const guardarEdicion = (registro: RegistroPersonaDirectorioAnalista) => {
    onActualizar(registro);
    cerrarEdicion();
  };

  return {
    abrirEdicion,
    cerrarEdicion,
    estaCargandoEdicion: cargarRegistroMutation.isPending,
    guardarEdicion,
    registroEdicion,
  };
}
