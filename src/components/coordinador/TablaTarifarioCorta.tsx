import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { servicioCliente } from "@maximilian/services/cliente.service";
import type { TarifarioCortaEntry } from "@maximilian/shared/types/cliente.type";

interface TablaTarifarioCortaProps {
  idCliente: number | undefined;
  idTipoProducto: number | undefined;
  idTipoTramite: number | undefined;
  idPais: number | undefined;
  idTarifarioSeleccionado: number | undefined;
  onTarifarioSelect: (entry: TarifarioCortaEntry | undefined) => void;
  error?: string;
  soloLectura?: boolean;
}

function SkeletonRow() {
  return (
    <tr>
      <td className="py-3 px-3 w-10" />
      {[1, 2, 3].map((i) => (
        <td key={i} className="py-3 px-4">
          <div className="h-3.5 bg-gray-200 rounded animate-pulse w-3/4" />
        </td>
      ))}
    </tr>
  );
}

export function TablaTarifarioCorta({
  idCliente,
  idTipoProducto,
  idTipoTramite,
  idPais,
  idTarifarioSeleccionado,
  onTarifarioSelect,
  error,
  soloLectura = false,
}: TablaTarifarioCortaProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["tarifario", "listaCorta", { idCliente, idTipoProducto, idTipoTramite, idPais }],
    queryFn: () =>
      servicioCliente.listTarifarioCorta({
        idCliente: idCliente!,
        IdTipoProducto: idTipoProducto,
        IdTipoTramite: idTipoTramite,
        IdPais: idPais,
      }),
    enabled: !!idCliente,
  });

  const entries: TarifarioCortaEntry[] = data ?? [];

  const onTarifarioSelectRef = useRef(onTarifarioSelect);
  onTarifarioSelectRef.current = onTarifarioSelect;

  const initialSelectionDone = useRef(false);

  // Re-arm initial selection when the client changes (new modal open or client swap)
  useEffect(() => {
    initialSelectionDone.current = false;
  }, [idCliente]);

  // Deselect the row if it's no longer present in the current result set.
  // Also triggers once on initial load when idTarifarioSeleccionado is pre-set (edit mode),
  // so the parent can derive idPais / idTipoTramite from the matching entry.
  useEffect(() => {
    if (data == null) return;
    if (!initialSelectionDone.current) {
      initialSelectionDone.current = true;
      if (idTarifarioSeleccionado != null) {
        const entry = data.find((e) => e.idTarifario === idTarifarioSeleccionado) ?? undefined;
        onTarifarioSelectRef.current(entry);
      }
      return;
    }
    if (idTarifarioSeleccionado != null && !data.some((e) => e.idTarifario === idTarifarioSeleccionado)) {
      onTarifarioSelectRef.current(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const handleCheckbox = (entry: TarifarioCortaEntry) => {
    if (soloLectura) return;
    onTarifarioSelect(idTarifarioSeleccionado === entry.idTarifario ? undefined : entry);
  };

  return (
    <div>
      {error && <p className="text-xs text-red-500 mb-1">{error}</p>}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-y-auto max-h-65">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-gray-50 z-10">
              <tr className="border-b border-gray-200">
                <th className="py-2.5 px-3 w-10" />
                <th className="text-left py-2.5 px-4 text-xs font-bold text-gray-400 uppercase tracking-wide">
                  Tipo Trámite
                </th>
                <th className="text-left py-2.5 px-4 text-xs font-bold text-gray-400 uppercase tracking-wide">
                  Precio
                </th>
                <th className="text-left py-2.5 px-4 text-xs font-bold text-gray-400 uppercase tracking-wide">
                  Moneda
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {!idCliente ? (
                <tr>
                  <td colSpan={4} className="py-4 px-4 text-center text-sm text-gray-400">
                    Seleccione un cliente para ver las tarifas
                  </td>
                </tr>
              ) : isLoading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 px-4 text-center text-sm text-gray-400">
                    Sin tarifas para los filtros seleccionados
                  </td>
                </tr>
              ) : (
                entries.map((entry) => {
                  const isSelected = entry.idTarifario === idTarifarioSeleccionado;
                  return (
                    <tr
                      key={entry.idTarifario}
                      onClick={() => handleCheckbox(entry)}
                      className={`${soloLectura ? "cursor-default" : "cursor-pointer"} transition-colors ${
                        isSelected ? "bg-brand-wine/5" : "hover:bg-gray-50/50"
                      }`}
                    >
                      <td className="py-3 px-3 w-10">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleCheckbox(entry)}
                          onClick={(e) => e.stopPropagation()}
                          disabled={soloLectura}
                          className={`w-4 h-4 accent-brand-wine ${soloLectura ? "cursor-not-allowed" : "cursor-pointer"}`}
                        />
                      </td>
                      <td className="py-3 px-4 text-gray-700">{entry.tipoTramite}</td>
                      <td className="py-3 px-4 font-semibold text-gray-800">{entry.precio}</td>
                      <td className="py-3 px-4 text-gray-600">{entry.moneda}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
