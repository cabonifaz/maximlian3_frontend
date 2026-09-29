import { ChevronLeft, ChevronRight } from "lucide-react";
import { useId } from "react";
import { usePaginacionTabla } from "@maximilian/hooks/usePaginacionTabla";
import {
  CLASE_BOTON_NAVEGACION_PAGINACION,
  LOCALE_FORMATO_ENTERO,
  SEPARADOR_PAGINACION,
} from "@maximilian/shared/constants/components/common/custom-paginacion-tabla.constants";
import { formatearEnteroVisual } from "@maximilian/shared/utils/numero.util";

interface PropsCustomPaginacionTabla {
  paginaActual: number;
  totalPaginas: number;
  totalRegistros: number;
  cantidadPagina: number;
  onPaginaChange: (pagina: number) => void;
  etiquetaRegistros: string;
  deshabilitado?: boolean;
}

export function CustomPaginacionTabla({
  paginaActual,
  totalPaginas,
  totalRegistros,
  cantidadPagina,
  onPaginaChange,
  etiquetaRegistros,
  deshabilitado = false,
}: PropsCustomPaginacionTabla) {
  const {
    elementosPaginacion,
    rangoRegistros,
    totalPaginasSeguro,
    esPrimeraPagina,
    esUltimaPagina,
    mostrarIrAPagina,
    formularioIrAPagina,
    irAPagina,
  } = usePaginacionTabla({
    paginaActual,
    totalPaginas,
    totalRegistros,
    cantidadPagina,
    onPaginaChange,
  });
  const idCampoIrAPagina = useId();
  const formatear = (valor: number) =>
    formatearEnteroVisual(valor, LOCALE_FORMATO_ENTERO);
  const errorIrAPagina =
    formularioIrAPagina.formState.errors.paginaDestino?.message;

  return (
    <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 lg:flex-row lg:items-center lg:justify-between sm:px-6">
      <p className="text-xs font-medium text-gray-500">
        {totalRegistros === 0 ? (
          <>Sin {etiquetaRegistros}</>
        ) : (
          <>
            Mostrando{" "}
            <span className="font-bold text-brand-black">
              {formatear(rangoRegistros.desde)}–{formatear(rangoRegistros.hasta)}
            </span>{" "}
            de{" "}
            <span className="font-bold text-brand-black">
              {formatear(totalRegistros)}
            </span>{" "}
            {etiquetaRegistros}
          </>
        )}
      </p>

      <div className="flex max-w-full flex-wrap items-center gap-x-4 gap-y-2">
        <nav
          aria-label="Paginación"
          className="flex max-w-full items-center gap-1 overflow-x-auto"
        >
          <button
            type="button"
            onClick={() => onPaginaChange(paginaActual - 1)}
            disabled={deshabilitado || esPrimeraPagina}
            className={CLASE_BOTON_NAVEGACION_PAGINACION}
            aria-label="Página anterior"
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Anterior</span>
          </button>

          {elementosPaginacion.map((elemento, indice) =>
            elemento === SEPARADOR_PAGINACION ? (
              <span
                key={`separador-${indice}`}
                className="flex h-8 w-6 select-none items-center justify-center text-xs text-gray-400"
                aria-hidden="true"
              >
                …
              </span>
            ) : (
              <button
                key={elemento}
                type="button"
                onClick={() => onPaginaChange(elemento)}
                disabled={deshabilitado}
                aria-current={elemento === paginaActual ? "page" : undefined}
                aria-label={`Página ${elemento}`}
                className={`h-8 min-w-8 shrink-0 rounded-lg px-2 text-xs font-bold tabular-nums transition-all cursor-pointer disabled:cursor-not-allowed ${
                  elemento === paginaActual
                    ? "bg-brand-black text-brand-white shadow shadow-black/10"
                    : "text-gray-500 hover:bg-gray-100 hover:text-brand-black"
                }`}
              >
                {formatear(elemento)}
              </button>
            ),
          )}

          <button
            type="button"
            onClick={() => onPaginaChange(paginaActual + 1)}
            disabled={deshabilitado || esUltimaPagina}
            className={CLASE_BOTON_NAVEGACION_PAGINACION}
            aria-label="Página siguiente"
          >
            <span className="hidden sm:inline">Siguiente</span>
            <ChevronRight size={16} />
          </button>
        </nav>

        {mostrarIrAPagina ? (
          <form
            onSubmit={irAPagina}
            noValidate
            className="flex items-center gap-2 text-xs text-gray-500"
          >
            <label htmlFor={idCampoIrAPagina}>Ir a página</label>
            <input
              id={idCampoIrAPagina}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder={String(paginaActual)}
              disabled={deshabilitado}
              title={errorIrAPagina}
              aria-invalid={errorIrAPagina ? true : undefined}
              {...formularioIrAPagina.register("paginaDestino")}
              className={`h-8 w-16 rounded-lg border px-2 text-center text-xs font-bold text-brand-black tabular-nums outline-none transition-colors focus:border-brand-black ${
                errorIrAPagina ? "border-red-400" : "border-gray-200"
              }`}
            />
            <span className="whitespace-nowrap">
              de {formatear(totalPaginasSeguro)}
            </span>
          </form>
        ) : null}
      </div>
    </div>
  );
}
