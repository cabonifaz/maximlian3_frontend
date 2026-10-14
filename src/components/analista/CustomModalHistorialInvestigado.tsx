import { useState } from "react";
import { History, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomModalHistorialInformesCompania } from "@maximilian/components/common/CustomModalHistorialInformesCompania";
import { useCompaniasInvestigado } from "@maximilian/hooks/useCompaniasInvestigado";
import type { CompaniaListaItem } from "@maximilian/shared/types/compania.type";
import type { CompaniaNoticiaDetalleListaItem } from "@maximilian/shared/types/compania-noticia-detalle.type";
import type { InformeHistorialCompania } from "@maximilian/shared/types/informe.type";

interface PropsCustomModalHistorialInvestigado {
  estaAbierto: boolean;
  nombreInvestigado: string;
  onCerrar: () => void;
  onRellenar: (informe: InformeHistorialCompania) => void;
}

export function CustomModalHistorialInvestigado({
  estaAbierto,
  nombreInvestigado,
  onCerrar,
  onRellenar,
}: PropsCustomModalHistorialInvestigado) {
  const [empresaHistorial, setEmpresaHistorial] =
    useState<CompaniaNoticiaDetalleListaItem | null>(null);
  const { companias, estaCargando, hayError, recargar } = useCompaniasInvestigado(
    nombreInvestigado,
    estaAbierto,
  );

  if (!estaAbierto) return null;

  const cerrar = () => {
    setEmpresaHistorial(null);
    onCerrar();
  };

  return (
    <div className="fixed left-0 top-0 z-[60] flex h-[100dvh] w-[100dvw] items-center justify-center overflow-hidden bg-black/40 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-brand-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-8 py-6">
          <div className="min-w-0 space-y-1">
            <h2 className="text-xl font-bold text-brand-black">Historial del investigado</h2>
            <p className="truncate text-sm font-semibold text-gray-500">{nombreInvestigado}</p>
          </div>
          <CustomButton variant="ghost" size="icon" onClick={cerrar}>
            <X size={20} className="text-gray-400" />
          </CustomButton>
        </div>

        <div className="min-h-0 space-y-3 overflow-y-auto px-8 py-6">
          {estaCargando ? (
            <p className="py-6 text-center text-sm font-medium text-gray-500">Buscando compañías...</p>
          ) : hayError ? (
            <div className="flex flex-col items-center gap-3 py-6 text-sm font-semibold text-gray-400">
              <p>No se pudo buscar el historial del investigado.</p>
              <CustomButton variant="secondary" size="sm" onClick={() => void recargar()}>
                Reintentar
              </CustomButton>
            </div>
          ) : companias.length === 0 ? (
            <p className="py-6 text-center text-sm font-semibold text-gray-400">
              No se encontraron compañías con informes para este investigado.
            </p>
          ) : (
            companias.map(({ compania, esCoincidenciaExacta }) => (
              <div
                key={compania.idCompania}
                className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 p-4"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-bold text-slate-800">{compania.nombreCompleto}</p>
                    {esCoincidenciaExacta ? (
                      <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                        Coincidencia exacta
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs font-semibold text-slate-400">
                    {[compania.numeroDocumento, compania.pais].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <CustomButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setEmpresaHistorial(convertirAEmpresaHistorial(compania))}
                >
                  <History size={14} />
                  Ver historial
                </CustomButton>
              </div>
            ))
          )}
        </div>
      </div>

      <CustomModalHistorialInformesCompania
        key={empresaHistorial?.idCompania ?? "historial-cerrado"}
        empresa={empresaHistorial}
        onCerrar={() => setEmpresaHistorial(null)}
        onRellenar={(informe) => {
          setEmpresaHistorial(null);
          onRellenar(informe);
        }}
      />
    </div>
  );
}

function convertirAEmpresaHistorial(compania: CompaniaListaItem): CompaniaNoticiaDetalleListaItem {
  return {
    idCompania: compania.idCompania,
    razonSocial: compania.nombreCompleto,
    numeroDocumento: compania.numeroDocumento,
    pais: compania.pais,
    direccion: compania.direccion ?? "",
    telefono: compania.telefono,
    actividadComercial: "",
    trabajadores: 0,
  };
}
