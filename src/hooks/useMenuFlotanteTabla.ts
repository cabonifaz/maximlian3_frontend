import { useCallback, useState, type CSSProperties, type MouseEvent } from "react";

export function useMenuFlotanteTabla() {
  const [idMenuActivo, setIdMenuActivo] = useState<number | null>(null);
  const [estiloMenu, setEstiloMenu] = useState<CSSProperties>({});

  const cerrarMenu = useCallback(() => setIdMenuActivo(null), []);

  const alternarMenu = useCallback((
    evento: MouseEvent<HTMLElement>,
    id: number,
    alturaMenu: number,
  ) => {
    if (idMenuActivo === id) {
      cerrarMenu();
      return;
    }

    const rectangulo = evento.currentTarget.getBoundingClientRect();
    const espacioInferior = window.innerHeight - rectangulo.bottom;
    const posicionSuperior = espacioInferior < alturaMenu
      ? rectangulo.top - alturaMenu - 4
      : rectangulo.bottom + 4;

    setEstiloMenu({
      top: posicionSuperior,
      right: window.innerWidth - rectangulo.right,
    });
    setIdMenuActivo(id);
  }, [cerrarMenu, idMenuActivo]);

  return {
    idMenuActivo,
    estiloMenu,
    alternarMenu,
    cerrarMenu,
  };
}
