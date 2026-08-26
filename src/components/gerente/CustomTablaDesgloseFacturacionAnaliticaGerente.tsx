import { NumberTicker } from "@maximilian/components/common/shadcn/number-ticker";
import type {
  GrupoFacturacionAnaliticaDashboard,
  MetricaDesgloseFacturacionAnaliticaDashboard,
} from "@maximilian/shared/types/dashboard.type";

interface PropsCustomTablaDesgloseFacturacionAnaliticaGerente {
  etiquetaColumna: string;
  grupos: GrupoFacturacionAnaliticaDashboard[];
  monedaIcono: string;
  metrica: MetricaDesgloseFacturacionAnaliticaDashboard;
  obtenerColor: (grupo: GrupoFacturacionAnaliticaDashboard, indice: number) => string;
}

export function CustomTablaDesgloseFacturacionAnaliticaGerente({
  etiquetaColumna,
  grupos,
  monedaIcono,
  metrica,
  obtenerColor,
}: PropsCustomTablaDesgloseFacturacionAnaliticaGerente) {
  const esMonto = metrica === "monto";
  const obtenerValor = (grupo: GrupoFacturacionAnaliticaDashboard) =>
    esMonto ? grupo.montoFacturado : grupo.cantidadPedidos;

  const mapaColores = new Map(grupos.map((grupo, indice) => [grupo.id, obtenerColor(grupo, indice)]));
  const total = grupos.reduce((acumulado, grupo) => acumulado + obtenerValor(grupo), 0);
  const gruposOrdenados = [...grupos].sort((a, b) => obtenerValor(b) - obtenerValor(a));

  if (gruposOrdenados.length === 0) {
    return <p className="text-xs italic text-slate-400">Sin datos en el período seleccionado.</p>;
  }

  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="border-b border-slate-100 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          <th className="pb-2 pr-2 font-semibold">{etiquetaColumna}</th>
          <th className="pb-2 px-2 text-right font-semibold">Pedidos</th>
          <th className="pb-2 px-2 text-right font-semibold">%</th>
          <th className="pb-2 pl-2 text-right font-semibold">Monto facturado</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {gruposOrdenados.map((grupo) => {
          const porcentaje = total > 0 ? (obtenerValor(grupo) / total) * 100 : 0;

          return (
            <tr key={grupo.id}>
              <td className="py-2 pr-2 font-semibold text-slate-700">
                <span className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: mapaColores.get(grupo.id) }}
                  />
                  <span className="truncate">{grupo.etiqueta}</span>
                </span>
              </td>
              <td className="py-2 px-2 text-right text-slate-600">
                <NumberTicker value={grupo.cantidadPedidos} rigidez={260} className="tracking-normal text-inherit" />
              </td>
              <td className="py-2 px-2 text-right text-slate-500">
                <NumberTicker
                  value={porcentaje}
                  decimalPlaces={0}
                  rigidez={260}
                  className="tracking-normal text-inherit"
                />
                %
              </td>
              <td className="py-2 pl-2 text-right font-bold text-slate-800">
                {monedaIcono}
                <NumberTicker
                  value={grupo.montoFacturado}
                  decimalPlaces={2}
                  rigidez={260}
                  className="tracking-normal text-inherit"
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
