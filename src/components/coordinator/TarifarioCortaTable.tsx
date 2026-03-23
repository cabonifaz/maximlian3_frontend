import { useQuery } from "@tanstack/react-query";
import { clientService } from "@maximilian/services/client.service";
import type { TarifarioCortaEntry } from "@maximilian/shared/types/client.type";

interface TarifarioCortaTableProps {
  idCliente: number | undefined;
  idTipoProducto: number | undefined;
  idTipoTramite: number | undefined;
  idPais: number | undefined;
  selectedIdTarifario: number | undefined;
  onTarifarioSelect: (id: number | undefined) => void;
  error?: string;
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

export function TarifarioCortaTable({
  idCliente,
  idTipoProducto,
  idTipoTramite,
  idPais,
  selectedIdTarifario,
  onTarifarioSelect,
  error,
}: TarifarioCortaTableProps) {
  const visible = !!idCliente;

  const { data, isLoading } = useQuery({
    queryKey: ["tarifario", "listaCorta", { idCliente, idTipoProducto, idTipoTramite, idPais }],
    queryFn: () =>
      clientService.listTarifarioCorta({
        idCliente: idCliente!,
        idTipoProducto,
        idTipoTramite,
        idPais,
      }),
    enabled: visible,
  });

  const entries: TarifarioCortaEntry[] = data ?? [];

  const handleCheckbox = (id: number) => {
    onTarifarioSelect(selectedIdTarifario === id ? undefined : id);
  };

  return (
    <div
      className={`overflow-hidden transition-all duration-300 ${
        visible ? "opacity-100 max-h-[300px]" : "opacity-0 max-h-0"
      }`}
    >
      {error && <p className="text-xs text-red-500 mb-1">{error}</p>}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-y-auto max-h-[260px]">
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
            {isLoading ? (
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
                const isSelected = entry.idTarifario === selectedIdTarifario;
                return (
                  <tr
                    key={entry.idTarifario}
                    onClick={() => handleCheckbox(entry.idTarifario)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? "bg-brand-wine/5" : "hover:bg-gray-50/50"
                    }`}
                  >
                    <td className="py-3 px-3 w-10">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleCheckbox(entry.idTarifario)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 accent-brand-wine cursor-pointer"
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
