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
      className="-mt-3 flex items-center gap-1.5 whitespace-nowrap md:col-span-2"
      aria-live="polite"
    >
      <CustomLabel as="p">Tipo de documento SUNAT:</CustomLabel>
      <p className="flex min-h-5 items-center gap-2 text-sm text-brand-black">
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
