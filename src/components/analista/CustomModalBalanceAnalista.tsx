import { useState } from "react";
import { X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import type { RegistroBalanceAnalista } from "@maximilian/shared/types/analista.type";

interface PropsCustomModalBalanceAnalista {
  estaAbierto: boolean;
  registroInicial?: RegistroBalanceAnalista | null;
  onCerrar: () => void;
  onGuardar: (registro: Omit<RegistroBalanceAnalista, "codigo" | "periodo" | "balanceGeneral" | "perdidaGanancia" | "cuentas" | "detalleCuentas">) => void;
}

const opcionesOperacionCambio = ["US Dollar", "Euro", "Sol"];
const opcionesTipoBalance = ["Balance general", "Balance consolidado"];
const opcionesTipoEstadoFinanciero = ["GN-PG", "GN", "PG", "Desagregado", "Totalizado", "Turquía"];

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

  if (!estaAbierto) return null;

  const manejarGuardar = () => {
    if (!fechaInicio || (!esActual && !fechaFin) || !tipoCambio.trim() || !operacionCambio.trim() || !tipoBalance.trim() || !tipoEstadoFinanciero.trim()) {
      return;
    }

    onGuardar({
      fecha: esActual
        ? `${formatearFecha(fechaInicio)} - Actualidad`
        : `${formatearFecha(fechaInicio)} - ${formatearFecha(fechaFin)}`,
      fechaInicio: formatearFecha(fechaInicio),
      fechaFin: esActual ? "" : formatearFecha(fechaFin),
      esActual,
      tipo: tipoEstadoFinanciero.trim(),
      tipoEstadoFinanciero: tipoEstadoFinanciero.trim(),
      tipoCambio: tipoCambio.trim(),
      operacionCambio: operacionCambio.trim(),
      tipoBalance: tipoBalance.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
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
            <CustomLabel>Fecha de Inicio</CustomLabel>
            <input
              type="date"
              value={fechaInicio}
              onChange={(event) => setFechaInicio(event.target.value)}
              className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none transition-all focus:border-brand-black focus:ring-2 focus:ring-brand-black/5"
            />
          </div>

          <div className="space-y-2">
            <CustomLabel>Fecha de Fin</CustomLabel>
            <input
              type="date"
              value={fechaFin}
              disabled={esActual}
              onChange={(event) => setFechaFin(event.target.value)}
              className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400 focus:border-brand-black focus:ring-2 focus:ring-brand-black/5"
            />
          </div>

          <label className="col-span-full flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-slate-600">
            <input
              type="checkbox"
              checked={esActual}
              onChange={(event) => setEsActual(event.target.checked)}
              className="h-4 w-4 accent-brand-wine"
            />
            Actualidad
          </label>

          <div className="space-y-2">
            <CustomLabel>Tipo de Cambio</CustomLabel>
            <input
              value={tipoCambio}
              onChange={(event) => setTipoCambio(event.target.value)}
              placeholder="0.00"
              className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none transition-all focus:border-brand-black focus:ring-2 focus:ring-brand-black/5"
            />
          </div>

          <div className="space-y-2">
            <CustomLabel>Operación de Cambio</CustomLabel>
            <select
              value={operacionCambio}
              onChange={(event) => setOperacionCambio(event.target.value)}
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-slate-600 outline-none transition-all focus:border-brand-black focus:ring-2 focus:ring-brand-black/5"
            >
              <option value="">Seleccionar...</option>
              {opcionesOperacionCambio.map((opcion) => (
                <option key={opcion} value={opcion}>
                  {opcion}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <CustomLabel>Tipo de Balance</CustomLabel>
            <select
              value={tipoBalance}
              onChange={(event) => setTipoBalance(event.target.value)}
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-slate-600 outline-none transition-all focus:border-brand-black focus:ring-2 focus:ring-brand-black/5"
            >
              <option value="">Seleccionar...</option>
              {opcionesTipoBalance.map((opcion) => (
                <option key={opcion} value={opcion}>
                  {opcion}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <CustomLabel>Tipo de Estado Financiero</CustomLabel>
            <select
              value={tipoEstadoFinanciero}
              onChange={(event) => setTipoEstadoFinanciero(event.target.value)}
              className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-slate-600 outline-none transition-all focus:border-brand-black focus:ring-2 focus:ring-brand-black/5"
            >
              <option value="">Seleccionar...</option>
              {opcionesTipoEstadoFinanciero.map((opcion) => (
                <option key={opcion} value={opcion}>
                  {opcion}
                </option>
              ))}
            </select>
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
