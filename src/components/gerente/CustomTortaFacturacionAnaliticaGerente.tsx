import { NumberTicker } from "@maximilian/components/common/shadcn/number-ticker";
import type {
  GrupoFacturacionAnaliticaDashboard,
  MetricaDesgloseFacturacionAnaliticaDashboard,
} from "@maximilian/shared/types/dashboard.type";

interface PropsCustomTortaFacturacionAnaliticaGerente {
  grupos: GrupoFacturacionAnaliticaDashboard[];
  monedaIcono: string;
  metrica: MetricaDesgloseFacturacionAnaliticaDashboard;
  obtenerColor: (grupo: GrupoFacturacionAnaliticaDashboard, indice: number) => string;
  obtenerEtiqueta?: (grupo: GrupoFacturacionAnaliticaDashboard) => string;
}

export function CustomTortaFacturacionAnaliticaGerente({
  grupos,
  monedaIcono,
  metrica,
  obtenerColor,
  obtenerEtiqueta,
}: PropsCustomTortaFacturacionAnaliticaGerente) {
  const esMonto = metrica === "monto";
  const obtenerValor = (grupo: GrupoFacturacionAnaliticaDashboard) =>
    esMonto ? grupo.montoFacturado : grupo.cantidadPedidos;
  const total = grupos.reduce((acumulado, grupo) => acumulado + obtenerValor(grupo), 0);

  if (grupos.length === 0 || total <= 0) {
    return <p className="text-xs italic text-slate-400">Sin datos en el período seleccionado.</p>;
  }

  const segmentos = calcularSegmentosTorta(grupos, total, obtenerColor, obtenerValor);

  const gradiente = segmentos
    .map((segmento) => `${segmento.color} ${segmento.inicio}% ${segmento.fin}%`)
    .join(", ");
  const firmaSegmentos = segmentos
    .map((segmento) => `${segmento.grupo.clave}:${segmento.valor}`)
    .join("|");

  return (
    <div className="flex items-center gap-5">
      <div
        className="relative h-28 w-28 shrink-0 rounded-full"
        style={{ backgroundImage: `conic-gradient(${gradiente})` }}
      >
        <div
          key={firmaSegmentos}
          className="animacion-crecer-torta-dashboard absolute inset-0 rounded-full"
        />
        <div className="absolute inset-3 rounded-full bg-white" />
      </div>
      <ul className="flex-1 space-y-2">
        {segmentos.map(({ grupo, color, porcentaje, valor }) => (
          <li key={grupo.clave} className="flex items-center justify-between gap-2 text-[11px]">
            <span className="flex min-w-0 items-center gap-2 font-medium text-slate-700">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="truncate">{obtenerEtiqueta?.(grupo) ?? grupo.etiqueta}</span>
            </span>
            <span className="shrink-0 text-slate-500">
              {esMonto ? monedaIcono : ""}
              <NumberTicker
                value={valor}
                decimalPlaces={esMonto ? 2 : 0}
                rigidez={260}
                className="tracking-normal text-inherit"
              />
            </span>
            <span className="w-9 shrink-0 text-right font-semibold text-slate-600">
              <NumberTicker
                value={porcentaje}
                decimalPlaces={0}
                rigidez={260}
                className="tracking-normal text-inherit"
              />
              %
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function calcularSegmentosTorta(
  grupos: GrupoFacturacionAnaliticaDashboard[],
  total: number,
  obtenerColor: (grupo: GrupoFacturacionAnaliticaDashboard, indice: number) => string,
  obtenerValor: (grupo: GrupoFacturacionAnaliticaDashboard) => number,
) {
  return grupos.reduce<
    Array<{
      grupo: GrupoFacturacionAnaliticaDashboard;
      color: string;
      inicio: number;
      fin: number;
      porcentaje: number;
      valor: number;
    }>
  >((segmentos, grupo, indice) => {
    const inicio = segmentos.at(-1)?.fin ?? 0;
    const valor = obtenerValor(grupo);
    const porcentaje = (valor / total) * 100;

    return [
      ...segmentos,
      { grupo, color: obtenerColor(grupo, indice), inicio, fin: inicio + porcentaje, porcentaje, valor },
    ];
  }, []);
}
