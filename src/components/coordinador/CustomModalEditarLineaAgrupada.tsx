import { createPortal } from "react-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Pencil, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import {
  esquemaLineaAgrupadaFactura,
  type DatosFormularioLineaAgrupadaFactura,
} from "@maximilian/schemas";
import type { EntradaLineaAgrupadaPendiente } from "@maximilian/shared/types/facturacion.type";

interface CustomModalEditarLineaAgrupadaProps {
  linea: EntradaLineaAgrupadaPendiente | null;
  guardando: boolean;
  onCerrar: () => void;
  onGuardar: (datos: DatosFormularioLineaAgrupadaFactura) => void;
}

export function CustomModalEditarLineaAgrupada({
  linea,
  guardando,
  onCerrar,
  onGuardar,
}: CustomModalEditarLineaAgrupadaProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<DatosFormularioLineaAgrupadaFactura>({
    resolver: zodResolver(esquemaLineaAgrupadaFactura),
    mode: "onTouched",
    values: { codigo: linea?.codigo ?? "", descripcion: linea?.descripcion ?? "" },
  });

  const cerrar = () => {
    reset({ codigo: "", descripcion: "" });
    onCerrar();
  };

  const guardar = handleSubmit((datos) => {
    onGuardar(datos);
  });

  if (!linea) return null;

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl shadow-slate-950/25">
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-white to-brand-wine/5 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-wine/10 text-brand-wine">
              <Pencil size={17} />
            </div>
            <h2 className="text-sm font-bold text-brand-black">Editar línea agrupada</h2>
          </div>
          <CustomButton variant="ghost" size="icon" onClick={cerrar} aria-label="Cerrar edición">
            <X size={16} className="text-slate-400" />
          </CustomButton>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="space-y-1.5">
            <CustomLabel htmlFor="editar-linea-codigo" optional>
              Código
            </CustomLabel>
            <input
              id="editar-linea-codigo"
              maxLength={30}
              {...register("codigo")}
              className={`w-full rounded-xl border bg-brand-white px-3 py-2 text-sm outline-none transition-all focus:border-brand-wine focus:ring-4 focus:ring-brand-wine/10 ${
                errors.codigo ? "border-red-500" : "border-gray-200"
              }`}
            />
            {errors.codigo ? (
              <p className="text-xs font-medium text-red-500">{errors.codigo.message}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <CustomLabel htmlFor="editar-linea-descripcion" required>
              Descripción
            </CustomLabel>
            <input
              id="editar-linea-descripcion"
              maxLength={500}
              {...register("descripcion")}
              className={`w-full rounded-xl border bg-brand-white px-3 py-2 text-sm outline-none transition-all focus:border-brand-wine focus:ring-4 focus:ring-brand-wine/10 ${
                errors.descripcion ? "border-red-500" : "border-gray-200"
              }`}
            />
            {errors.descripcion ? (
              <p className="text-xs font-medium text-red-500">{errors.descripcion.message}</p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-white px-6 py-4">
          <CustomButton type="button" variant="secondary" size="compact" onClick={cerrar} disabled={guardando}>
            Cancelar
          </CustomButton>
          <CustomButton
            type="button"
            variant="wine"
            size="compact"
            onClick={() => void guardar()}
            loading={guardando}
            loadingText="Guardando..."
          >
            Guardar cambios
          </CustomButton>
        </div>
      </div>
    </div>,
    document.body,
  );
}
