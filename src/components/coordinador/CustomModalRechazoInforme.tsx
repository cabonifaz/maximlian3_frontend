import { X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";

interface PropsCustomModalRechazoInforme {
  estaAbierto: boolean;
  motivoRechazo: string;
  onMotivoRechazoChange: (valor: string) => void;
  onCerrar: () => void;
  onConfirmar: () => void;
}

export function CustomModalRechazoInforme({
  estaAbierto,
  motivoRechazo,
  onMotivoRechazoChange,
  onCerrar,
  onConfirmar,
}: PropsCustomModalRechazoInforme) {
  if (!estaAbierto) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-8 py-6">
          <h2 className="text-[22px] font-bold text-slate-800">Rechazar Informe</h2>
          <CustomButton variant="ghost" size="icon" onClick={onCerrar}>
            <X size={22} className="text-slate-400" />
          </CustomButton>
        </div>

        <div className="px-8 py-7">
          <div className="space-y-3">
            <CustomLabel htmlFor="motivo-rechazo" className="text-[15px] font-bold text-slate-700">
              Motivo de rechazo
            </CustomLabel>
            <textarea
              id="motivo-rechazo"
              value={motivoRechazo}
              onChange={(event) => onMotivoRechazoChange(event.target.value)}
              placeholder="Ingrese el motivo por el cual rechaza el informe..."
              className="min-h-40 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-300 focus:border-brand-black focus:ring-2 focus:ring-brand-black/5"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 border-t border-slate-200 bg-slate-50 px-8 py-5">
          <CustomButton variant="secondary" size="compact" className="min-w-36" onClick={onCerrar}>
            CANCELAR
          </CustomButton>
          <CustomButton
            size="compact"
            className="min-w-36 uppercase tracking-[0.06em]"
            disabled={!motivoRechazo.trim()}
            onClick={onConfirmar}
          >
            CONFIRMAR
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
