import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { servicioTablaMaestra } from "@maximilian/services/tabla-maestra.service";
import type { RegistroBalanceAnalista } from "@maximilian/shared/types/investigacion.type";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import { formatearFechaIsoADdMmYyyy } from "@maximilian/shared/utils/fecha.util";
import { traducirOpcionesTablaMaestra } from "@maximilian/shared/utils/tabla-maestra-idioma.util";

type RegistroBalanceGuardado = Omit<
  RegistroBalanceAnalista,
  "codigo" | "periodo" | "balanceGeneral" | "perdidaGanancia" | "cuentas" | "detalleCuentas"
>;

interface ParametrosUseModalBalanceInforme {
  idIdioma?: number;
  registroInicial?: RegistroBalanceAnalista | null;
  onGuardar: (registro: RegistroBalanceGuardado) => void;
}

function formatearFecha(fecha: string) {
  return formatearFechaIsoADdMmYyyy(fecha, "");
}

function compararFechasDdMmYyyy(a: string, b: string): number {
  const partes = (fecha: string) => fecha.split("/").map(Number);
  const [diaA, mesA, anoA] = partes(a);
  const [diaB, mesB, anoB] = partes(b);
  if (!diaA || !mesA || !anoA || !diaB || !mesB || !anoB) return 0;
  return new Date(anoA, mesA - 1, diaA).getTime() - new Date(anoB, mesB - 1, diaB).getTime();
}

export function obtenerIdSeleccion(
  opciones: { num1: number | null; string1: string | null }[] | undefined,
  valor?: string,
) {
  const texto = valor?.trim() ?? "";
  if (!texto) return undefined;

  const numero = Number.parseInt(texto, 10);
  if (Number.isFinite(numero) && numero > 0) return numero;

  return (
    opciones?.find(
      (opcion) => opcion.string1?.trim().toLowerCase() === texto.toLowerCase(),
    )?.num1 ?? undefined
  );
}

export function useModalBalanceInforme({
  idIdioma,
  registroInicial,
  onGuardar,
}: ParametrosUseModalBalanceInforme) {
  const [fechaInicio, setFechaInicio] = useState(
    formatearFecha(registroInicial?.fechaInicio ?? registroInicial?.fecha ?? ""),
  );
  const [fechaFin, setFechaFin] = useState(
    formatearFecha(registroInicial?.fechaFin ?? ""),
  );
  const [esActual, setEsActual] = useState(registroInicial?.esActual ?? false);
  const [tipoCambio, setTipoCambio] = useState(registroInicial?.tipoCambio ?? "");
  const [operacionCambio, setOperacionCambio] = useState(
    registroInicial?.operacionCambio ?? "",
  );
  const [tipoBalance, setTipoBalance] = useState(
    registroInicial?.tipoBalance ?? "Balance General",
  );
  const [tipoEstadoFinanciero, setTipoEstadoFinanciero] = useState(
    registroInicial?.tipoEstadoFinanciero ?? registroInicial?.tipo ?? "",
  );
  const [errorFechas, setErrorFechas] = useState("");

  const hoy = new Date();
  const fechaActual = `${String(hoy.getDate()).padStart(2, "0")}/${String(
    hoy.getMonth() + 1,
  ).padStart(2, "0")}/${hoy.getFullYear()}`;

  const { data: opcionesMonedaBase } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.MONEDA],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.MONEDA),
    staleTime: Infinity,
  });
  const { data: opcionesTipoBalanceBase } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.TIPO_BALANCE],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.TIPO_BALANCE),
    staleTime: Infinity,
  });
  const { data: opcionesEstadoFinancieroBase } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.ESTADO_FINANCIERO],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.ESTADO_FINANCIERO),
    staleTime: Infinity,
  });

  const opcionesMoneda = useMemo(
    () => traducirOpcionesTablaMaestra(opcionesMonedaBase, idIdioma),
    [idIdioma, opcionesMonedaBase],
  );
  const opcionesTipoBalance = useMemo(
    () => traducirOpcionesTablaMaestra(opcionesTipoBalanceBase, idIdioma),
    [idIdioma, opcionesTipoBalanceBase],
  );
  const opcionesEstadoFinanciero = useMemo(
    () => traducirOpcionesTablaMaestra(opcionesEstadoFinancieroBase, idIdioma),
    [idIdioma, opcionesEstadoFinancieroBase],
  );

  const cambiarFechaInicio = (nuevoValor: string) => {
    setFechaInicio(nuevoValor);

    if (nuevoValor && fechaFin && compararFechasDdMmYyyy(nuevoValor, fechaFin) > 0) {
      setErrorFechas("La fecha de inicio no puede ser mayor a la fecha de fin.");
      return;
    }

    if (nuevoValor && fechaActual && compararFechasDdMmYyyy(nuevoValor, fechaActual) > 0) {
      setErrorFechas("La fecha de inicio no puede ser mayor a la fecha actual.");
      return;
    }

    setErrorFechas("");
  };

  const cambiarFechaFin = (nuevoValor: string) => {
    setFechaFin(nuevoValor);

    if (fechaInicio && nuevoValor && compararFechasDdMmYyyy(nuevoValor, fechaInicio) < 0) {
      setErrorFechas("La fecha de fin no puede ser menor a la fecha de inicio.");
      return;
    }

    setErrorFechas("");
  };

  const cambiarEsActual = (estaSeleccionado: boolean) => {
    setEsActual(estaSeleccionado);
    setErrorFechas("");
    if (estaSeleccionado) {
      setFechaFin("");
    }
  };

  const manejarGuardar = () => {
    const idTipoBalance =
      obtenerIdSeleccion(opcionesTipoBalance, tipoBalance) ??
      registroInicial?.idTipoBalance;
    const idTipoEstadoFinanciero =
      obtenerIdSeleccion(opcionesEstadoFinanciero, tipoEstadoFinanciero) ??
      registroInicial?.idTipoEstadoFinanciero;
    const idMoneda =
      obtenerIdSeleccion(opcionesMoneda, operacionCambio) ??
      registroInicial?.idMoneda;
    const tipoBalanceSeleccionado =
      opcionesTipoBalance
        ?.find((opcion) => opcion.num1 === idTipoBalance)
        ?.string1?.trim() || tipoBalance.trim();

    if (fechaInicio && fechaActual && compararFechasDdMmYyyy(fechaInicio, fechaActual) > 0) {
      setErrorFechas("La fecha de inicio no puede ser mayor a la fecha actual.");
      return;
    }

    if (fechaInicio && fechaFin && !esActual && compararFechasDdMmYyyy(fechaInicio, fechaFin) > 0) {
      setErrorFechas("La fecha de inicio no puede ser mayor a la fecha de fin.");
      return;
    }

    setErrorFechas("");
    onGuardar({
      fecha: esActual
        ? `${formatearFecha(fechaInicio)} - Actualidad`
        : `${formatearFecha(fechaInicio)} - ${formatearFecha(fechaFin)}`,
      fechaInicio: formatearFecha(fechaInicio),
      fechaFin: esActual ? "" : formatearFecha(fechaFin),
      esActual,
      tipo: tipoEstadoFinanciero.trim(),
      idTipoEstadoFinanciero,
      tipoEstadoFinanciero: tipoEstadoFinanciero.trim(),
      tipoCambio: tipoCambio.trim(),
      idMoneda,
      operacionCambio: operacionCambio.trim(),
      idTipoBalance,
      tipoBalance: tipoBalanceSeleccionado,
    });
  };

  return {
    cambiarEsActual,
    cambiarFechaFin,
    cambiarFechaInicio,
    errorFechas,
    esActual,
    fechaFin,
    fechaInicio,
    manejarGuardar,
    operacionCambio,
    opcionesEstadoFinanciero,
    opcionesMoneda,
    opcionesTipoBalance,
    setOperacionCambio,
    setTipoBalance,
    setTipoCambio,
    setTipoEstadoFinanciero,
    tipoBalance,
    tipoCambio,
    tipoEstadoFinanciero,
  };
}
