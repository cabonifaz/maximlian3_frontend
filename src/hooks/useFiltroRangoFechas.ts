import { useState } from "react";

interface ParametrosUseFiltroRangoFechas {
  onCambio?: () => void;
}

export function useFiltroRangoFechas({
  onCambio,
}: ParametrosUseFiltroRangoFechas = {}) {
  const [fechaInicioFiltro, setFechaInicioFiltro] = useState<Date | undefined>();
  const [fechaFinFiltro, setFechaFinFiltro] = useState<Date | undefined>();

  const fechaInicioParametro = convertirDateAParametro(
    fechaInicioFiltro,
    "inicio",
  );
  const fechaFinParametro = convertirDateAParametro(fechaFinFiltro, "fin");
  const fechasInvalidas = esRangoFechaInvalido(
    fechaInicioFiltro,
    fechaFinFiltro,
  );

  const cambiarFechaInicioFiltro = (fecha: Date | undefined) => {
    setFechaInicioFiltro(fecha);
    onCambio?.();
  };

  const cambiarFechaFinFiltro = (fecha: Date | undefined) => {
    setFechaFinFiltro(fecha);
    onCambio?.();
  };

  const limpiarFechaInicioFiltro = () => {
    setFechaInicioFiltro(undefined);
    onCambio?.();
  };

  const limpiarFechaFinFiltro = () => {
    setFechaFinFiltro(undefined);
    onCambio?.();
  };

  return {
    cambiarFechaFinFiltro,
    cambiarFechaInicioFiltro,
    fechaFinFiltro,
    fechaFinParametro,
    fechaInicioFiltro,
    fechaInicioParametro,
    fechasInvalidas,
    limpiarFechaFinFiltro,
    limpiarFechaInicioFiltro,
  };
}

function convertirDateAParametro(
  fecha: Date | undefined,
  puntoDia: "inicio" | "fin",
) {
  if (!fecha) return undefined;

  const ano = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  const hora = puntoDia === "inicio" ? "00:00:00" : "23:59:59";

  return `${ano}-${mes}-${dia}T${hora}`;
}

function esRangoFechaInvalido(
  fechaInicio: Date | undefined,
  fechaFin: Date | undefined,
) {
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
