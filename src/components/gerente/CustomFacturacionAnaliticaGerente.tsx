import { useFacturacionAnaliticaDashboard } from "@maximilian/hooks/useFacturacionAnaliticaDashboard";
import { CustomFiltrosFacturacionAnaliticaGerente } from "./CustomFiltrosFacturacionAnaliticaGerente";
import { CustomIndicadoresFacturacionAnaliticaGerente } from "./CustomIndicadoresFacturacionAnaliticaGerente";
import { CustomEvolucionFacturacionAnaliticaGerente } from "./CustomEvolucionFacturacionAnaliticaGerente";
import { CustomDesglosesFacturacionAnaliticaGerente } from "./CustomDesglosesFacturacionAnaliticaGerente";
import { CustomEstadoFacturasAnaliticaGerente } from "./CustomEstadoFacturasAnaliticaGerente";
import { CustomTablaClientesFacturacionAnaliticaGerente } from "./CustomTablaClientesFacturacionAnaliticaGerente";

export function CustomFacturacionAnaliticaGerente() {
  const {
    filtros,
    actualizarFiltros,
    limpiarFiltros,
    fechasInvalidas,
    indicadores,
    desglosePorTramite,
    desglosePorPais,
    desglosePorEstado,
    evolucionMensual,
    resumenClientes,
  } = useFacturacionAnaliticaDashboard();

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-slate-800">Facturación</h2>
        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-amber-600">
          Vista preliminar (mock)
        </span>
      </div>
      <p className="mb-4 text-xs text-slate-400">
        ¿Cuánto le estoy facturando o le voy a facturar a cada cliente hasta determinada fecha y
        cómo se compone ese monto?
      </p>

      <CustomFiltrosFacturacionAnaliticaGerente
        filtros={filtros}
        fechasInvalidas={fechasInvalidas}
        onActualizarFiltros={actualizarFiltros}
        onLimpiarFiltros={limpiarFiltros}
      />

      <CustomIndicadoresFacturacionAnaliticaGerente
        indicadores={indicadores}
        fechaHasta={filtros.fechaHasta}
      />

      <div className="mb-5 grid gap-5 xl:grid-cols-2">
        <CustomEvolucionFacturacionAnaliticaGerente
          evolucionMensual={evolucionMensual}
          monedaIcono={indicadores.monedaIcono}
        />
        <CustomEstadoFacturasAnaliticaGerente
          desglosePorEstado={desglosePorEstado}
          monedaIcono={indicadores.monedaIcono}
        />
      </div>

      <div className="mb-5">
        <CustomDesglosesFacturacionAnaliticaGerente
          desglosePorTramite={desglosePorTramite}
          desglosePorPais={desglosePorPais}
          monedaIcono={indicadores.monedaIcono}
        />
      </div>

      <CustomTablaClientesFacturacionAnaliticaGerente resumenClientes={resumenClientes} />
    </section>
  );
}
