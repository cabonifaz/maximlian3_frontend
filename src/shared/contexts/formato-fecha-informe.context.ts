import { createContext, createElement, useContext, type ReactNode } from "react";
import type { Locale } from "date-fns";
import { enUS, es, ptBR } from "date-fns/locale";

const FORMATO_FECHA_INFORME_BASE = "dd/MM/yyyy";

interface ValorContextoFormatoFechaInforme {
  formato: string;
  locale: Locale;
}

const ContextoFormatoFechaInforme = createContext<ValorContextoFormatoFechaInforme>({
  formato: FORMATO_FECHA_INFORME_BASE,
  locale: es,
});

export function ProveedorFormatoFechaInforme({
  formato,
  idIdioma,
  children,
}: {
  formato?: string;
  idIdioma?: number;
  children: ReactNode;
}) {
  return createElement(
    ContextoFormatoFechaInforme.Provider,
    {
      value: {
        formato: formato?.trim() || FORMATO_FECHA_INFORME_BASE,
        locale: obtenerLocaleFechaInforme(idIdioma),
      },
    },
    children,
  );
}

export function useFormatoFechaInforme() {
  return useContext(ContextoFormatoFechaInforme);
}

function obtenerLocaleFechaInforme(idIdioma?: number) {
  if (idIdioma === 2) return enUS;
  if (idIdioma === 3) return ptBR;

  return es;
}
