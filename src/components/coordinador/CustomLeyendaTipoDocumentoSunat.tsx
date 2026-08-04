import { Loader2 } from "lucide-react";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";

interface CustomLeyendaTipoDocumentoSunatProps {
  valor?: string;
  cargando?: boolean;
  tieneTipoRegistro: boolean;
}

export function CustomLeyendaTipoDocumentoSunat({
  valor,
  cargando = false,
  tieneTipoRegistro,
}: CustomLeyendaTipoDocumentoSunatProps) {
  if (!tieneTipoRegistro && !cargando) return null;

  const texto = valor ?? "Sin correspondencia configurada";

  return (
    <div
      className="-mt-3 flex min-w-0 flex-col items-start gap-1 md:col-span-2 sm:flex-row sm:gap-1.5"
      aria-live="polite"
    >
      <CustomLabel
        as="p"
        className="shrink-0 text-sm font-bold text-gray-700"
      >
        Tipo de documento SUNAT:
      </CustomLabel>
      <p className="flex min-h-5 min-w-0 max-w-full items-center gap-2 whitespace-normal break-words text-sm text-brand-black">
        {cargando ? (
          <>
            <Loader2 size={14} className="animate-spin text-gray-400" />
            <span className="text-gray-400">Consultando...</span>
          </>
        ) : (
          texto
        )}
      </p>
    </div>
  );
}
