import { CustomTortaFacturacionAnaliticaGerente } from "./CustomTortaFacturacionAnaliticaGerente";
import {
  CLAVE_OTROS_PAISES_FACTURACION_ANALITICA_DASHBOARD,
  COLOR_OTROS_PAISES_FACTURACION_ANALITICA_DASHBOARD,
  ESTILOS_TRAMITE_FACTURACION_ANALITICA_DASHBOARD,
  PALETA_COLORES_PAIS_FACTURACION_ANALITICA_DASHBOARD,
} from "@maximilian/shared/constants/components/gerente/facturacion-analitica-dashboard.constants";
import type {
  GrupoFacturacionAnaliticaDashboard,
  TramiteFacturacionAnaliticaDashboard,
} from "@maximilian/shared/types/dashboard.type";

interface PropsCustomDesglosesFacturacionAnaliticaGerente {
  desglosePorTramite: GrupoFacturacionAnaliticaDashboard[];
  desglosePorPais: GrupoFacturacionAnaliticaDashboard[];
  monedaIcono: string;
}

export function CustomDesglosesFacturacionAnaliticaGerente({
  desglosePorTramite,
  desglosePorPais,
  monedaIcono,
}: PropsCustomDesglosesFacturacionAnaliticaGerente) {
  return (
    <section className="h-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-5 text-sm font-bold text-slate-800">Facturación por trámite y país</h3>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Trámite</h4>
          <CustomTortaFacturacionAnaliticaGerente
            grupos={desglosePorTramite}
            monedaIcono={monedaIcono}
            obtenerColor={(grupo) =>
              ESTILOS_TRAMITE_FACTURACION_ANALITICA_DASHBOARD[
                grupo.clave as TramiteFacturacionAnaliticaDashboard
              ]?.color ?? "#94a3b8"
            }
            obtenerEtiqueta={(grupo) =>
              ESTILOS_TRAMITE_FACTURACION_ANALITICA_DASHBOARD[
                grupo.clave as TramiteFacturacionAnaliticaDashboard
              ]?.texto ?? grupo.etiqueta
            }
          />
        </div>

        <div>
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">País</h4>
          <CustomTortaFacturacionAnaliticaGerente
            grupos={desglosePorPais}
            monedaIcono={monedaIcono}
            obtenerColor={(grupo, indice) =>
              grupo.clave === CLAVE_OTROS_PAISES_FACTURACION_ANALITICA_DASHBOARD
                ? COLOR_OTROS_PAISES_FACTURACION_ANALITICA_DASHBOARD
                : (PALETA_COLORES_PAIS_FACTURACION_ANALITICA_DASHBOARD[indice] ?? "#94a3b8")
            }
          />
        </div>
      </div>
    </section>
  );
}
