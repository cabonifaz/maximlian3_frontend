import { useEffect, useMemo } from "react";
import type { EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";

interface UseSeleccionAutomaticaOpcionUnicaProps {
  activo: boolean;
  opciones: EntradaTablaMaestra[] | undefined;
  valor: number | undefined;
  onSeleccionar: (valor: number) => void;
}

interface UseSeleccionAutomaticaOpcionUnicaMultipleProps {
  activo: boolean;
  opciones: EntradaTablaMaestra[] | undefined;
  valores: number[];
  onSeleccionar: (valores: number[]) => void;
}

function obtenerIdUnico(opciones: EntradaTablaMaestra[] | undefined) {
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
