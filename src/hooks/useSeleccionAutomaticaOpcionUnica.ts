import { useEffect, useMemo } from "react";
import type { MasterTableEntry } from "@maximilian/shared/types/master-table.type";

interface UseSeleccionAutomaticaOpcionUnicaProps {
  activo: boolean;
  opciones: MasterTableEntry[] | undefined;
  valor: number | undefined;
  onSeleccionar: (valor: number) => void;
}

interface UseSeleccionAutomaticaOpcionUnicaMultipleProps {
  activo: boolean;
  opciones: MasterTableEntry[] | undefined;
  valores: number[];
  onSeleccionar: (valores: number[]) => void;
}

function obtenerIdUnico(opciones: MasterTableEntry[] | undefined) {
  if (!opciones) return undefined;

  const idsUnicos = Array.from(
    new Set(
      opciones
        .map((opcion) => opcion.num1)
        .filter((id): id is number => id != null),
    ),
  );

  return idsUnicos.length === 1 ? idsUnicos[0] : undefined;
}

export function useSeleccionAutomaticaOpcionUnica({
  activo,
  opciones,
  valor,
  onSeleccionar,
}: UseSeleccionAutomaticaOpcionUnicaProps) {
  const idUnico = useMemo(() => obtenerIdUnico(opciones), [opciones]);

  useEffect(() => {
    if (!activo || valor != null || idUnico == null) return;
    onSeleccionar(idUnico);
  }, [activo, idUnico, onSeleccionar, valor]);
}

export function useSeleccionAutomaticaOpcionUnicaMultiple({
  activo,
  opciones,
  valores,
  onSeleccionar,
}: UseSeleccionAutomaticaOpcionUnicaMultipleProps) {
  const idUnico = useMemo(() => obtenerIdUnico(opciones), [opciones]);

  useEffect(() => {
    if (!activo || valores.length > 0 || idUnico == null) return;
    onSeleccionar([idUnico]);
  }, [activo, idUnico, onSeleccionar, valores]);
}
