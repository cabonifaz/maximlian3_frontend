import { useState } from "react";

export function useFiltrosFacturacion(reiniciarPagina: () => void) {
  const [idsPrefacturable, setIdsPrefacturable] = useState<number[]>([]);
  const [idsIdioma, setIdsIdioma] = useState<number[]>([]);
  const [idsEstado, setIdsEstado] = useState<number[]>([]);

  const cambiarFiltro = (
    establecerValores: (valores: number[]) => void,
    valores: number[],
  ) => {
    establecerValores(valores);
    reiniciarPagina();
  };

  return {
    estadoFacturacion: idsEstado[idsEstado.length - 1],
    emitirPrefactura: idsPrefacturable[idsPrefacturable.length - 1],
    idIdiomaFacturacion: idsIdioma[idsIdioma.length - 1],
    idsEstado,
    idsIdioma,
    idsPrefacturable,
    cambiarEstados: (valores: number[]) => cambiarFiltro(setIdsEstado, valores),
    cambiarIdiomas: (valores: number[]) => cambiarFiltro(setIdsIdioma, valores),
    cambiarPrefacturables: (valores: number[]) =>
      cambiarFiltro(setIdsPrefacturable, valores),
  };
}
