import { useCallback, useRef, type KeyboardEvent } from "react";

const PREFIJO_VINETA = "• ";

interface ParametrosUseAreaTextoConVinetas {
  valor: string;
  soloLectura: boolean;
  onChange?: (valor: string) => void;
}

interface SeleccionTexto {
  inicio: number;
  fin: number;
}

export function useAreaTextoConVinetas({
  valor,
  soloLectura,
  onChange,
}: ParametrosUseAreaTextoConVinetas) {
  const referenciaArea = useRef<HTMLTextAreaElement>(null);

  const restaurarSeleccion = useCallback((seleccion: SeleccionTexto) => {
    requestAnimationFrame(() => {
      referenciaArea.current?.focus();
      referenciaArea.current?.setSelectionRange(seleccion.inicio, seleccion.fin);
    });
  }, []);

  const alternarVinetas = useCallback(() => {
    if (soloLectura || !onChange) return;

    const area = referenciaArea.current;
    const inicioSeleccion = area?.selectionStart ?? 0;
    const finSeleccion = area?.selectionEnd ?? inicioSeleccion;
    const inicioBloque = valor.lastIndexOf("\n", Math.max(0, inicioSeleccion - 1)) + 1;
    const siguienteSalto = valor.indexOf("\n", finSeleccion);
    const finBloque = siguienteSalto === -1 ? valor.length : siguienteSalto;
    const lineas = valor.slice(inicioBloque, finBloque).split("\n");
    const hayVinetas = lineas.some((linea) => linea.startsWith(PREFIJO_VINETA));
    const quitarVinetas =
      hayVinetas &&
      lineas.every((linea) => !linea.trim() || linea.startsWith(PREFIJO_VINETA));
    const lineasActualizadas = lineas.map((linea) => {
      if (quitarVinetas) {
        return linea.startsWith(PREFIJO_VINETA)
          ? linea.slice(PREFIJO_VINETA.length)
          : linea;
      }

      return linea.startsWith(PREFIJO_VINETA) ? linea : `${PREFIJO_VINETA}${linea}`;
    });
    const bloqueActualizado = lineasActualizadas.join("\n");

    onChange(
      `${valor.slice(0, inicioBloque)}${bloqueActualizado}${valor.slice(finBloque)}`,
    );
    restaurarSeleccion({
      inicio: inicioBloque,
      fin: inicioBloque + bloqueActualizado.length,
    });
  }, [onChange, restaurarSeleccion, soloLectura, valor]);

  const manejarTecla = useCallback(
    (evento: KeyboardEvent<HTMLTextAreaElement>) => {
      if (soloLectura || !onChange) return;

      const area = evento.currentTarget;
      const inicioSeleccion = area.selectionStart;
      const finSeleccion = area.selectionEnd;
      const inicioLinea = valor.lastIndexOf("\n", Math.max(0, inicioSeleccion - 1)) + 1;
      const finLineaEncontrado = valor.indexOf("\n", inicioSeleccion);
      const finLinea = finLineaEncontrado === -1 ? valor.length : finLineaEncontrado;
      const lineaActual = valor.slice(inicioLinea, finLinea);

      if (evento.key === "Enter" && lineaActual.startsWith(PREFIJO_VINETA)) {
        evento.preventDefault();

        if (!lineaActual.slice(PREFIJO_VINETA.length).trim()) {
          const valorActualizado = `${valor.slice(0, inicioLinea)}${valor.slice(
            inicioLinea + PREFIJO_VINETA.length,
          )}`;
          onChange(valorActualizado);
          restaurarSeleccion({ inicio: inicioLinea, fin: inicioLinea });
          return;
        }

        const textoInsertado = `\n${PREFIJO_VINETA}`;
        const valorActualizado = `${valor.slice(0, inicioSeleccion)}${textoInsertado}${valor.slice(
          finSeleccion,
        )}`;
        const nuevaPosicion = inicioSeleccion + textoInsertado.length;
        onChange(valorActualizado);
        restaurarSeleccion({ inicio: nuevaPosicion, fin: nuevaPosicion });
        return;
      }

      if (
        evento.key === "Backspace" &&
        inicioSeleccion === finSeleccion &&
        lineaActual.startsWith(PREFIJO_VINETA) &&
        inicioSeleccion === inicioLinea + PREFIJO_VINETA.length
      ) {
        evento.preventDefault();
        const valorActualizado = `${valor.slice(0, inicioLinea)}${valor.slice(
          inicioLinea + PREFIJO_VINETA.length,
        )}`;
        onChange(valorActualizado);
        restaurarSeleccion({ inicio: inicioLinea, fin: inicioLinea });
      }
    },
    [onChange, restaurarSeleccion, soloLectura, valor],
  );

  return {
    alternarVinetas,
    estaActivaLista: valor.split("\n").some((linea) => linea.startsWith(PREFIJO_VINETA)),
    manejarTecla,
    referenciaArea,
  };
}
