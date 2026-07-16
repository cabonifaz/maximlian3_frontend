import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { servicioTablaMaestra } from "@maximilian/services/tabla-maestra.service";
import { registroEjecutivoInvestigacionSchema } from "@maximilian/schemas/investigacion.schema";
import type {
  RegistroDirectorioEjecutivoAnalista,
  RegistroPersonaDirectorioAnalista,
} from "@maximilian/shared/types/investigacion.type";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import { traducirOpcionesTablaMaestra } from "@maximilian/shared/utils/tabla-maestra-idioma.util";

interface ParametrosUseModalRegistroEjecutivoInforme {
  estaAbierto: boolean;
  registroInicial?: RegistroDirectorioEjecutivoAnalista | null;
  personaSeleccionada?: RegistroPersonaDirectorioAnalista | null;
  requiereEjecutivoRegistrado?: boolean;
  idIdioma?: number;
  onGuardar: (registro: Omit<RegistroDirectorioEjecutivoAnalista, "id">) => void;
}

function limpiarTextoCargo(valor: string) {
  return valor.replace("...", "").trim();
}

function limpiarPorcentaje(valor?: string) {
  return (valor ?? "").replace("%", "").trim();
}

function obtenerIdCargo(opciones: { num1: number | null; string1: string | null }[] | undefined, valor: string) {
  const idCargo = opciones?.find(
    (opcion) => opcion.string1?.trim().toLowerCase() === valor.trim().toLowerCase(),
  )?.num1;
  return idCargo == null ? 0 : Number(idCargo);
}

export function useModalRegistroEjecutivoInforme({
  estaAbierto,
  registroInicial,
  personaSeleccionada,
  requiereEjecutivoRegistrado = false,
  idIdioma,
  onGuardar,
}: ParametrosUseModalRegistroEjecutivoInforme) {
  const ejecutivoDefecto = registroInicial?.nombreCompleto ?? personaSeleccionada?.nombres ?? "";
  const tipoPersonaDefecto = registroInicial?.tipoPersona ?? personaSeleccionada?.tipoPersona ?? "Natural";
  const paisDefecto = registroInicial?.pais ?? personaSeleccionada?.pais ?? "";
  const cargoDefecto = registroInicial?.idCargo ? "" : limpiarTextoCargo(registroInicial?.cargo ?? "");
  const [vinculadoDesde, setVinculadoDesde] = useState(registroInicial?.vinculadoDesde ?? "");
  const [cargo, setCargo] = useState(cargoDefecto);
  const [porcentajeParticipacion, setPorcentajeParticipacion] = useState(
    limpiarPorcentaje(registroInicial?.porcentaje),
  );

  const { data: opcionesCargoBase } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.CARGO_DIRECTORIO],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.CARGO_DIRECTORIO),
    enabled: estaAbierto,
    staleTime: Infinity,
  });

  const opcionesCargo = useMemo(
    () => traducirOpcionesTablaMaestra(opcionesCargoBase, idIdioma),
    [idIdioma, opcionesCargoBase],
  );
  const cargoMaestroRegistro = opcionesCargo
    ?.find((opcion) => Number(opcion.num1) === Number(registroInicial?.idCargo))
    ?.string1
    ?.trim() ?? "";
  const cargoActual = cargo || cargoMaestroRegistro || cargoDefecto;
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
    const idCargo = obtenerIdCargo(opcionesCargo, cargoActual) || registroInicial?.idCargo || 0;

    onGuardar({
      idDirectorioEjecutivo,
      ejecutivo: ejecutivo.length > 13 ? `${ejecutivo.slice(0, 13)}...` : ejecutivo,
      idCargo,
      cargo: cargoActual,
      porcentaje: datosFormulario.porcentaje,
      lista: datosFormulario.imprimirListado === "si",
      detalleEjecutivo: datosFormulario.imprimirDetalle === "si",
      orden: registroInicial?.orden ?? "1",
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
    opcionesCargo,
    tieneEjecutivoRegistrado,
    manejarEnvio,
  };
}
