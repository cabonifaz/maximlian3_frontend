import { CustomChipEstado } from "@maximilian/components/common/CustomChipEstado";
import { NumberTicker } from "@maximilian/components/common/shadcn/number-ticker";
import {
  CANTIDAD_MAXIMA_ESTADOS_FACTURACION_ANALITICA_DASHBOARD,
  COLOR_OTROS_ESTADOS_FACTURACION_ANALITICA_DASHBOARD,
  ETIQUETA_OTROS_ESTADOS_FACTURACION_ANALITICA_DASHBOARD,
  ID_OTROS_ESTADOS_FACTURACION_ANALITICA_DASHBOARD,
  PALETA_COLORES_DESGLOSE_FACTURACION_ANALITICA_DASHBOARD,
} from "@maximilian/shared/constants/components/gerente/facturacion-analitica-dashboard.constants";
import type { GrupoEstadoFacturacionAnaliticaDashboard } from "@maximilian/shared/types/dashboard.type";

interface PropsCustomEstadoFacturasAnaliticaGerente {
  desglosePorEstado: GrupoEstadoFacturacionAnaliticaDashboard[];
  monedaIcono: string;
}

function agruparTop5ConOtros(
  grupos: GrupoEstadoFacturacionAnaliticaDashboard[],
): GrupoEstadoFacturacionAnaliticaDashboard[] {
  if (grupos.length <= CANTIDAD_MAXIMA_ESTADOS_FACTURACION_ANALITICA_DASHBOARD) {
    return grupos;
  }

  const ordenados = [...grupos].sort((a, b) => b.cantidadFacturas - a.cantidadFacturas);
  const visibles = ordenados.slice(0, CANTIDAD_MAXIMA_ESTADOS_FACTURACION_ANALITICA_DASHBOARD);
  const resto = ordenados.slice(CANTIDAD_MAXIMA_ESTADOS_FACTURACION_ANALITICA_DASHBOARD);

  const otros: GrupoEstadoFacturacionAnaliticaDashboard = {
    idEstadoMaestro: ID_OTROS_ESTADOS_FACTURACION_ANALITICA_DASHBOARD,
    estado: ETIQUETA_OTROS_ESTADOS_FACTURACION_ANALITICA_DASHBOARD,
    cantidadFacturas: resto.reduce((total, grupo) => total + grupo.cantidadFacturas, 0),
    montoFacturado: resto.reduce((total, grupo) => total + grupo.montoFacturado, 0),
  };

  return [...visibles, otros];
}

function obtenerColorEstado(grupo: GrupoEstadoFacturacionAnaliticaDashboard, indice: number) {
  if (grupo.idEstadoMaestro === ID_OTROS_ESTADOS_FACTURACION_ANALITICA_DASHBOARD) {
    return COLOR_OTROS_ESTADOS_FACTURACION_ANALITICA_DASHBOARD;
  }

  return (
    PALETA_COLORES_DESGLOSE_FACTURACION_ANALITICA_DASHBOARD[
      indice % PALETA_COLORES_DESGLOSE_FACTURACION_ANALITICA_DASHBOARD.length
    ] ?? COLOR_OTROS_ESTADOS_FACTURACION_ANALITICA_DASHBOARD
  );
}

export function CustomEstadoFacturasAnaliticaGerente({
  desglosePorEstado,
  monedaIcono,
}: PropsCustomEstadoFacturasAnaliticaGerente) {
  const grupos = agruparTop5ConOtros(desglosePorEstado);
  const totalFacturas = grupos.reduce((total, grupo) => total + grupo.cantidadFacturas, 0);

  return (
    <section className="h-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-5 text-sm font-bold text-slate-800">Estado de las facturas</h3>

      {grupos.length === 0 ? (
        <p className="py-6 text-center text-xs italic text-slate-400">
          No hay facturas en el período seleccionado.
        </p>
      ) : (
        <div className="space-y-3">
          {grupos.map((grupo, indice) => {
            const color = obtenerColorEstado(grupo, indice);

            return (
              <div key={grupo.idEstadoMaestro} className="flex items-center justify-between gap-3">
                <div className="w-32 shrink-0">
                  <CustomChipEstado
                    colorTexto={color}
                    colorFondo={`${color}1a`}
                    forma="rectangular"
                    className="max-w-full whitespace-normal break-words text-left leading-snug"
                    title={grupo.estado}
                  >
                    {grupo.estado}
                  </CustomChipEstado>
                </div>
                <div className="flex flex-1 items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="animacion-crecer-horizontal-dashboard h-full rounded-full"
                      style={{
                        backgroundColor: color,
                        width: totalFacturas > 0
                          ? `${(grupo.cantidadFacturas / totalFacturas) * 100}%`
                          : "0%",
                      }}
                    />
                  </div>
                </div>
                <span className="w-10 shrink-0 text-right text-xs font-bold text-slate-700">
                  <NumberTicker value={grupo.cantidadFacturas} className="tracking-normal text-inherit" />
                </span>
                <span className="w-24 shrink-0 text-right text-[10px] text-slate-400">
                  {monedaIcono}
                  <NumberTicker
                    value={grupo.montoFacturado}
                    decimalPlaces={2}
                    className="tracking-normal text-inherit"
                  />
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
