import { createContext, createElement, useContext, type ReactNode } from "react";

const ContextoIdiomaTablaMaestra = createContext<number | undefined>(undefined);

export function ProveedorIdiomaTablaMaestra({
  idIdioma,
  children,
}: {
  idIdioma?: number;
  children: ReactNode;
}) {
  return createElement(ContextoIdiomaTablaMaestra.Provider, { value: idIdioma }, children);
}

export function useIdiomaTablaMaestra() {
  return useContext(ContextoIdiomaTablaMaestra);
}
