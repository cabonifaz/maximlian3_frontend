import { ArrowLeft, Search, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { roleConfig } from "@maximilian/shared/constants/components/coordinador/modal-selector-rol-asignacion.constants";
import {
  obtenerClasesInsigniaAsignaciones,
  obtenerEtiquetaAsignaciones,
  useModalSelectorRolAsignacion,
} from "@maximilian/hooks/useModalSelectorRolAsignacion";
import type {
  AssignmentCandidate,
  AssignmentRole,
} from "@maximilian/shared/types/asignacion.type";

interface ModalSelectorRolAsignacionProps {
  isOpen: boolean;
  role: AssignmentRole;
  idiomasPedido?: number[];
  onClose: () => void;
  onSelect: (candidate: AssignmentCandidate) => void;
}

export function ModalSelectorRolAsignacion({
  isOpen,
  role,
  idiomasPedido = [],
  onClose,
  onSelect,
}: ModalSelectorRolAsignacionProps) {
  const {
    candidatosFiltrados,
    isLoading,
    setTerminoBusqueda,
    terminoBusqueda,
  } = useModalSelectorRolAsignacion({
    estaAbierto: isOpen,
    idiomasPedido,
    rol: role,
  });

  if (!isOpen) return null;

  const config = roleConfig[role];

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/35 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-3xl bg-brand-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-brand-black cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <h3 className="text-xl font-bold text-brand-black">{config.title}</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-brand-black cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300" />
            <input
              type="text"
              value={terminoBusqueda}
              onChange={(evento) => setTerminoBusqueda(evento.target.value)}
              placeholder="Buscar usuario..."
              className="w-full rounded-xl border border-gray-100 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-brand-black outline-none transition-all focus:border-brand-wine focus:ring-4 focus:ring-brand-wine/10"
            />
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="py-10 text-center text-sm text-gray-400">
                Cargando usuarios...
              </div>
            ) : candidatosFiltrados.length ? (
              candidatosFiltrados.map((candidate) => (
                <div
                  key={candidate.idUsuario}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 px-4 py-4 transition-colors hover:bg-gray-50"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-500">
                      {candidate.iniciales}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-semibold text-brand-black">
                        {candidate.nombres || candidate.nombre}
                      </p>
                      {candidate.apellidos ? (
                        <p className="truncate text-sm text-slate-500">
                          {candidate.apellidos}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${obtenerClasesInsigniaAsignaciones(
                        candidate.cantidadAsignaciones,
                      )}`}
                    >
                      {candidate.cantidadAsignaciones}{" "}
                      {obtenerEtiquetaAsignaciones(
                        candidate.cantidadAsignaciones,
                      )}
                    </span>
                    <CustomButton
                      size="sm"
                      variant="wine"
                      className="min-w-24"
                      onClick={() => onSelect(candidate)}
                    >
                      Asignar
                    </CustomButton>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-sm text-gray-400">
                No se encontraron usuarios.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
