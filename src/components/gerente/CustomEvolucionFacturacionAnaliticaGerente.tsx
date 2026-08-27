import { CustomBarrasEvolucionDashboardGerente } from "./CustomBarrasEvolucionDashboardGerente";
import { OPCIONES_GRANULARIDAD_FACTURACION_DASHBOARD } from "@maximilian/shared/constants/pages/Gerente/dashboard-tiempo.constants";
import type {
  EvolucionFacturacionAnaliticaDashboard,
  GranularidadTiempoDashboard,
  MetricaDesgloseFacturacionAnaliticaDashboard,
} from "@maximilian/shared/types/dashboard.type";

interface PropsCustomEvolucionFacturacionAnaliticaGerente {
  evolucion: EvolucionFacturacionAnaliticaDashboard[];
  monedaIcono: string;
  granularidad: GranularidadTiempoDashboard;
  onCambiarGranularidad: (granularidad: GranularidadTiempoDashboard) => void;
  metricaDesglose: MetricaDesgloseFacturacionAnaliticaDashboard;
}

export function CustomEvolucionFacturacionAnaliticaGerente({
  evolucion,
  monedaIcono,
  granularidad,
  onCambiarGranularidad,
  metricaDesglose,
}: PropsCustomEvolucionFacturacionAnaliticaGerente) {
  const esMonto = metricaDesglose === "monto";
  const datos = evolucion.map((punto) => ({
    periodo: punto.periodo,
    etiqueta: punto.etiqueta,
    valor: esMonto ? punto.montoFacturado : punto.cantidadPedidos,
  }));

  return (
    <section className="h-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-slate-800">
          Evolución de {esMonto ? "facturación" : "pedidos"} por {granularidad === "dia" ? "día" : granularidad === "semana" ? "semana" : "mes"}
        </h3>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
          {OPCIONES_GRANULARIDAD_FACTURACION_DASHBOARD.map((opcion) => (
            <button
              key={opcion.valor}
              type="button"
              onClick={() => onCambiarGranularidad(opcion.valor)}
              className={`rounded-md px-2.5 py-1 text-[10px] font-semibold transition ${
                granularidad === opcion.valor
                  ? "bg-white text-brand-wine shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {opcion.etiqueta}
            </button>
          ))}
        </div>
      </div>

      <CustomBarrasEvolucionDashboardGerente datos={datos} prefijo={esMonto ? monedaIcono : ""} />
    </section>
  );
}
