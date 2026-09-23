import { X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
import { CustomCampoFechaInvestigacion } from "@maximilian/components/investigacion/CustomCampoFechaInvestigacion";
import {
  obtenerIdSeleccion,
  useModalBalanceInforme,
} from "@maximilian/hooks/useModalBalanceInforme";
import type { RegistroBalanceAnalista } from "@maximilian/shared/types/investigacion.type";
import {
  normalizarMontoDosDecimales,
  sanitizarMontoDosDecimales,
  seleccionarTextoCampoEditable,
  seleccionarTextoEditableEnContenedor,
} from "@maximilian/shared/utils/formato-monto.util";

interface PropsCustomModalBalanceAnalista {
  estaAbierto: boolean;
  registroInicial?: RegistroBalanceAnalista | null;
  idIdioma?: number;
  onCerrar: () => void;
  onGuardar: (
    registro: Omit<
      RegistroBalanceAnalista,
      | "codigo"
      | "periodo"
      | "balanceGeneral"
      | "perdidaGanancia"
      | "cuentas"
      | "detalleCuentas"
    >,
  ) => void;
}

export function CustomModalBalanceAnalista({
  estaAbierto,
  registroInicial,
  idIdioma,
  onCerrar,
  onGuardar,
}: PropsCustomModalBalanceAnalista) {
  const {
    cambiarFechaBalance,
    fechaBalance,
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
  } = useModalBalanceInforme({ idIdioma, registroInicial, onGuardar });

  if (!estaAbierto) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
      onFocusCapture={seleccionarTextoEditableEnContenedor}
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white px-8 py-7">
          <div>
            <h2 className="text-2xl font-bold text-brand-black">
              {registroInicial ? "Editar Balance" : "Agregar Balance"}
            </h2>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8ea0c0]">
              Registro de información financiera
            </p>
          </div>
          <CustomButton variant="ghost" size="icon" onClick={onCerrar}>
            <X size={18} className="text-[#8ea0c0]" />
          </CustomButton>
        </div>

        <div className="space-y-6 px-8 py-7">
          <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <CustomLabel>Tipo de Balance</CustomLabel>
            <CustomSelectorBuscable
              options={opcionesTipoBalance}
              value={obtenerIdSeleccion(opcionesTipoBalance, tipoBalance)}
              onChange={(valor) =>
                setTipoBalance(
                  opcionesTipoBalance?.find((opcion) => opcion.num1 === valor)
                    ?.string1 ?? "",
                )
              }
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
              value={obtenerIdSeleccion(
                opcionesEstadoFinanciero,
                tipoEstadoFinanciero,
              )}
              onChange={(valor) =>
                setTipoEstadoFinanciero(
                  opcionesEstadoFinanciero?.find(
                    (opcion) => opcion.num1 === valor,
                  )?.string1 ?? "",
                )
              }
              onClear={() => setTipoEstadoFinanciero("")}
              optional
              mostrarTextoOpcionalEnLabel={false}
              placeholder="Seleccionar..."
            />
          </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Periodo del balance
            </p>
            <CustomCampoFechaInvestigacion
              etiqueta="Fecha del balance"
              valor={fechaBalance}
              onChange={cambiarFechaBalance}
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Tipo de cambio
            </p>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <CustomLabel>Operación de cambio</CustomLabel>
            <CustomSelectorBuscable
              options={opcionesMoneda}
              value={obtenerIdSeleccion(opcionesMoneda, operacionCambio)}
              onChange={(valor) =>
                setOperacionCambio(
                  opcionesMoneda?.find((opcion) => opcion.num1 === valor)
                    ?.string1 ?? "",
                )
              }
              onClear={() => setOperacionCambio("")}
              optional
              mostrarTextoOpcionalEnLabel={false}
                placeholder="Seleccionar..."
              />
              </div>

              <div className="space-y-2">
                <CustomLabel>Tipo de cambio</CustomLabel>
            <input
              value={tipoCambio}
              onChange={(event) =>
                setTipoCambio(sanitizarMontoDosDecimales(event.target.value))
              }
              onBlur={(event) =>
                setTipoCambio(normalizarMontoDosDecimales(event.target.value))
              }
              onFocus={seleccionarTextoCampoEditable}
              placeholder="0.00"
              className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none transition-all focus:border-brand-black focus:ring-2 focus:ring-brand-black/5"
            />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 bg-slate-50/70 px-8 py-5">
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
