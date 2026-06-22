import { Eye } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";

interface PropsCustomModalFinalizarInvestigacionAnalista {
  estaAbierto: boolean;
  estaGuardando?: boolean;
  onCerrar: () => void;
  onConfirmar: () => void;
  onVerVistaPreviaInforme?: () => void;
  tipoProceso?: string;
  descripcionDestino?: string;
}

export function CustomModalFinalizarInvestigacionAnalista({
  estaAbierto,
  estaGuardando = false,
  onCerrar,
  onConfirmar,
  onVerVistaPreviaInforme,
  tipoProceso = "investigación",
  descripcionDestino = "Al presionar confirmar este informe será enviado al coordinador para que sea revisado y aprobado.",
}: PropsCustomModalFinalizarInvestigacionAnalista) {
  if (!estaAbierto) return null;

  return (
    <div className="fixed left-0 top-0 z-[95] flex h-[100dvh] w-[100dvw] items-center justify-center overflow-hidden bg-slate-900/35 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[28px] bg-white px-6 py-8 shadow-2xl sm:px-10">
        <div className="mx-auto max-w-md text-center">
          <h2 className="text-[18px] font-bold leading-tight text-slate-800 sm:text-[20px]">
            {`¿Estás seguro de finalizar la ${tipoProceso}?`}
          </h2>
          <p className="mt-5 text-sm leading-6 text-[#7b8aa3]">
            {descripcionDestino}
          </p>
          {onVerVistaPreviaInforme ? (
            <button
              type="button"
              onClick={onVerVistaPreviaInforme}
              disabled={estaGuardando}
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
            >
              <Eye size={14} />
              Ver vista previa del reporte
            </button>
          ) : null}
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <CustomButton
            type="button"
            variant="secondary"
            size="md"
            className="h-12 border-[#e5eaf2] text-xs font-bold uppercase tracking-[0.22em] text-[#63728b]"
            onClick={onCerrar}
            disabled={estaGuardando}
          >
            Cancelar
          </CustomButton>
          <CustomButton
            type="button"
            size="md"
            className="h-12 text-xs font-bold uppercase tracking-[0.22em]"
            onClick={onConfirmar}
            loading={estaGuardando}
            loadingText="Confirmando"
          >
            Confirmar
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
