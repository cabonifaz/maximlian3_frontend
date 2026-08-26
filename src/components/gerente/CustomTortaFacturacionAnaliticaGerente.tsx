import type {
  GrupoFacturacionAnaliticaDashboard,
  MetricaDesgloseFacturacionAnaliticaDashboard,
} from "@maximilian/shared/types/dashboard.type";

interface PropsCustomTortaFacturacionAnaliticaGerente {
  grupos: GrupoFacturacionAnaliticaDashboard[];
  monedaIcono: string;
  metrica: MetricaDesgloseFacturacionAnaliticaDashboard;
  obtenerColor: (grupo: GrupoFacturacionAnaliticaDashboard, indice: number) => string;
}

const RADIO_TORTA_FACTURACION_ANALITICA = 15.915;
const GROSOR_ANILLO_TORTA_FACTURACION_ANALITICA = 3.8;

export function CustomTortaFacturacionAnaliticaGerente({
  grupos,
  monedaIcono,
  metrica,
  obtenerColor,
}: PropsCustomTortaFacturacionAnaliticaGerente) {
  const esMonto = metrica === "monto";
  const obtenerValor = (grupo: GrupoFacturacionAnaliticaDashboard) =>
    esMonto ? grupo.montoFacturado : grupo.cantidadPedidos;
  const total = grupos.reduce((acumulado, grupo) => acumulado + obtenerValor(grupo), 0);

  if (grupos.length === 0 || total <= 0) {
    return <p className="text-xs italic text-slate-400">Sin datos en el período seleccionado.</p>;
  }

  const segmentos = calcularSegmentosTorta(grupos, total, obtenerColor, obtenerValor);
  const firmaSegmentos = segmentos.map((segmento) => `${segmento.grupo.id}:${segmento.valor}`).join("|");

  return (
    <div className="flex justify-center py-1">
      <svg
        key={firmaSegmentos}
        viewBox="0 0 36 36"
        className="h-32 w-32 -rotate-90 animate-in fade-in zoom-in-95 duration-500"
      >
        {segmentos.map(({ grupo, color, inicio, largo, valor, porcentaje }) => (
          <circle
            key={grupo.id}
            cx="18"
            cy="18"
            r={RADIO_TORTA_FACTURACION_ANALITICA}
            fill="transparent"
            stroke={color}
            strokeWidth={GROSOR_ANILLO_TORTA_FACTURACION_ANALITICA}
            strokeDasharray={`${largo} ${100 - largo}`}
            strokeDashoffset={-inicio}
            className="cursor-pointer transition-opacity hover:opacity-70"
          >
            <title>
              {grupo.etiqueta}: {esMonto ? `${monedaIcono}${valor.toFixed(2)}` : valor} (
              {porcentaje.toFixed(0)}%)
            </title>
          </circle>
        ))}
      </svg>
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
      largo: number;
      valor: number;
      porcentaje: number;
    }>
  >((segmentos, grupo, indice) => {
    const inicio = segmentos.at(-1) ? segmentos.at(-1)!.inicio + segmentos.at(-1)!.largo : 0;
    const valor = obtenerValor(grupo);
    const porcentaje = (valor / total) * 100;

    return [...segmentos, { grupo, color: obtenerColor(grupo, indice), inicio, largo: porcentaje, valor, porcentaje }];
  }, []);
}
