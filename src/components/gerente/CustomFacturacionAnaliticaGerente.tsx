import { Loader2 } from "lucide-react";
import { useFacturacionAnaliticaDashboard } from "@maximilian/hooks/useFacturacionAnaliticaDashboard";
import { OPCIONES_METRICA_DESGLOSE_FACTURACION_DASHBOARD } from "@maximilian/shared/constants/pages/Gerente/dashboard-tiempo.constants";
import { CustomFiltrosFacturacionAnaliticaGerente } from "./CustomFiltrosFacturacionAnaliticaGerente";
import { CustomIndicadoresFacturacionAnaliticaGerente } from "./CustomIndicadoresFacturacionAnaliticaGerente";
import { CustomEvolucionFacturacionAnaliticaGerente } from "./CustomEvolucionFacturacionAnaliticaGerente";
import { CustomDesglosesFacturacionAnaliticaGerente } from "./CustomDesglosesFacturacionAnaliticaGerente";
import { CustomEstadoFacturasAnaliticaGerente } from "./CustomEstadoFacturasAnaliticaGerente";
import { CustomTablaClientesFacturacionAnaliticaGerente } from "./CustomTablaClientesFacturacionAnaliticaGerente";
import { CustomCargadorTarjetaDashboard } from "./CustomCargadorTarjetaDashboard";
import { CustomErrorTarjetaDashboard } from "./CustomErrorTarjetaDashboard";

export function CustomFacturacionAnaliticaGerente() {
  const {
    filtros,
    actualizarFiltros,
    limpiarFiltros,
    fechasInvalidas,
    granularidad,
    cambiarGranularidad,
    metricaDesglose,
    cambiarMetricaDesglose,
    indicadores,
    desglosePorTramite,
    desglosePorPais,
    desglosePorEstado,
    evolucion,
    estaCargandoEvolucion,
    resumenClientes,
    estaCargando,
    estaActualizando,
    haError,
    reintentar,
  } = useFacturacionAnaliticaDashboard();

  if (estaCargando) {
    return <CustomCargadorTarjetaDashboard titulo="facturación analítica" variante="grafica" />;
  }

  if (haError) {
    return <CustomErrorTarjetaDashboard titulo="la facturación analítica" onReintentar={reintentar} />;
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-1 flex items-center gap-2 text-sm font-bold text-slate-800">
        Facturación
        {estaActualizando ? <Loader2 size={12} className="animate-spin text-slate-400" /> : null}
      </h2>
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

      <div className="mb-5 flex items-center justify-end gap-2">
        <span className="text-[10px] font-semibold uppercase text-slate-400">Ver por:</span>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
          {OPCIONES_METRICA_DESGLOSE_FACTURACION_DASHBOARD.map((opcion) => (
            <button
              key={opcion.valor}
              type="button"
              onClick={() => cambiarMetricaDesglose(opcion.valor)}
              className={`rounded-md px-2.5 py-1 text-[10px] font-semibold transition ${
                metricaDesglose === opcion.valor
                  ? "bg-white text-brand-wine shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {opcion.etiqueta}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5 grid gap-5 xl:grid-cols-2">
        <CustomEvolucionFacturacionAnaliticaGerente
          evolucion={evolucion}
          monedaIcono={indicadores.monedaIcono}
          granularidad={granularidad}
          onCambiarGranularidad={cambiarGranularidad}
          metricaDesglose={metricaDesglose}
          estaCargando={estaCargandoEvolucion}
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
          metricaDesglose={metricaDesglose}
        />
      </div>

      <CustomTablaClientesFacturacionAnaliticaGerente resumenClientes={resumenClientes} />
    </section>
  );
}
