import { AlertTriangle, Loader2, OctagonAlert, X } from 'lucide-react';
import { CustomButton } from '@maximilian/components/common/CustomButton';
import type {
  EntradaListaFactura,
  ErrorDocumentoFactura,
} from '@maximilian/shared/types/facturacion.type';
import { formatearFechaVisual } from '@maximilian/shared/utils/fecha.util';

const OPCIONES_FECHA_ERROR: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

const ESTILOS_SEVERIDAD_ERROR: Record<string, { clase: string; icono: typeof AlertTriangle }> = {
  Error: { clase: 'bg-red-50 text-red-700 border-red-100', icono: OctagonAlert },
  Advertencia: { clase: 'bg-amber-50 text-amber-700 border-amber-100', icono: AlertTriangle },
};

interface PropsCustomModalErroresFactura {
  abierto: boolean;
  factura: EntradaListaFactura | null;
  errores: ErrorDocumentoFactura[];
  cargando: boolean;
  onCerrar: () => void;
}

function TarjetaErrorDocumento({ error }: { error: ErrorDocumentoFactura }) {
  const estilo = ESTILOS_SEVERIDAD_ERROR[error.severidadCodigo] ?? ESTILOS_SEVERIDAD_ERROR.Error;
  const Icono = estilo.icono;

  return (
    <div className={`space-y-2 rounded-xl border px-4 py-3 ${estilo.clase}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icono size={16} className="shrink-0" />
          <span className="text-xs font-bold uppercase tracking-wide">
            {error.severidadCodigo}
          </span>
          <span className="text-xs font-semibold opacity-70">
            {error.origenErrorCodigo} · {error.codigoError}
          </span>
        </div>
        <span className="shrink-0 text-[11px] opacity-70">
          {formatearFechaVisual(error.fchCre, OPCIONES_FECHA_ERROR)}
        </span>
      </div>
      <p className="text-sm leading-snug text-slate-700">{error.mensajeError}</p>
    </div>
  );
}

export function CustomModalErroresFactura({
  abierto,
  factura,
  errores,
  cargando,
  onCerrar,
}: PropsCustomModalErroresFactura) {
  if (!abierto || !factura) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) onCerrar();
      }}
    >
      <div className="flex max-h-[85dvh] w-full max-w-lg flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <OctagonAlert size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-brand-black">
                Errores del último envío
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {factura.numeroFactura}
              </p>
            </div>
          </div>
          <CustomButton
            variant="ghost"
            size="icon"
            onClick={onCerrar}
            aria-label="Cerrar errores de la factura"
          >
            <X size={18} />
          </CustomButton>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 py-6">
          {cargando ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={24} className="animate-spin text-slate-400" />
            </div>
          ) : errores.length ? (
            errores.map((error) => (
              <TarjetaErrorDocumento key={error.idErrorDocumento} error={error} />
            ))
          ) : (
            <p className="py-10 text-center text-sm text-slate-400">
              No se registraron errores en el último envío a SUNAT.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
