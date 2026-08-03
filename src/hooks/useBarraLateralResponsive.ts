import { useState } from "react";

export function useBarraLateralResponsive() {
  const [estaColapsada, setEstaColapsada] = useState(false);
  const [estaAbiertaMobile, setEstaAbiertaMobile] = useState(false);

  return {
    estaAbiertaMobile,
    estaColapsada,
    alternarBarraLateralEscritorio: () =>
      setEstaColapsada((valorActual) => !valorActual),
    alternarBarraLateralMobile: () =>
      setEstaAbiertaMobile((valorActual) => !valorActual),
    cerrarBarraLateralMobile: () => setEstaAbiertaMobile(false),
  };
}