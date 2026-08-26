import { CustomTortaFacturacionAnaliticaGerente } from "./CustomTortaFacturacionAnaliticaGerente";
import { PALETA_COLORES_DESGLOSE_FACTURACION_ANALITICA_DASHBOARD } from "@maximilian/shared/constants/components/gerente/facturacion-analitica-dashboard.constants";
import type {
  GrupoFacturacionAnaliticaDashboard,
  MetricaDesgloseFacturacionAnaliticaDashboard,
} from "@maximilian/shared/types/dashboard.type";

function obtenerColorPorIndice(_grupo: GrupoFacturacionAnaliticaDashboard, indice: number) {
  return (
    PALETA_COLORES_DESGLOSE_FACTURACION_ANALITICA_DASHBOARD[
      indice % PALETA_COLORES_DESGLOSE_FACTURACION_ANALITICA_DASHBOARD.length
    ] ?? "#94a3b8"
  );
}

interface PropsCustomDesglosesFacturacionAnaliticaGerente {
  desglosePorTramite: GrupoFacturacionAnaliticaDashboard[];
  desglosePorPais: GrupoFacturacionAnaliticaDashboard[];
  monedaIcono: string;
  metricaDesglose: MetricaDesgloseFacturacionAnaliticaDashboard;
}

export function CustomDesglosesFacturacionAnaliticaGerente({
  desglosePorTramite,
  desglosePorPais,
  monedaIcono,
  metricaDesglose,
}: PropsCustomDesglosesFacturacionAnaliticaGerente) {
  return (
    <section className="h-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-5 text-sm font-bold text-slate-800">
        {metricaDesglose === "monto" ? "Facturación" : "Pedidos"} por trámite y país
      </h3>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Trámite</h4>
          <CustomTortaFacturacionAnaliticaGerente
            grupos={desglosePorTramite}
            monedaIcono={monedaIcono}
            metrica={metricaDesglose}
            obtenerColor={obtenerColorPorIndice}
          />
        </div>

        <div>
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">País</h4>
          <CustomTortaFacturacionAnaliticaGerente
            grupos={desglosePorPais}
            monedaIcono={monedaIcono}
            metrica={metricaDesglose}
            obtenerColor={obtenerColorPorIndice}
          />
        </div>
      </div>
    </section>
  );
}
