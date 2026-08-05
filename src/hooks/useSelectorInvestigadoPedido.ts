import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRetardo } from "@maximilian/hooks/useRetardo";
import { servicioCompania } from "@maximilian/services/compania.service";
import type { EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";

interface ParametrosSelectorInvestigadoPedido {
  abierto: boolean;
  idPais?: number;
  investigado: string;
  alCambiarInvestigado: (investigado: string) => void;
  alCambiarNumeroDocumento: (numeroDocumento: string) => void;
  alCambiarCompania: (idCompania: number) => void;
}

export function useSelectorInvestigadoPedido({
  abierto,
  idPais,
  investigado,
  alCambiarInvestigado,
  alCambiarNumeroDocumento,
  alCambiarCompania,
}: ParametrosSelectorInvestigadoPedido) {
  const [busquedaHabilitada, setBusquedaHabilitada] = useState(false);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [idCompaniaSeleccionada, setIdCompaniaSeleccionada] = useState<number>();
  const busquedaConRetardo = useRetardo(terminoBusqueda.trim());

  const { data, isFetching } = useQuery({
    queryKey: ["companias", "buscar", busquedaConRetardo, idPais],
    queryFn: () => servicioCompania.buscar(busquedaConRetardo, idPais),
    enabled: abierto && busquedaHabilitada,
  });

  const opciones = useMemo<EntradaTablaMaestra[]>(
    () =>
      (data?.lstCompania ?? []).map((compania) => ({
        idEmpresa: 0,
        idTablaMaestra: null,
        idMaestro: 0,
        descripcion: compania.numeroDocumento,
        num1: compania.idCompania,
        num2: null,
        num3: null,
        string1: compania.nombreCompleto,
        string2: compania.numeroDocumento,
        string3: compania.pais,
        date1: null,
        date2: null,
        date3: null,
      })),
    [data?.lstCompania],
  );

  const seleccionarCompania = (idCompania: number) => {
    const compania = opciones.find((opcion) => opcion.num1 === idCompania);
    if (!compania?.string1) return;

    setIdCompaniaSeleccionada(idCompania);
    alCambiarInvestigado(compania.string1);
    alCambiarNumeroDocumento(compania.string2 ?? "");
    alCambiarCompania(idCompania);
  };

  const agregarInvestigado = (nombre: string) => {
    setIdCompaniaSeleccionada(0);
    alCambiarInvestigado(nombre);
    alCambiarNumeroDocumento("");
    alCambiarCompania(0);
  };

  return {
    agregarInvestigado,
    habilitarBusqueda: () => setBusquedaHabilitada(true),
    estaCargando:
      isFetching
      || (terminoBusqueda.trim().length > 0
        && terminoBusqueda.trim() !== busquedaConRetardo),
    idCompaniaSeleccionada,
    opciones,
    seleccionarCompania,
    setTerminoBusqueda,
    valorVisible: investigado,
  };
}
