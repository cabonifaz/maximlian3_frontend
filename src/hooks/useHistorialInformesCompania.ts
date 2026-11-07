import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { informeService } from "@maximilian/services/informe.service";
import type { CompaniaNoticiaDetalleListaItem } from "@maximilian/shared/types/compania-noticia-detalle.type";
import type { InformeHistorialCompania } from "@maximilian/shared/types/informe.type";
import { crearDatosInvestigacionVacios } from "@maximilian/shared/utils/investigacion.util";

export function useHistorialInformesCompania(empresa: CompaniaNoticiaDetalleListaItem | null) {
  const [paginaActual, setPaginaActual] = useState(1);
  const [informeVistaPrevia, setInformeVistaPrevia] =
    useState<InformeHistorialCompania | null>(null);
  const [fechaInicioFiltro, setFechaInicioFiltro] = useState<Date | undefined>();
  const [fechaFinFiltro, setFechaFinFiltro] = useState<Date | undefined>();

  const estaAbierto = Boolean(empresa);
  const idCompania = empresa?.idCompania ?? 0;
  const fechaInicioParametro = convertirDateAParametro(fechaInicioFiltro, "inicio");
  const fechaFinParametro = convertirDateAParametro(fechaFinFiltro, "fin");
  const fechasInvalidas = esRangoFechaInvalido(fechaInicioFiltro, fechaFinFiltro);
  const datosInvestigacionVacios = useMemo(
    () => crearDatosInvestigacionVacios(),
    [],
  );

  const {
    data: respuestaHistorial,
    isLoading: estaCargandoHistorial,
    isError: hayErrorHistorial,
    refetch: recargarHistorial,
  } = useQuery({
    queryKey: [
      "historialInformesCompania",
      idCompania,
      paginaActual,
      fechaInicioParametro,
      fechaFinParametro,
    ],
    queryFn: () =>
      informeService.listarHistorialPorCompania({
        idCompania,
        numPag: paginaActual,
        fechaInicio: fechaInicioParametro,
        fechaFin: fechaFinParametro,
      }),
    enabled: estaAbierto && idCompania > 0 && !fechasInvalidas,
  });

  const cambiarFechaInicioFiltro = (fecha: Date | undefined) => {
    setFechaInicioFiltro(fecha);
    setPaginaActual(1);
  };

  const cambiarFechaFinFiltro = (fecha: Date | undefined) => {
    setFechaFinFiltro(fecha);
    setPaginaActual(1);
  };

  const limpiarFechaInicioFiltro = () => {
    setFechaInicioFiltro(undefined);
    setPaginaActual(1);
  };

  const limpiarFechaFinFiltro = () => {
    setFechaFinFiltro(undefined);
    setPaginaActual(1);
  };

  return {
    paginaActual,
    setPaginaActual,
    informeVistaPrevia,
    setInformeVistaPrevia,
    fechaInicioFiltro,
    fechaFinFiltro,
    fechasInvalidas,
    datosInvestigacionVacios,
    respuestaHistorial,
    estaCargandoHistorial,
    hayErrorHistorial,
    recargarHistorial,
    informes: respuestaHistorial?.lstInformes ?? [],
    cambiarFechaInicioFiltro,
    cambiarFechaFinFiltro,
    limpiarFechaInicioFiltro,
    limpiarFechaFinFiltro,
  };
}

function convertirDateAParametro(fecha: Date | undefined, puntoDia: "inicio" | "fin") {
  if (!fecha) return undefined;

  const ano = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  const hora = puntoDia === "inicio" ? "00:00:00" : "23:59:59";

  return `${ano}-${mes}-${dia}T${hora}`;
}

function esRangoFechaInvalido(fechaInicio: Date | undefined, fechaFin: Date | undefined) {
  if (!fechaInicio || !fechaFin) return false;

  return obtenerTiempoFecha(fechaInicio) > obtenerTiempoFecha(fechaFin);
}

function obtenerTiempoFecha(fecha: Date) {
  return new Date(
    fecha.getFullYear(),
    fecha.getMonth(),
    fecha.getDate(),
  ).getTime();
}
