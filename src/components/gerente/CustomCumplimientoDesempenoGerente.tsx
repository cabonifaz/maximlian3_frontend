import { useDesempenoColaboradoresDashboard } from "@maximilian/hooks/useDesempenoColaboradoresDashboard";
import { CustomFiltrosDesempenoColaboradoresGerente } from "./CustomFiltrosDesempenoColaboradoresGerente";
import { CustomEvolucionDesempenoColaboradoresGerente } from "./CustomEvolucionDesempenoColaboradoresGerente";
import { CustomTablaDesempenoColaboradoresGerente } from "./CustomTablaDesempenoColaboradoresGerente";

export function CustomCumplimientoDesempenoGerente() {
  const {
    filtros,
    actualizarFiltros,
    limpiarFiltros,
    fechasInvalidas,
    granularidad,
    cambiarGranularidad,
    evolucion,
    resumenColaboradores,
    pagina,
    cambiarPagina,
    totalRegistrosColaboradores,
    totalPaginasColaboradores,
    estaCargandoColaboradores,
    hayErrorColaboradores,
    reintentarColaboradores,
  } = useDesempenoColaboradoresDashboard();

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-slate-800">Cumplimiento y Desempeño</h2>
      </div>
      <p className="mb-4 text-xs text-slate-400">
        Producción y calidad de entregas por analista y traductor: órdenes, cumplimiento, informes
        desarrollados, entregas fuera de fecha, observaciones e información financiera incluida.
      </p>

      <CustomFiltrosDesempenoColaboradoresGerente
        filtros={filtros}
        fechasInvalidas={fechasInvalidas}
        onActualizarFiltros={actualizarFiltros}
        onLimpiarFiltros={limpiarFiltros}
      />

      <CustomEvolucionDesempenoColaboradoresGerente
        evolucion={evolucion}
        granularidad={granularidad}
        onCambiarGranularidad={cambiarGranularidad}
      />

      <CustomTablaDesempenoColaboradoresGerente
        resumenColaboradores={resumenColaboradores}
        paginaActual={pagina}
        totalPaginas={totalPaginasColaboradores}
        totalRegistros={totalRegistrosColaboradores}
        onCambiarPagina={cambiarPagina}
        estaCargando={estaCargandoColaboradores}
        hayError={hayErrorColaboradores}
        onReintentar={reintentarColaboradores}
      />
    </section>
  );
}
