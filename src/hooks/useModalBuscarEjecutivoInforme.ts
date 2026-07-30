import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { servicioDirectorioEjecutivo } from "@maximilian/services/directorio-ejecutivo.service";
import { servicioTablaMaestra } from "@maximilian/services/tabla-maestra.service";
import type { RegistroPersonaDirectorioAnalista } from "@maximilian/shared/types/investigacion.type";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import { traducirOpcionesTablaMaestra } from "@maximilian/shared/utils/tabla-maestra-idioma.util";

interface ParametrosUseModalBuscarEjecutivoInforme {
  busquedaInicial: string;
  estaAbierto: boolean;
  idIdioma?: number;
  registros: RegistroPersonaDirectorioAnalista[];
  onSeleccionar: (registro: RegistroPersonaDirectorioAnalista) => void;
}

export function useModalBuscarEjecutivoInforme({
  busquedaInicial,
  estaAbierto,
  idIdioma,
  registros: registrosIniciales,
  onSeleccionar,
}: ParametrosUseModalBuscarEjecutivoInforme) {
  const queryClient = useQueryClient();
  const [registroEdicion, setRegistroEdicion] =
    useState<RegistroPersonaDirectorioAnalista | null>(null);
  const [registroAEliminar, setRegistroAEliminar] =
    useState<RegistroPersonaDirectorioAnalista | null>(null);
  const [idRegistroSeleccionado, setIdRegistroSeleccionado] = useState<
    number | null
  >(null);
  const [idTipoPersona, setIdTipoPersona] = useState<number | undefined>(undefined);
  const [idPais, setIdPais] = useState<number | undefined>(undefined);
  const [descripcion, setDescripcion] = useState(busquedaInicial);
  const [busquedaActiva, setBusquedaActiva] = useState(busquedaInicial);
  const [paginaActual, setPaginaActual] = useState(1);

  const { data: opcionesTipoPersonaBase } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.TIPO_PERSONA],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.TIPO_PERSONA),
    enabled: estaAbierto,
    staleTime: Infinity,
  });
  const { data: opcionesPaisBase } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.PAIS],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.PAIS),
    enabled: estaAbierto,
    staleTime: Infinity,
  });

  const opcionesTipoPersona = useMemo(
    () => traducirOpcionesTablaMaestra(opcionesTipoPersonaBase, idIdioma),
    [idIdioma, opcionesTipoPersonaBase],
  );
  const opcionesPais = useMemo(
    () => traducirOpcionesTablaMaestra(opcionesPaisBase, idIdioma),
    [idIdioma, opcionesPaisBase],
  );

  const {
    data: respuestaDirectorio,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["directorio-ejecutivo", "buscar", busquedaActiva, paginaActual],
    queryFn: () =>
      servicioDirectorioEjecutivo.listar({
        busqueda: busquedaActiva.trim() || undefined,
        numPag: paginaActual,
      }),
    enabled: estaAbierto,
    retry: false,
  });

  const registrosFuente = useMemo(
    () => respuestaDirectorio?.registros ?? registrosIniciales,
    [registrosIniciales, respuestaDirectorio?.registros],
  );

  const resultados = useMemo(() => {
    const termino = busquedaActiva.trim().toLowerCase();

    return registrosFuente.filter((registro) => {
      const coincideTipo = !idTipoPersona || registro.idTipoPersona === idTipoPersona;
      const coincidePais = !idPais || registro.idPais === idPais;
      const coincideDescripcion =
        !termino ||
        registro.nombres.toLowerCase().includes(termino) ||
        registro.numeroDocumentoIdentidad.toLowerCase().includes(termino) ||
        registro.numeroIdFiscal.toLowerCase().includes(termino);

      return coincideTipo && coincidePais && coincideDescripcion;
    });
  }, [busquedaActiva, idPais, idTipoPersona, registrosFuente]);

  useEffect(() => {
    if (!estaAbierto) {
      setRegistroEdicion(null);
      setRegistroAEliminar(null);
      setIdRegistroSeleccionado(null);
      setIdTipoPersona(undefined);
      setIdPais(undefined);
      setDescripcion("");
      setBusquedaActiva("");
      setPaginaActual(1);
      return;
    }

    if (!resultados.length) {
      setIdRegistroSeleccionado(null);
      return;
    }

    setIdRegistroSeleccionado((valorActual) =>
      valorActual != null &&
      resultados.some((registro) => registro.id === valorActual)
        ? valorActual
        : (resultados[0]?.id ?? null),
    );
  }, [estaAbierto, resultados]);

  const eliminarDirectorioMutation = useMutation({
    mutationFn: async () => {
      const idDirectorioEjecutivo =
        registroAEliminar?.idDirectorioEjecutivo ?? registroAEliminar?.id;
      if (!idDirectorioEjecutivo) {
        throw new Error("No se encontro el registro a eliminar.");
      }

      await servicioDirectorioEjecutivo.eliminar({ idDirectorioEjecutivo });
    },
    onSuccess: async () => {
      setRegistroAEliminar(null);
      setIdRegistroSeleccionado(null);
      await queryClient.invalidateQueries({ queryKey: ["directorio-ejecutivo"] });
      await refetch();
    },
  });

  const registroSeleccionado = resultados.find(
    (registro) => registro.id === idRegistroSeleccionado,
  );

  const manejarSeleccionar = () => {
    if (!registroSeleccionado) return;
    onSeleccionar(registroSeleccionado);
  };

  const manejarGuardarRegistro = (registro: RegistroPersonaDirectorioAnalista) => {
    setRegistroEdicion(null);
    setIdRegistroSeleccionado(registro.id);
    void queryClient.invalidateQueries({ queryKey: ["directorio-ejecutivo"] });
    void refetch();
  };

  const manejarBuscar = () => {
    setPaginaActual(1);
    setBusquedaActiva(descripcion);
  };

  const prepararEdicionRegistro = async (
    registro: RegistroPersonaDirectorioAnalista,
  ) => {
    const idDirectorioEjecutivo =
      registro.idDirectorioEjecutivo ?? registro.id;
    if (!idDirectorioEjecutivo) return;

    const registroDetalle = await servicioDirectorioEjecutivo.obtener({
      idDirectorioEjecutivo,
    });
    setRegistroEdicion(registroDetalle ?? registro);
  };

  return {
    busquedaActiva,
    descripcion,
    eliminarDirectorioMutation,
    idPais,
    idRegistroSeleccionado,
    idTipoPersona,
    isError,
    isFetching,
    manejarBuscar,
    manejarGuardarRegistro,
    manejarSeleccionar,
    opcionesPais,
    opcionesTipoPersona,
    paginaActual,
    prepararEdicionRegistro,
    refetch,
    registroAEliminar,
    registroEdicion,
    registroSeleccionado,
    resultados,
    respuestaDirectorio,
    setDescripcion,
    setIdPais,
    setIdRegistroSeleccionado,
    setIdTipoPersona,
    setPaginaActual,
    setRegistroAEliminar,
    setRegistroEdicion,
  };
}
