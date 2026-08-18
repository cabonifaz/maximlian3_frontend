import { FileWarning } from "lucide-react";
import { CustomChipEstado } from "@maximilian/components/common/CustomChipEstado";
import type { ModoConsultaAnulacion } from "@maximilian/hooks/useDocumentosAfectadosPorAnulacion";
import type { DocumentoAfectadoAnulacion } from "@maximilian/shared/types/facturacion.type";
import { formatearFechaIsoADdMmYyyy } from "@maximilian/shared/utils/fecha.util";

interface CustomListaNotasDependientesFacturaProps {
  cargandoNotasDependientes: boolean;
  errorNotasDependientes: boolean;
  idDocumentoElectronico: number | null;
  modo: ModoConsultaAnulacion;
  notasDependientes: DocumentoAfectadoAnulacion[];
}

export function CustomListaNotasDependientesFactura({
  cargandoNotasDependientes,
  errorNotasDependientes,
  idDocumentoElectronico,
  modo,
  notasDependientes,
}: CustomListaNotasDependientesFacturaProps) {
  if (idDocumentoElectronico === null) return null;

  const hayNotas = !cargandoNotasDependientes && !errorNotasDependientes
    && notasDependientes.length > 0;

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white px-5 py-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-brand-black">
          Notas de crédito / débito asociadas
        </p>
        {hayNotas ? (
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-500">
            {notasDependientes.length}
          </span>
        ) : null}
      </div>

      {cargandoNotasDependientes ? (
        <div className="space-y-2">
          <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
          <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
        </div>
      ) : errorNotasDependientes ? (
        <p className="text-xs text-red-600">
          No se pudieron cargar las notas asociadas a este documento.
        </p>
      ) : notasDependientes.length === 0 ? (
        <p className="text-xs text-slate-500">
          Este documento no tiene notas de crédito o débito asociadas.
        </p>
      ) : (
        <>
          <ul className="divide-y divide-slate-100">
            {notasDependientes.map((nota) => (
              <li
                key={nota.idDocumentoElectronico}
                className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-brand-black">
                    {nota.numeroDocumento}
                  </p>
                  <p className="truncate text-xs text-slate-400">{nota.tipoDocumentoTexto}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-xs text-slate-400">
                    {formatearFechaIsoADdMmYyyy(nota.fechaEmision)}
                  </span>
                  <CustomChipEstado>{nota.estadoCodigo}</CustomChipEstado>
                </div>
              </li>
            ))}
          </ul>

          {modo === "manual" ? (
            <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-amber-700">
              <FileWarning size={18} className="mt-0.5 shrink-0" />
              <p className="text-sm font-medium leading-snug">
                Estas notas también deben quedar anuladas en SUNAT. Esta acción solo
                actualiza su estado aquí en Safety Report; <span className="font-bold">verifica que ya las hayas anulado ante SUNAT</span>.
              </p>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
