import { FlaskConical, Plus, Search } from "lucide-react";
import { CustomTabsFlujoAsignacion } from "@maximilian/components/coordinador/CustomTabsFlujoAsignacion";
import { CustomTablaFlujoAsignaciones } from "@maximilian/components/coordinador/CustomTablaFlujoAsignaciones";
import { CustomTablaComplementosCoordinador } from "@maximilian/components/coordinador/CustomTablaComplementosCoordinador";
import { CustomModalAsignarRolFlujo } from "@maximilian/components/coordinador/CustomModalAsignarRolFlujo";
import { CustomBarraAsignacionMasivaFlujo } from "@maximilian/components/coordinador/CustomBarraAsignacionMasivaFlujo";
import { ModalFlujoAsignacion } from "@maximilian/components/coordinador/ModalFlujoAsignacion";
import { useFlujoAsignaciones } from "@maximilian/hooks/useFlujoAsignaciones";
import { AVISO_DATOS_SIMULADOS } from "@maximilian/shared/constants/pages/Coordinador/flujo-asignaciones.constants";

export default function GestionAsignaciones() {
  const {
    abrirAsignacionMasiva,
    abrirModalAsignarRol,
    alAsignar,
    abrirNuevaAsignacion,
    abrirRevision,
    cambiarBusqueda,
    cambiarPaginaFlujo,
    cambiarSeleccion,
    cambiarTab,
    cerrarModalAsignarRol,
    cerrarNuevaAsignacion,
    consultaComplementos,
    consultaPedidos,
    conteos,
    esTabComplementos,
    estaAbiertaNuevaAsignacion,
    idsSeleccionados,
    invalidarFlujo,
    limpiarSeleccion,
    modalAsignarRol,
    paginaActual,
    rolAsignacionMasiva,
    simularEnvioTraductorMutation,
    simularFinalizacionMutation,
    simularRechazoMutation,
    tabActiva,
    terminoBusqueda,
    usaDatosSimulados,
  } = useFlujoAsignaciones();
  const accionSimuladaPendiente = simularFinalizacionMutation.isPending
    || simularEnvioTraductorMutation.isPending
    || simularRechazoMutation.isPending;

  return (
    <div className="space-y-6">
      {usaDatosSimulados ? (
        <p className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          <FlaskConical size={14} className="shrink-0" />
          {AVISO_DATOS_SIMULADOS}
        </p>
      ) : null}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-brand-black">Asignaciones</h1>

        <div className="flex flex-1 flex-col gap-3 md:max-w-3xl md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por cliente, investigado, analista o traductor"
              value={terminoBusqueda}
              onChange={(evento) => cambiarBusqueda(evento.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-brand-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-brand-wine focus:ring-4 focus:ring-brand-wine/10"
            />
          </div>

          {!usaDatosSimulados ? (
            <button
              onClick={abrirNuevaAsignacion}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand-wine px-4 py-2 text-sm font-medium text-brand-white shadow-sm shadow-brand-wine/20 transition-all hover:scale-[1.02] hover:bg-brand-wine/90 active:scale-[0.98]"
            >
              <Plus size={16} />
              <span>Nueva Asignación</span>
            </button>
          ) : null}
        </div>
      </div>

      <CustomTabsFlujoAsignacion tabActiva={tabActiva} conteos={conteos} onCambiarTab={cambiarTab} />

      {esTabComplementos ? (
        <CustomTablaComplementosCoordinador
          complementos={consultaComplementos.data?.lstComplemento}
          estaCargando={consultaComplementos.isLoading}
          hayError={consultaComplementos.isError}
          onReintentar={() => consultaComplementos.refetch()}
          paginaActual={paginaActual}
          totalPaginas={consultaComplementos.data?.totalPaginas ?? 1}
          totalRegistros={consultaComplementos.data?.totalRegistros ?? 0}
          onCambiarPagina={cambiarPaginaFlujo}
        />
      ) : (
        <>
          {rolAsignacionMasiva ? (
            <CustomBarraAsignacionMasivaFlujo
              cantidadSeleccionados={idsSeleccionados.size}
              rol={rolAsignacionMasiva}
              onAsignar={abrirAsignacionMasiva}
              onLimpiar={limpiarSeleccion}
            />
          ) : null}
        <CustomTablaFlujoAsignaciones
          pedidos={consultaPedidos.data?.lstPedido}
          estaCargando={consultaPedidos.isLoading}
          hayError={consultaPedidos.isError}
          onReintentar={() => consultaPedidos.refetch()}
          paginaActual={paginaActual}
          totalPaginas={consultaPedidos.data?.totalPaginas ?? 1}
          totalRegistros={consultaPedidos.data?.totalRegistros ?? 0}
          onCambiarPagina={cambiarPaginaFlujo}
          usaDatosSimulados={usaDatosSimulados}
          accionSimuladaPendiente={accionSimuladaPendiente}
          onAsignar={abrirModalAsignarRol}
          onRevisar={abrirRevision}
          onSimularFinalizacion={(idPedido) => simularFinalizacionMutation.mutate(idPedido)}
          onSimularEnvioTraductor={(idPedido) => simularEnvioTraductorMutation.mutate(idPedido)}
          onSimularRechazo={(idPedido) => simularRechazoMutation.mutate(idPedido)}
          esSeleccionable={rolAsignacionMasiva !== null}
          idsSeleccionados={idsSeleccionados}
          onCambiarSeleccion={cambiarSeleccion}
        />
        </>
      )}

      {modalAsignarRol ? (
        <CustomModalAsignarRolFlujo
          key={`${modalAsignarRol.pedidos.map((pedido) => pedido.idPedido).join("-")}-${modalAsignarRol.rol}`}
          pedidos={modalAsignarRol.pedidos}
          rol={modalAsignarRol.rol}
          onCerrar={cerrarModalAsignarRol}
          onAsignado={alAsignar}
        />
      ) : null}

      {estaAbiertaNuevaAsignacion ? (
        <ModalFlujoAsignacion
          isOpen
          onClose={cerrarNuevaAsignacion}
          onSuccess={invalidarFlujo}
          titulo="Nueva asignación"
          permiteAsignarTraductor={false}
        />
      ) : null}
    </div>
  );
}
