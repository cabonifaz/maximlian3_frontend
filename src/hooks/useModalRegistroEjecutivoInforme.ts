import { useState } from "react";
import { registroEjecutivoInvestigacionSchema } from "@maximilian/schemas/investigacion.schema";
import type {
  RegistroDirectorioEjecutivoAnalista,
  RegistroPersonaDirectorioAnalista,
} from "@maximilian/shared/types/investigacion.type";

interface ParametrosUseModalRegistroEjecutivoInforme {
  estaAbierto: boolean;
  registroInicial?: RegistroDirectorioEjecutivoAnalista | null;
  personaSeleccionada?: RegistroPersonaDirectorioAnalista | null;
  requiereEjecutivoRegistrado?: boolean;
  onGuardar: (registro: Omit<RegistroDirectorioEjecutivoAnalista, "id">) => void;
}

function limpiarPorcentaje(valor?: string) {
  return (valor ?? "").replace("%", "").trim();
}

export function useModalRegistroEjecutivoInforme({
  estaAbierto: _estaAbierto,
  registroInicial,
  personaSeleccionada,
  requiereEjecutivoRegistrado = false,
  onGuardar,
}: ParametrosUseModalRegistroEjecutivoInforme) {
  const ejecutivoDefecto = registroInicial?.nombreCompleto ?? personaSeleccionada?.nombres ?? "";
  const tipoPersonaDefecto = registroInicial?.tipoPersona ?? personaSeleccionada?.tipoPersona ?? "Natural";
  const paisDefecto = registroInicial?.pais ?? personaSeleccionada?.pais ?? "";
  const cargoDefecto = registroInicial?.cargo ?? "";
  const [vinculadoDesde, setVinculadoDesde] = useState(registroInicial?.vinculadoDesde ?? "");
  const [cargo, setCargo] = useState(cargoDefecto);
  const [porcentajeParticipacion, setPorcentajeParticipacion] = useState(
    limpiarPorcentaje(registroInicial?.porcentaje),
  );

  const cargoActual = cargo.trim();
  const idDirectorioEjecutivo = registroInicial?.idDirectorioEjecutivo
    ?? personaSeleccionada?.idDirectorioEjecutivo
    ?? personaSeleccionada?.id;
  const tieneEjecutivoRegistrado = Number(idDirectorioEjecutivo) > 0;

  const manejarEnvio = (formData: FormData) => {
    if (requiereEjecutivoRegistrado && !tieneEjecutivoRegistrado) return;

    const resultado = registroEjecutivoInvestigacionSchema.safeParse(
      Object.fromEntries(formData.entries()),
    );
    if (!resultado.success) return;

    const datosFormulario = resultado.data;
    const ejecutivo = datosFormulario.ejecutivo;

    onGuardar({
      idDirectorioEjecutivo,
      ejecutivo: ejecutivo.length > 13 ? `${ejecutivo.slice(0, 13)}...` : ejecutivo,
      idCargo: 0,
      cargo: cargoActual,
      porcentaje: datosFormulario.porcentaje,
      lista: datosFormulario.imprimirListado === "si",
      detalleEjecutivo: datosFormulario.imprimirDetalle === "si",
      orden: datosFormulario.orden,
      vinculadoDesde: datosFormulario.vinculadoDesde,
      companiaAnterior: datosFormulario.companiaAnterior,
      esParteDirectorio: datosFormulario.esParteDirectorio === "si",
      pais: paisDefecto,
      tipoPersona: tipoPersonaDefecto,
      descripcionBusqueda: ejecutivo,
      nombreCompleto: ejecutivo,
    });
  };

  return {
    ejecutivoDefecto,
    vinculadoDesde,
    setVinculadoDesde,
    cargoActual,
    setCargo,
    porcentajeParticipacion,
    setPorcentajeParticipacion,
    tieneEjecutivoRegistrado,
    manejarEnvio,
  };
}
