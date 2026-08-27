import { useEffect } from "react";
import { FileSpreadsheet, Plus, Trash2, X } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomSelectorFecha } from "@maximilian/components/common/CustomSelectorFecha";
import { CustomSelectorMes } from "@maximilian/components/common/CustomSelectorMes";
import { useGenerarPrefactura } from "@maximilian/hooks/useGenerarPrefactura";
import {
  esquemaGenerarPrefactura,
  type DatosFormularioGenerarPrefactura,
} from "@maximilian/schemas";

interface CustomModalGenerarPrefacturaProps {
  abierto: boolean;
  idCliente: number;
  cliente: string;
  onCerrar: () => void;
}

function obtenerValoresIniciales(): DatosFormularioGenerarPrefactura {
  return { modo: "rango", fechaInicio: undefined, fechaFin: undefined, meses: [] };
}

const resolverGenerarPrefactura: Resolver<DatosFormularioGenerarPrefactura> =
  async (...args) => {
    const result = await zodResolver(esquemaGenerarPrefactura)(...args);
    const { modo, fechaInicio, fechaFin, meses } = args[0];

    if (modo === "rango") {
      if (!fechaInicio) {
        result.errors = {
          ...result.errors,
          fechaInicio: { type: "custom", message: "La fecha inicio es requerida" },
        };
      }
      if (!fechaFin) {
        result.errors = {
          ...result.errors,
          fechaFin: { type: "custom", message: "La fecha fin es requerida" },
        };
      }
      if (fechaInicio && fechaFin && fechaInicio > fechaFin) {
        result.errors = {
          ...result.errors,
          fechaFin: {
            type: "custom",
            message: "La fecha fin no puede ser anterior a la fecha inicio",
          },
        };
      }
    } else if (meses.length === 0) {
      result.errors = {
        ...result.errors,
        meses: { type: "custom", message: "Agrega al menos un mes" },
      };
    }

    return result;
  };

export function CustomModalGenerarPrefactura({
  abierto,
  idCliente,
  cliente,
  onCerrar,
}: CustomModalGenerarPrefacturaProps) {
  const { generando, generar } = useGenerarPrefactura();
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
  } = useForm<DatosFormularioGenerarPrefactura>({
    resolver: resolverGenerarPrefactura,
    mode: "onTouched",
    defaultValues: obtenerValoresIniciales(),
  });
  const modo = useWatch({ control, name: "modo" });
  const fechaInicio = useWatch({ control, name: "fechaInicio" });
  const fechaFin = useWatch({ control, name: "fechaFin" });
  const meses = useWatch({ control, name: "meses" });

  useEffect(() => {
    if (abierto) reset(obtenerValoresIniciales());
  }, [abierto, reset]);

  if (!abierto) return null;

  const cerrar = () => {
    if (generando) return;
    reset(obtenerValoresIniciales());
    onCerrar();
  };

  const confirmar = handleSubmit(async (datos) => {
    const exito = await generar(idCliente, datos);
    if (exito) {
      reset(obtenerValoresIniciales());
      onCerrar();
    }
  });

  const agregarMes = () => {
    setValue("meses", [...meses, new Date()], {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const actualizarMes = (indice: number, fecha: Date | undefined) => {
    if (!fecha) return;
    setValue(
      "meses",
      meses.map((mesActual, i) => (i === indice ? fecha : mesActual)),
      { shouldDirty: true, shouldValidate: true },
    );
  };

  const quitarMes = (indice: number) => {
    setValue(
      "meses",
      meses.filter((_, i) => i !== indice),
      { shouldDirty: true, shouldValidate: true },
    );
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <form
        onSubmit={confirmar}
        className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-7 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-wine/10 text-brand-wine">
              <FileSpreadsheet size={19} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-brand-black">
                Generar Prefactura
              </h2>
              <p className="text-xs text-slate-500">
                Excel con el detalle de los pedidos del cliente en el periodo.
              </p>
            </div>
          </div>
          <CustomButton
            type="button"
            variant="ghost"
            size="icon"
            onClick={cerrar}
            disabled={generando}
            aria-label="Cerrar generar prefactura"
          >
            <X size={18} className="text-slate-400" />
          </CustomButton>
        </div>

        <div className="space-y-5 px-7 py-6">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Cliente
            </p>
            <p className="mt-0.5 text-sm font-bold text-brand-black">{cliente}</p>
          </div>

          <div className="flex gap-1 rounded-2xl bg-gray-50 p-1">
            <button
              type="button"
              disabled={generando}
              onClick={() =>
                setValue("modo", "rango", { shouldValidate: true })}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-bold transition-all disabled:cursor-not-allowed ${
                modo === "rango"
                  ? "bg-white text-brand-black shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Rango de fechas
            </button>
            <button
              type="button"
              disabled={generando}
              onClick={() =>
                setValue("modo", "meses", { shouldValidate: true })}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-bold transition-all disabled:cursor-not-allowed ${
                modo === "meses"
                  ? "bg-white text-brand-black shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Mes(es)
            </button>
          </div>

          {modo === "rango" ? (
            <div className="grid grid-cols-2 gap-3">
              <CustomSelectorFecha
                label="Fecha inicio"
                required
                value={fechaInicio}
                disabled={generando}
                onChange={(fecha) =>
                  setValue("fechaInicio", fecha, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })}
                error={errors.fechaInicio?.message}
              />
              <CustomSelectorFecha
                label="Fecha fin"
                required
                value={fechaFin}
                disabled={generando}
                onChange={(fecha) =>
                  setValue("fechaFin", fecha, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })}
                error={errors.fechaFin?.message}
              />
            </div>
          ) : (
            <div className="space-y-2">
              {meses.map((mes, indice) => (
                <div key={indice} className="flex items-end gap-2">
                  <div className="flex-1">
                    <CustomSelectorMes
                      label={indice === 0 ? "Mes" : undefined}
                      value={mes}
                      disabled={generando}
                      onChange={(fecha) => actualizarMes(indice, fecha)}
                    />
                  </div>
                  <CustomButton
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mb-0.5 h-9 w-9 text-red-500"
                    disabled={generando}
                    onClick={() => quitarMes(indice)}
                    aria-label="Quitar mes"
                  >
                    <Trash2 size={14} />
                  </CustomButton>
                </div>
              ))}
              <CustomButton
                type="button"
                variant="secondary"
                size="sm"
                disabled={generando}
                onClick={agregarMes}
              >
                <Plus size={14} />
                Agregar mes
              </CustomButton>
              {errors.meses?.message ? (
                <p className="text-xs text-red-500">{errors.meses.message}</p>
              ) : null}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 px-7 py-5">
          <CustomButton
            type="button"
            variant="secondary"
            size="compact"
            onClick={cerrar}
            disabled={generando}
          >
            Cancelar
          </CustomButton>
          <CustomButton
            type="submit"
            variant="wine"
            size="compact"
            loading={generando}
            loadingText="Generando..."
          >
            Generar
          </CustomButton>
        </div>
      </form>
    </div>
  );
}
