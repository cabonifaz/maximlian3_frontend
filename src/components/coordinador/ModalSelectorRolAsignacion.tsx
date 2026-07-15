import { roleConfig } from "@maximilian/shared/constants/components/coordinador/modal-selector-rol-asignacion.constants";
import { useState } from "react";
import { Search, X, ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { servicioAsignacion } from "@maximilian/services/asignacion.service";
import { useRetardo } from "@maximilian/hooks/useRetardo";
import { normalizarTextoBusqueda } from "@maximilian/shared/utils/texto.util";
import type { AssignmentCandidate, AssignmentRole } from "@maximilian/shared/types/asignacion.type";

interface ModalSelectorRolAsignacionProps {
  isOpen: boolean;
  role: AssignmentRole;
  idiomasPedido?: number[];
  onClose: () => void;
  onSelect: (candidate: AssignmentCandidate) => void;
}

function getBadgeClasses(count: number) {
  if (count <= 2) return "bg-green-50 text-green-600";
  if (count <= 4) return "bg-slate-100 text-slate-500";
  if (count <= 5) return "bg-amber-50 text-amber-500";
  return "bg-orange-50 text-orange-500";
}

export function ModalSelectorRolAsignacion({
  isOpen,
  role,
  idiomasPedido = [],
  onClose,
  onSelect,
}: ModalSelectorRolAsignacionProps) {
  const [terminoBusqueda, setSearchTerm] = useState("");
  const busquedaConRetardo = useRetardo(terminoBusqueda, 250);

  const { data: candidates, isLoading } = useQuery({
    queryKey: ["assignment-candidates", role, idiomasPedido],
    queryFn: () =>
      servicioAsignacion.listCandidates({
        role,
        idiomasPedido,
      }),
    enabled: isOpen,
  });

  const candidatosFiltrados = (candidates ?? []).filter((candidate) => {
    const terminoNormalizado = normalizarTextoBusqueda(busquedaConRetardo);
    if (!terminoNormalizado) return true;

    return (
      normalizarTextoBusqueda(candidate.nombre).includes(terminoNormalizado)
      || normalizarTextoBusqueda(candidate.nombres ?? "").includes(terminoNormalizado)
      || normalizarTextoBusqueda(candidate.apellidos ?? "").includes(terminoNormalizado)
    );
  });

  if (!isOpen) return null;

  const config = roleConfig[role];

  const getAssignmentLabel = (cantidadAsignaciones: number) =>
    cantidadAsignaciones <= 1 ? "asignación" : "asignaciones";

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
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar usuario..."
              className="w-full rounded-xl border border-gray-100 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-brand-black outline-none transition-all focus:border-brand-wine focus:ring-4 focus:ring-brand-wine/10"
            />
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="py-10 text-center text-sm text-gray-400">Cargando usuarios...</div>
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
                        <p className="truncate text-sm text-slate-500">{candidate.apellidos}</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${getBadgeClasses(
                        candidate.cantidadAsignaciones,
                      )}`}
                    >
                      {candidate.cantidadAsignaciones} {getAssignmentLabel(candidate.cantidadAsignaciones)}
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
              <div className="py-10 text-center text-sm text-gray-400">No se encontraron usuarios.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
