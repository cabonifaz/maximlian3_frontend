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
const opcionesTipoBalance = ["GN-PG", "GN", "PG"];

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
  const [fechaBalance, setFechaBalance] = useState(convertirFechaEntrada(registroInicial?.fecha ?? ""));
  const [tipoCambio, setTipoCambio] = useState(registroInicial?.tipoCambio ?? "");
  const [operacionCambio, setOperacionCambio] = useState(registroInicial?.operacionCambio ?? "");
  const [tipoBalance, setTipoBalance] = useState(registroInicial?.tipoBalance ?? registroInicial?.tipo ?? "");

  if (!estaAbierto) return null;

  const manejarGuardar = () => {
    if (!fechaBalance || !tipoCambio.trim() || !operacionCambio.trim() || !tipoBalance.trim()) {
      return;
    }

    onGuardar({
      fecha: formatearFecha(fechaBalance),
      tipo: tipoBalance.trim(),
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
            <CustomLabel>Fecha de Balance</CustomLabel>
            <input
              type="date"
              value={fechaBalance}
              onChange={(event) => setFechaBalance(event.target.value)}
              className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none transition-all focus:border-brand-black focus:ring-2 focus:ring-brand-black/5"
            />
          </div>

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
