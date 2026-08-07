import { useEffect } from "react";
import { FileDown, X } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomSelectorMes } from "@maximilian/components/common/CustomSelectorMes";
import {
  esquemaExportarLibroVentas,
  type DatosFormularioExportarLibroVentas,
} from "@maximilian/schemas";

interface CustomModalExportarLibroVentasProps {
  abierto: boolean;
  cargando: boolean;
  onCerrar: () => void;
  onConfirmar: (datos: DatosFormularioExportarLibroVentas) => void;
}

function obtenerValoresIniciales(): DatosFormularioExportarLibroVentas {
  return { mes: undefined } as unknown as DatosFormularioExportarLibroVentas;
}

export function CustomModalExportarLibroVentas({
  abierto,
  cargando,
  onCerrar,
  onConfirmar,
}: CustomModalExportarLibroVentasProps) {
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
  } = useForm<DatosFormularioExportarLibroVentas>({
    resolver: zodResolver(esquemaExportarLibroVentas),
    mode: "onTouched",
    defaultValues: obtenerValoresIniciales(),
  });
  const mes = useWatch({ control, name: "mes" });

  useEffect(() => {
    if (abierto) reset(obtenerValoresIniciales());
  }, [abierto, reset]);

  if (!abierto) return null;

  const cerrar = () => {
    if (cargando) return;
    reset(obtenerValoresIniciales());
    onCerrar();
  };

  const confirmar = handleSubmit((datos) => {
    onConfirmar(datos);
  });

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <form
        onSubmit={confirmar}
        className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-7 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-wine/10 text-brand-wine">
              <FileDown size={19} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-brand-black">
                Exportar libro electrónico de ventas
              </h2>
              <p className="text-xs text-slate-500">
                Especifica el mes para exportar el libro.
              </p>
            </div>
          </div>
          <CustomButton
            type="button"
            variant="ghost"
            size="icon"
            onClick={cerrar}
            disabled={cargando}
            aria-label="Cerrar exportar libro de ventas"
          >
            <X size={18} className="text-slate-400" />
          </CustomButton>
        </div>

        <div className="px-7 py-6">
          <CustomSelectorMes
            label="Mes"
            required
            value={mes}
            disabled={cargando}
            onChange={(fecha) =>
              setValue("mes", fecha as Date, {
                shouldDirty: true,
                shouldValidate: true,
              })}
            error={errors.mes?.message}
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 px-7 py-5">
          <CustomButton
            type="button"
            variant="secondary"
            size="compact"
            onClick={cerrar}
            disabled={cargando}
          >
            Cancelar
          </CustomButton>
          <CustomButton
            type="submit"
            variant="wine"
            size="compact"
            loading={cargando}
            loadingText="Exportando..."
          >
            Exportar
          </CustomButton>
        </div>
      </form>
    </div>
  );
}
