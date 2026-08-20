import { CustomChipEstado } from "@maximilian/components/common/CustomChipEstado";
import { NumberTicker } from "@maximilian/components/common/shadcn/number-ticker";
import { ESTILOS_ESTADO_FACTURA_ANALITICA_DASHBOARD } from "@maximilian/shared/constants/components/gerente/facturacion-analitica-dashboard.constants";
import type { GrupoEstadoFacturacionAnaliticaDashboard } from "@maximilian/shared/types/dashboard.type";

interface PropsCustomEstadoFacturasAnaliticaGerente {
  desglosePorEstado: GrupoEstadoFacturacionAnaliticaDashboard[];
  monedaIcono: string;
}

export function CustomEstadoFacturasAnaliticaGerente({
  desglosePorEstado,
  monedaIcono,
}: PropsCustomEstadoFacturasAnaliticaGerente) {
  const totalFacturas = desglosePorEstado.reduce(
    (total, grupo) => total + grupo.cantidadFacturas,
    0,
  );

  return (
    <section className="h-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-5 text-sm font-bold text-slate-800">Estado de las facturas</h3>

      {desglosePorEstado.length === 0 ? (
        <p className="py-6 text-center text-xs italic text-slate-400">
          No hay facturas en el período seleccionado.
        </p>
      ) : (
        <div className="space-y-3">
          {desglosePorEstado.map((grupo) => {
            const estilo = ESTILOS_ESTADO_FACTURA_ANALITICA_DASHBOARD[grupo.estado];

            return (
              <div key={grupo.estado} className="flex items-center justify-between gap-3">
                <CustomChipEstado claseColor={estilo.clase}>{estilo.texto}</CustomChipEstado>
                <div className="flex flex-1 items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="animacion-crecer-horizontal-dashboard h-full rounded-full"
                      style={{
                        backgroundColor: estilo.colorBarra,
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
