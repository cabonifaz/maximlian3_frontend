import { CustomButton } from "@maximilian/components/common/CustomButton";

interface PropsCustomModalFinalizarInvestigacionAnalista {
  estaAbierto: boolean;
  estaGuardando?: boolean;
  onCerrar: () => void;
  onConfirmar: () => void;
}

export function CustomModalFinalizarInvestigacionAnalista({
  estaAbierto,
  estaGuardando = false,
  onCerrar,
  onConfirmar,
}: PropsCustomModalFinalizarInvestigacionAnalista) {
  if (!estaAbierto) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[28px] bg-white px-6 py-8 shadow-2xl sm:px-10">
        <div className="mx-auto max-w-md text-center">
          <h2 className="text-[18px] font-bold leading-tight text-slate-800 sm:text-[20px]">
            ¿Estás seguro de finalizar la investigación?
          </h2>
          <p className="mt-5 text-sm leading-6 text-[#7b8aa3]">
            Al presionar confirmar este informe será enviado al coordinador para que sea revisado y aprobado.
          </p>
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
