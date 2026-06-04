import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
import { servicioTablaMaestra } from "@maximilian/services/tablaMaestra.service";
import type { RegistroBalanceAnalista } from "@maximilian/shared/types/investigacion.type";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import {
  normalizarMontoDosDecimales,
  sanitizarMontoDosDecimales,
  seleccionarTextoEditableEnContenedor,
  seleccionarTextoCampoEditable,
} from "@maximilian/shared/utils/formato-monto.util";

interface PropsCustomModalBalanceAnalista {
  estaAbierto: boolean;
  registroInicial?: RegistroBalanceAnalista | null;
  onCerrar: () => void;
  onGuardar: (registro: Omit<RegistroBalanceAnalista, "codigo" | "periodo" | "balanceGeneral" | "perdidaGanancia" | "cuentas" | "detalleCuentas">) => void;
}

function formatearFecha(fecha: string) {
  if (!fecha) return "";
  const [ano, mes, dia] = fecha.split("-");
  if (!ano || !mes || !dia) return fecha;
  return `${dia}/${mes}/${ano}`;
}

function convertirFechaEntrada(fecha: string) {
  if (!fecha.includes("/")) return fecha;
  const [dia, mes, ano] = fecha.split("/");
  if (!dia || !mes || !ano) return "";
  return `${ano}-${mes}-${dia}`;
}

export function CustomModalBalanceAnalista({
  estaAbierto,
  registroInicial,
  onCerrar,
  onGuardar,
}: PropsCustomModalBalanceAnalista) {
  const [fechaInicio, setFechaInicio] = useState(convertirFechaEntrada(registroInicial?.fechaInicio ?? registroInicial?.fecha ?? ""));
  const [fechaFin, setFechaFin] = useState(convertirFechaEntrada(registroInicial?.fechaFin ?? ""));
  const [esActual, setEsActual] = useState(registroInicial?.esActual ?? false);
  const [tipoCambio, setTipoCambio] = useState(registroInicial?.tipoCambio ?? "");
  const [operacionCambio, setOperacionCambio] = useState(registroInicial?.operacionCambio ?? "");
  const [tipoBalance, setTipoBalance] = useState(registroInicial?.tipoBalance ?? "Balance general");
  const [tipoEstadoFinanciero, setTipoEstadoFinanciero] = useState(registroInicial?.tipoEstadoFinanciero ?? registroInicial?.tipo ?? "");
  const [errorFechas, setErrorFechas] = useState("");
  const fechaActual = new Date().toISOString().split("T")[0] ?? "";
  const { data: opcionesMoneda } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.MONEDA],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.MONEDA),
    staleTime: Infinity,
  });
  const { data: opcionesTipoBalance } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.TIPO_BALANCE],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.TIPO_BALANCE),
    staleTime: Infinity,
  });
  const { data: opcionesEstadoFinanciero } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.ESTADO_FINANCIERO],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.ESTADO_FINANCIERO),
    staleTime: Infinity,
  });

  if (!estaAbierto) return null;

  const manejarGuardar = () => {
    const idTipoBalance = obtenerIdSeleccion(opcionesTipoBalance, tipoBalance) ?? registroInicial?.idTipoBalance;
    const idTipoEstadoFinanciero = obtenerIdSeleccion(opcionesEstadoFinanciero, tipoEstadoFinanciero) ?? registroInicial?.idTipoEstadoFinanciero;
    const idMoneda = obtenerIdSeleccion(opcionesMoneda, operacionCambio) ?? registroInicial?.idMoneda;

    if (fechaInicio && fechaActual && fechaInicio > fechaActual) {
      setErrorFechas("La fecha de inicio no puede ser mayor a la fecha actual.");
      return;
    }

    if (fechaInicio && fechaFin && !esActual && fechaInicio > fechaFin) {
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
      tipoBalance: tipoBalance.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm" onFocusCapture={seleccionarTextoEditableEnContenedor}>
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-7 py-6">
          <div>
            <h2 className="text-2xl font-bold text-brand-black">{registroInicial ? "Editar Balance" : "Agregar Balance"}</h2>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8ea0c0]">
              Registro de información financiera
            </p>
          </div>
          <CustomButton variant="ghost" size="icon" onClick={onCerrar}>
            <X size={18} className="text-[#8ea0c0]" />
          </CustomButton>
        </div>

        <div className="grid gap-5 px-7 py-6 md:grid-cols-2">
          <div className="space-y-2">
            <CustomLabel>Tipo de Balance</CustomLabel>
            <CustomSelectorBuscable
              options={opcionesTipoBalance}
              value={obtenerIdSeleccion(opcionesTipoBalance, tipoBalance)}
              onChange={(valor) => setTipoBalance(opcionesTipoBalance?.find((opcion) => opcion.num1 === valor)?.string1 ?? "")}
              onClear={() => setTipoBalance("")}
              optional
              mostrarTextoOpcionalEnLabel={false}
              placeholder="Seleccionar..."
            />
          </div>

          <div className="space-y-2">
            <CustomLabel>Tipo de Estado Financiero</CustomLabel>
            <CustomSelectorBuscable
              options={opcionesEstadoFinanciero}
              value={obtenerIdSeleccion(opcionesEstadoFinanciero, tipoEstadoFinanciero)}
              onChange={(valor) => setTipoEstadoFinanciero(opcionesEstadoFinanciero?.find((opcion) => opcion.num1 === valor)?.string1 ?? "")}
              onClear={() => setTipoEstadoFinanciero("")}
              optional
              mostrarTextoOpcionalEnLabel={false}
              placeholder="Seleccionar..."
            />
          </div>

          <div className="space-y-2">
            <CustomLabel>Fecha de Inicio</CustomLabel>
            <input
              type="date"
              value={fechaInicio}
              onChange={(event) => {
                const nuevoValor = event.target.value;
                setFechaInicio(nuevoValor);

                if (nuevoValor && fechaFin && nuevoValor > fechaFin) {
                  const mensaje = "La fecha de inicio no puede ser mayor a la fecha de fin.";
                  setErrorFechas(mensaje);
                  return;
                }

                if (nuevoValor && fechaActual && nuevoValor > fechaActual) {
                  const mensaje = "La fecha de inicio no puede ser mayor a la fecha actual.";
                  setErrorFechas(mensaje);
                  return;
                }

                setErrorFechas("");
              }}
              onFocus={seleccionarTextoCampoEditable}
              className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none transition-all focus:border-brand-black focus:ring-2 focus:ring-brand-black/5"
            />
          </div>

          <div className="space-y-2">
            <CustomLabel>Fecha de Fin</CustomLabel>
            <input
              type="date"
              value={fechaFin}
              disabled={esActual}
              onChange={(event) => {
                const nuevoValor = event.target.value;
                setFechaFin(nuevoValor);

                if (fechaInicio && nuevoValor && nuevoValor < fechaInicio) {
                  const mensaje = "La fecha de fin no puede ser menor a la fecha de inicio.";
                  setErrorFechas(mensaje);
                  return;
                }

                setErrorFechas("");
              }}
              onFocus={seleccionarTextoCampoEditable}
              className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400 focus:border-brand-black focus:ring-2 focus:ring-brand-black/5"
            />
          </div>

          <label className="col-span-full flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-slate-600">
            <input
              type="checkbox"
              checked={esActual}
              onChange={(event) => {
                const estaSeleccionado = event.target.checked;
                setEsActual(estaSeleccionado);
                setErrorFechas("");
                if (estaSeleccionado) {
                  setFechaFin("");
                }
              }}
              className="h-4 w-4 accent-brand-wine"
            />
            Actualidad
          </label>

          {errorFechas ? (
            <p className="col-span-full text-sm text-red-500">{errorFechas}</p>
          ) : null}

          

          <div className="space-y-2">
            <CustomLabel>Operación de Cambio</CustomLabel>
            <CustomSelectorBuscable
              options={opcionesMoneda}
              value={obtenerIdSeleccion(opcionesMoneda, operacionCambio)}
              onChange={(valor) => setOperacionCambio(opcionesMoneda?.find((opcion) => opcion.num1 === valor)?.string1 ?? "")}
              onClear={() => setOperacionCambio("")}
              optional
              mostrarTextoOpcionalEnLabel={false}
              placeholder="Seleccionar..."
            />
          </div>
<div className="space-y-2">
            <CustomLabel>Tipo de Cambio</CustomLabel>
            <input
              value={tipoCambio}
              onChange={(event) => setTipoCambio(sanitizarMontoDosDecimales(event.target.value))}
              onBlur={(event) => setTipoCambio(normalizarMontoDosDecimales(event.target.value))}
              onFocus={seleccionarTextoCampoEditable}
              placeholder="0.00"
              className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none transition-all focus:border-brand-black focus:ring-2 focus:ring-brand-black/5"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 px-7 py-5">
          <CustomButton variant="secondary" size="sm" onClick={onCerrar}>
            Cancelar
          </CustomButton>
          <CustomButton size="sm" onClick={manejarGuardar}>
            Guardar
          </CustomButton>
        </div>
      </div>
    </div>
  );
}

function obtenerIdSeleccion(opciones: { num1: number | null; string1: string | null }[] | undefined, valor?: string) {
  const texto = valor?.trim() ?? "";
  if (!texto) return undefined;

  const numero = Number.parseInt(texto, 10);
  if (Number.isFinite(numero) && numero > 0) return numero;

  return opciones?.find((opcion) => opcion.string1?.trim().toLowerCase() === texto.toLowerCase())?.num1 ?? undefined;
}
