import { useEffect } from "react";
import { FileEdit, X } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import {
  esquemaCamposPdfFactura,
  type DatosFormularioCamposPdfFactura,
} from "@maximilian/schemas";
import type { EntradaListaFactura } from "@maximilian/shared/types/facturacion.type";

interface CustomModalCamposPdfFacturaProps {
  abierto: boolean;
  factura: EntradaListaFactura | null;
  onCerrar: () => void;
  onConfirmar: (datos: DatosFormularioCamposPdfFactura) => void;
}

function obtenerValoresIniciales(): DatosFormularioCamposPdfFactura {
  return { razonSocial: "" };
}

export function CustomModalCamposPdfFactura({
  abierto,
  factura,
  onCerrar,
  onConfirmar,
}: CustomModalCamposPdfFacturaProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<DatosFormularioCamposPdfFactura>({
    resolver: zodResolver(esquemaCamposPdfFactura),
    mode: "onTouched",
    defaultValues: obtenerValoresIniciales(),
  });

  useEffect(() => {
    if (abierto) reset(obtenerValoresIniciales());
  }, [abierto, reset]);

  if (!abierto || !factura) return null;

  const cerrar = () => {
    reset(obtenerValoresIniciales());
    onCerrar();
  };

  const confirmar = handleSubmit((datos) => {
    onConfirmar(datos);
    reset(obtenerValoresIniciales());
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
              <FileEdit size={19} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-brand-black">Añadir campos al PDF</h2>
              <p className="text-xs text-slate-500">{factura.numeroFactura}</p>
            </div>
          </div>
          <CustomButton type="button" variant="ghost" size="icon" onClick={cerrar} aria-label="Cerrar añadir campos">
            <X size={18} className="text-slate-400" />
          </CustomButton>
        </div>

        <div className="space-y-1.5 px-7 py-6">
          <CustomLabel htmlFor="razon-social-pdf-factura" required>
            Razón social
          </CustomLabel>
          <input
            id="razon-social-pdf-factura"
            {...register("razonSocial")}
            placeholder="Ingresa la razón social a mostrar en el PDF"
            className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-wine focus:ring-4 focus:ring-brand-wine/10 ${
              errors.razonSocial ? "border-red-500" : "border-slate-200"
            }`}
          />
          {errors.razonSocial ? (
            <p className="text-xs text-red-500">{errors.razonSocial.message}</p>
          ) : null}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 px-7 py-5">
          <CustomButton type="button" variant="secondary" size="compact" onClick={cerrar}>
            Cancelar
          </CustomButton>
          <CustomButton type="submit" variant="wine" size="compact">
            Descargar
          </CustomButton>
        </div>
      </form>
    </div>
  );
}
