import { Check, Search, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { useModalAsignarRolFlujo } from "@maximilian/hooks/useModalAsignarRolFlujo";
import { CustomResumenPedidosAsignacion } from "@maximilian/components/coordinador/CustomResumenPedidosAsignacion";
import { ETIQUETA_ROL_FLUJO } from "@maximilian/shared/constants/pages/Coordinador/flujo-asignaciones.constants";
import type { FilaFlujoAsignacion, RolFlujoAsignacion } from "@maximilian/shared/types/flujo-informe.type";
import { obtenerInicialesAsignado } from "@maximilian/shared/utils/modal-flujo-asignacion.util";

interface PropsCustomModalAsignarRolFlujo {
  pedidos: FilaFlujoAsignacion[];
  rol: RolFlujoAsignacion;
  onCerrar: () => void;
  onAsignado: (idsNoAsignados: number[]) => void | Promise<void>;
}

export function CustomModalAsignarRolFlujo({ pedidos, rol, onCerrar, onAsignado }: PropsCustomModalAsignarRolFlujo) {
  const {
    asignarMutation,
    candidatosFiltrados,
    cerrar,
    consultaCandidatos,
    enviar,
    errorSeleccion,
    esMasiva,
    esReasignacion,
    idUsuarioSeleccionado,
    mensajeErrorNegocio,
    seleccionarCandidato,
    setTerminoBusqueda,
    terminoBusqueda,
  } = useModalAsignarRolFlujo({ pedidos, rol, onCerrar, onAsignado });
  const etiquetaRol = ETIQUETA_ROL_FLUJO[rol];

  return (
    <div className="fixed left-0 top-0 z-[70] flex h-[100dvh] w-[100dvw] items-center justify-center overflow-hidden bg-black/40 p-4 backdrop-blur-sm">
      <form
        onSubmit={enviar}
        className="flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-brand-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-5 sm:px-8 sm:py-6">
          <h2 className="text-lg font-bold text-brand-black sm:text-xl">
            {esReasignacion ? `Reasignar ${etiquetaRol}` : `Asignar ${etiquetaRol}`}
            {esMasiva ? <span className="ml-2 text-sm font-medium text-slate-500">{`a ${pedidos.length} pedidos`}</span> : null}
          </h2>
          <CustomButton type="button" variant="ghost" size="icon" onClick={cerrar} disabled={asignarMutation.isPending}>
            <X size={20} className="text-gray-400" />
          </CustomButton>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-8 sm:py-6">
          <CustomResumenPedidosAsignacion pedidos={pedidos} rol={rol} />

          <div className="space-y-2">
            <CustomLabel as="p" required>{`Selecciona un ${etiquetaRol}`}</CustomLabel>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={terminoBusqueda}
                onChange={(evento) => setTerminoBusqueda(evento.target.value)}
                placeholder="Buscar por nombre"
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-brand-wine focus:ring-4 focus:ring-brand-wine/10"
              />
            </div>
            <ul className="max-h-64 divide-y divide-gray-50 overflow-y-auto rounded-xl border border-gray-100">
              {consultaCandidatos.isLoading ? (
                <li className="px-4 py-6 text-center text-sm text-slate-400">Cargando…</li>
              ) : candidatosFiltrados.length === 0 ? (
                <li className="px-4 py-6 text-center text-sm text-slate-400">Sin resultados</li>
              ) : (
                candidatosFiltrados.map((candidato) => {
                  const estaSeleccionado = candidato.idUsuario === idUsuarioSeleccionado;
                  return (
                    <li key={candidato.idUsuario}>
                      <button
                        type="button"
                        onClick={() => seleccionarCandidato(candidato.idUsuario)}
                        className={`flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-all hover:bg-gray-50 ${
                          estaSeleccionado ? "bg-brand-wine/5" : ""
                        }`}
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                          {obtenerInicialesAsignado(candidato.nombre)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-brand-black">{candidato.nombre}</span>
                          <span className="text-xs text-slate-400">
                            {candidato.cantidadAsignaciones} {candidato.cantidadAsignaciones === 1 ? "asignación activa" : "asignaciones activas"}
                          </span>
                        </span>
                        {estaSeleccionado ? <Check size={16} className="text-brand-wine" /> : null}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
            {errorSeleccion ? <p className="text-xs text-red-600">{errorSeleccion}</p> : null}
            {mensajeErrorNegocio ? <p className="text-xs text-red-600">{mensajeErrorNegocio}</p> : null}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-5 py-5 sm:flex-row sm:justify-end sm:px-8 sm:py-6">
          <CustomButton type="button" variant="secondary" size="compact" onClick={cerrar} disabled={asignarMutation.isPending}>
            Cancelar
          </CustomButton>
          <CustomButton type="submit" variant="wine" size="compact" loading={asignarMutation.isPending} loadingText="Guardando...">
            {esReasignacion ? "Reasignar" : "Asignar"}
          </CustomButton>
        </div>
      </form>
    </div>
  );
}
