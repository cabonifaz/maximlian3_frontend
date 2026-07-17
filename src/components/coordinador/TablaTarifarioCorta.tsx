import { useTablaTarifarioCorta } from "@maximilian/hooks/useTablaTarifarioCorta";
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
      {[1, 2, 3].map((indice) => (
        <td key={indice} className="py-3 px-4">
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
  const { alternarTarifario, entries, isLoading } = useTablaTarifarioCorta({
    idCliente,
    idPais,
    idTarifarioSeleccionado,
    idTipoProducto,
    idTipoTramite,
    onTarifarioSelect,
    soloLectura,
  });

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
                  Tipo Tramite
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
                  <td
                    colSpan={4}
                    className="py-4 px-4 text-center text-sm text-gray-400"
                  >
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
                  <td
                    colSpan={4}
                    className="py-4 px-4 text-center text-sm text-gray-400"
                  >
                    Sin tarifas para los filtros seleccionados
                  </td>
                </tr>
              ) : (
                entries.map((entry) => {
                  const estaSeleccionado =
                    entry.idTarifario === idTarifarioSeleccionado;
                  return (
                    <tr
                      key={entry.idTarifario}
                      onClick={() => alternarTarifario(entry)}
                      className={`${soloLectura ? "cursor-default" : "cursor-pointer"} transition-colors ${
                        estaSeleccionado
                          ? "bg-brand-wine/5"
                          : "hover:bg-gray-50/50"
                      }`}
                    >
                      <td className="py-3 px-3 w-10">
                        <input
                          type="checkbox"
                          checked={estaSeleccionado}
                          onChange={() => alternarTarifario(entry)}
                          onClick={(evento) => evento.stopPropagation()}
                          disabled={soloLectura}
                          className={`w-4 h-4 accent-brand-wine ${soloLectura ? "cursor-not-allowed" : "cursor-pointer"}`}
                        />
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {entry.tipoTramite}
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-800">
                        {entry.precio}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {entry.moneda}
                      </td>
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
