import { AlertCircle, RefreshCw } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";

interface PropsCustomErrorTarjetaDashboard {
  titulo: string;
  onReintentar: () => void;
}

export function CustomErrorTarjetaDashboard({ titulo, onReintentar }: PropsCustomErrorTarjetaDashboard) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <AlertCircle className="h-6 w-6 text-red-500" />
        </div>
        <p className="text-sm font-bold text-brand-black">
          No se pudo cargar {titulo}.
        </p>
        <CustomButton variant="wine" size="sm" onClick={onReintentar}>
          <RefreshCw size={14} />
          <span>REINTENTAR</span>
        </CustomButton>
      </div>
    </section>
  );
}
