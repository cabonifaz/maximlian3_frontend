import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { servicioAsignacion } from "@maximilian/services/asignacion.service";
import { useRetardo } from "@maximilian/hooks/useRetardo";
import { normalizarTextoBusqueda } from "@maximilian/shared/utils/texto.util";
import type {
  AssignmentCandidate,
  AssignmentRole,
} from "@maximilian/shared/types/asignacion.type";

interface ParametrosUseModalSelectorRolAsignacion {
  estaAbierto: boolean;
  idiomasPedido: number[];
  rol: AssignmentRole;
}

export function obtenerClasesInsigniaAsignaciones(cantidad: number) {
  if (cantidad <= 2) return "bg-green-50 text-green-600";
  if (cantidad <= 4) return "bg-slate-100 text-slate-500";
  if (cantidad <= 5) return "bg-amber-50 text-amber-500";
  return "bg-orange-50 text-orange-500";
}

export function obtenerEtiquetaAsignaciones(cantidadAsignaciones: number) {
  return cantidadAsignaciones <= 1 ? "asignacion" : "asignaciones";
}

function filtrarCandidatos(
  candidatos: AssignmentCandidate[],
  terminoBusqueda: string,
) {
  const terminoNormalizado = normalizarTextoBusqueda(terminoBusqueda);
  if (!terminoNormalizado) return candidatos;

  return candidatos.filter(
    (candidato) =>
      normalizarTextoBusqueda(candidato.nombre).includes(terminoNormalizado) ||
      normalizarTextoBusqueda(candidato.nombres ?? "").includes(
        terminoNormalizado,
      ) ||
      normalizarTextoBusqueda(candidato.apellidos ?? "").includes(
        terminoNormalizado,
      ),
  );
}

export function useModalSelectorRolAsignacion({
  estaAbierto,
  idiomasPedido,
  rol,
}: ParametrosUseModalSelectorRolAsignacion) {
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const busquedaConRetardo = useRetardo(terminoBusqueda, 250);

  const { data: candidatos, isLoading } = useQuery({
    queryKey: ["assignment-candidates", rol, idiomasPedido],
    queryFn: () =>
      servicioAsignacion.listCandidates({
        role: rol,
        idiomasPedido,
      }),
    enabled: estaAbierto,
  });

  return {
    candidatosFiltrados: filtrarCandidatos(
      candidatos ?? [],
      busquedaConRetardo,
    ),
    isLoading,
    setTerminoBusqueda,
    terminoBusqueda,
  };
}
