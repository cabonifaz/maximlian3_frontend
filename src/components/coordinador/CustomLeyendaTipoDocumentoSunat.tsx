import { Loader2 } from "lucide-react";

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
    <p
      className="-mt-3 flex items-center gap-2 text-sm font-medium text-gray-600 md:col-span-2"
      aria-live="polite"
    >
      {cargando ? (
        <>
          <Loader2 size={14} className="animate-spin" />
          Consultando tipo de documento SUNAT...
        </>
      ) : (
        <>
          <span className="font-semibold text-gray-700">
            Tipo de documento SUNAT:
          </span>
          {texto}
        </>
      )}
    </p>
  );
}
