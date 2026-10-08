import { ArrowLeft, RotateCcw } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";

interface PropsCustomErrorCargaMigracion {
  mensaje: string;
  onReintentar?: () => void;
  onVolver: () => void;
}

export function CustomErrorCargaMigracion({ mensaje, onReintentar, onVolver }: PropsCustomErrorCargaMigracion) {
  return (
    <section className="mx-auto max-w-xl rounded-3xl border border-rose-100 bg-white p-8 text-center shadow-sm">
      <h1 className="text-xl font-bold text-brand-black">No se pudo abrir la migración</h1>
      <p className="mt-3 text-sm text-gray-500">{mensaje}</p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <CustomButton variant="secondary" onClick={onVolver}><ArrowLeft size={16} /> Volver</CustomButton>
        {onReintentar ? <CustomButton onClick={onReintentar}><RotateCcw size={16} /> Reintentar</CustomButton> : null}
      </div>
    </section>
  );
}
