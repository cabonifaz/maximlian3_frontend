import { useState } from "react";

export function useFiltrosFacturacion(reiniciarPagina: () => void) {
  const [idsPrefacturable, setIdsPrefacturable] = useState<number[]>([]);
  const [idsIdioma, setIdsIdioma] = useState<number[]>([]);

  const cambiarFiltro = (
    establecerValores: (valores: number[]) => void,
    valores: number[],
  ) => {
    establecerValores(valores);
    reiniciarPagina();
  };

  return {
    emitirPrefactura: idsPrefacturable[idsPrefacturable.length - 1],
    idIdiomaFacturacion: idsIdioma[idsIdioma.length - 1],
    idsIdioma,
    idsPrefacturable,
    cambiarIdiomas: (valores: number[]) => cambiarFiltro(setIdsIdioma, valores),
    cambiarPrefacturables: (valores: number[]) =>
      cambiarFiltro(setIdsPrefacturable, valores),
  };
}
