import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { opcionesCriterio } from "@maximilian/shared/constants/components/investigacion/custom-modal-lista-personas.constants";
import { useRetardo } from "@maximilian/hooks/useRetardo";
import { servicioCompania } from "@maximilian/services/compania.service";
import type { CompaniaListaItem } from "@maximilian/shared/types/compania.type";
import type { EmpresaRelacionadaAnalista } from "@maximilian/shared/types/investigacion.type";
import type { EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";
import type { RegistroPersonaAnalista } from "@maximilian/components/investigacion/CustomModalRegistroEmpresaRelacionada";

interface ParametrosUseModalListaPersonasInforme {
  estaAbierto: boolean;
  onCerrar: () => void;
  onGuardar: (empresa: EmpresaRelacionadaAnalista) => void;
  opcionesPais?: EntradaTablaMaestra[];
  opcionesTipoPersona?: EntradaTablaMaestra[];
}

function mapearCompaniaARegistro(
  compania: CompaniaListaItem,
): RegistroPersonaAnalista {
  return {
    id: compania.idCompania,
    idCompania: compania.idCompania,
    idTipoPersona: compania.idTipoPersona,
    idTipoDocumento: compania.idTipoDocumento,
    idPais: compania.idPais,
    direccion: compania.direccion,
    ubigeo: compania.ubigeo,
    codigoPostal: compania.codigoPostal,
    numeroDocumento: compania.numeroDocumento,
    tipoPersona: compania.tipoPersona ?? "",
    nombres: compania.nombreCompleto,
    tipoDocumento: `${compania.tipoDocumento ?? "-"} - ${compania.numeroDocumento}`,
    pais: compania.pais,
    telefono: compania.telefono,
    existeInformacion: compania.existeInformacion,
  };
}

export function useModalListaPersonasInforme({
  estaAbierto,
  onCerrar,
  onGuardar,
  opcionesPais,
  opcionesTipoPersona,
}: ParametrosUseModalListaPersonasInforme) {
  const queryClient = useQueryClient();
  const [registroEdicion, setRegistroEdicion] =
    useState<RegistroPersonaAnalista | null>(null);
  const [estaAbiertoModalRegistro, setEstaAbiertoModalRegistro] = useState(false);
  const [idTipoPersona, setIdTipoPersona] = useState<number | undefined>(undefined);
  const [idPais, setIdPais] = useState<number | undefined>(undefined);
  const [idCriterio, setIdCriterio] = useState<number | undefined>(1);
  const [descripcion, setDescripcion] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [idRegistroSeleccionado, setIdRegistroSeleccionado] = useState<
    number | null
  >(null);
  const [registroAEliminar, setRegistroAEliminar] =
    useState<RegistroPersonaAnalista | null>(null);
  const busquedaConRetardo = useRetardo(descripcion);

  const criterioFiltro =
    opcionesCriterio.find((opcion) => opcion.num1 === idCriterio)?.string1 ?? "";

  const {
    data: respuestaCompanias,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["companias-relacionadas-modal", busquedaConRetardo, paginaActual],
    queryFn: () =>
      servicioCompania.list({
        busqueda: busquedaConRetardo.trim() || undefined,
        numPag: paginaActual,
      }),
    enabled: estaAbierto,
    retry: false,
  });

  const registros = useMemo<RegistroPersonaAnalista[]>(
    () =>
      (respuestaCompanias?.lstCompania ?? []).map(mapearCompaniaARegistro),
    [respuestaCompanias?.lstCompania],
  );

  const tipoPersonaFiltro = opcionesTipoPersona?.find(
    (opcion) => opcion.num1 === idTipoPersona,
  )?.string1;
  const paisFiltro = opcionesPais?.find((opcion) => opcion.num1 === idPais)?.string1;

  const registrosFiltrados = useMemo(
    () =>
      registros.filter((registro) => {
        const coincideTipoPersona =
          !tipoPersonaFiltro || registro.tipoPersona === tipoPersonaFiltro;
        const coincidePais = !paisFiltro || registro.pais === paisFiltro;
        const termino = busquedaConRetardo.trim().toLowerCase();
        if (!termino) return coincideTipoPersona && coincidePais;

        const coincideCriterio =
          criterioFiltro === "Documento"
            ? (registro.numeroDocumento ?? "").toLowerCase().includes(termino)
            : registro.nombres.toLowerCase().includes(termino);

        return coincideTipoPersona && coincidePais && coincideCriterio;
      }),
    [busquedaConRetardo, criterioFiltro, paisFiltro, registros, tipoPersonaFiltro],
  );

  useEffect(() => {
    if (!estaAbierto) {
      setRegistroEdicion(null);
      setEstaAbiertoModalRegistro(false);
      setIdTipoPersona(undefined);
      setIdPais(undefined);
      setIdCriterio(1);
      setDescripcion("");
      setPaginaActual(1);
      setIdRegistroSeleccionado(null);
      setRegistroAEliminar(null);
    }
  }, [estaAbierto]);

  useEffect(() => {
    setPaginaActual(1);
  }, [busquedaConRetardo]);

  useEffect(() => {
    if (!registrosFiltrados.length) {
      setIdRegistroSeleccionado(null);
      return;
    }

    setIdRegistroSeleccionado((valorActual) =>
      valorActual != null &&
      registrosFiltrados.some((registro) => registro.id === valorActual)
        ? valorActual
        : (registrosFiltrados[0]?.id ?? null),
    );
  }, [registrosFiltrados]);

  const eliminarCompaniaMutation = useMutation({
    mutationFn: async () => {
      if (!registroAEliminar?.idCompania) {
        throw new Error("No se encontro la compañía a eliminar.");
      }

      await servicioCompania.eliminar({ idCompania: registroAEliminar.idCompania });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["companias-relacionadas-modal"],
      });
      setRegistroAEliminar(null);
    },
  });

  const abrirNuevoRegistro = () => {
    setRegistroEdicion(null);
    setEstaAbiertoModalRegistro(true);
  };

  const prepararEdicionRegistro = async (registro: RegistroPersonaAnalista) => {
    if (!registro.idCompania) return;

    const companiaDetalle = await servicioCompania.obtener({
      idCompania: registro.idCompania,
    });
    setRegistroEdicion(
      companiaDetalle ? mapearCompaniaARegistro(companiaDetalle) : registro,
    );
    setEstaAbiertoModalRegistro(true);
  };

  const cerrarModalRegistro = () => {
    setRegistroEdicion(null);
    setEstaAbiertoModalRegistro(false);
  };

  const manejarGuardarRegistro = (registro: RegistroPersonaAnalista) => {
    setIdRegistroSeleccionado(registro.id);
    setRegistroEdicion(null);
    setEstaAbiertoModalRegistro(false);
    void queryClient.invalidateQueries({ queryKey: ["companias-relacionadas-modal"] });
  };

  const manejarGuardarCompania = () => {
    const registroSeleccionado = registrosFiltrados.find(
      (registro) => registro.id === idRegistroSeleccionado,
    );
    if (!registroSeleccionado) return;

    onGuardar({
      idCompania: registroSeleccionado.idCompania,
      empresa: registroSeleccionado.nombres,
      idFiscal: registroSeleccionado.tipoDocumento,
      pais: registroSeleccionado.pais,
    });
    onCerrar();
  };

  return {
    abrirNuevoRegistro,
    cerrarModalRegistro,
    descripcion,
    eliminarCompaniaMutation,
    estaAbiertoModalRegistro,
    idCriterio,
    idPais,
    idRegistroSeleccionado,
    idTipoPersona,
    isError,
    isLoading,
    manejarGuardarCompania,
    manejarGuardarRegistro,
    paginaActual,
    prepararEdicionRegistro,
    refetch,
    registroAEliminar,
    registroEdicion,
    registrosFiltrados,
    respuestaCompanias,
    setDescripcion,
    setIdCriterio,
    setIdPais,
    setIdRegistroSeleccionado,
    setIdTipoPersona,
    setPaginaActual,
    setRegistroAEliminar,
    setRegistroEdicion,
    setEstaAbiertoModalRegistro,
  };
}
