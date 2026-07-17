import { useEffect, useMemo, useState } from "react";
import type {
  AlcanceExtraccionInforme,
  InformeConfiguracionExtraccion,
  InformeSeccionExtraccionDisponible,
} from "@maximilian/shared/types/informe.type";
import type { EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";
import type { ModoProcesamientoInforme } from "@maximilian/components/investigacion/CustomModalProcesamientoInforme";

interface ParametrosUseModalProcesamientoInforme {
  alcance: AlcanceExtraccionInforme;
  archivosDisponibles: File[];
  estaAbierto: boolean;
  ocultarCargaArchivos: boolean;
  onCerrar: () => void;
  onExtraer: (
    archivos: File[],
    alcance: AlcanceExtraccionInforme,
    especificaciones: string,
    configuracionSecciones: InformeConfiguracionExtraccion,
    modo: ModoProcesamientoInforme,
  ) => Promise<void> | void;
  seccionesDisponibles: InformeSeccionExtraccionDisponible[];
  tituloSeccion?: string;
  verboAccion: string;
}

function crearOpcionSelector(id: number, etiqueta: string): EntradaTablaMaestra {
  return {
    idEmpresa: 0,
    idTablaMaestra: null,
    idMaestro: 0,
    descripcion: "",
    num1: id,
    num2: null,
    num3: null,
    string1: etiqueta,
    string2: null,
    string3: null,
    date1: null,
    date2: null,
    date3: null,
  };
}

export function useModalProcesamientoInforme({
  alcance,
  archivosDisponibles,
  estaAbierto,
  ocultarCargaArchivos,
  onCerrar,
  onExtraer,
  seccionesDisponibles,
  tituloSeccion,
  verboAccion,
}: ParametrosUseModalProcesamientoInforme) {
  const [archivosSeleccionados, setArchivosSeleccionados] = useState<File[]>([]);
  const [especificaciones, setEspecificaciones] = useState("");
  const [estaProcesando, setEstaProcesando] = useState(false);
  const [modoProcesando, setModoProcesando] =
    useState<ModoProcesamientoInforme | null>(null);
  const [camposSeleccionadosPorSeccion, setCamposSeleccionadosPorSeccion] =
    useState<Record<string, number[]>>({});

  const titulo = tituloSeccion
    ? `${verboAccion} informacion para "${tituloSeccion}"`
    : alcance === "general"
      ? `${verboAccion} informacion del pedido`
      : `${verboAccion} informacion de la seccion`;

  const descripcion = useMemo(() => {
    if (alcance === "general") {
      return "Se procesaran los documentos para completar todas las secciones del informe.";
    }

    return "Se procesaran los documentos para completar unicamente los campos de la seccion seleccionada.";
  }, [alcance]);

  const seccionesConOpciones = useMemo(
    () =>
      seccionesDisponibles.map((seccion) => ({
        ...seccion,
        opciones: seccion.campos.map((campo) =>
          crearOpcionSelector(campo.id, campo.etiquetaCampo),
        ),
      })),
    [seccionesDisponibles],
  );

  const totalCamposSeleccionados = useMemo(
    () =>
      Object.values(camposSeleccionadosPorSeccion).reduce(
        (total, campos) => total + campos.length,
        0,
      ),
    [camposSeleccionadosPorSeccion],
  );

  const estaAccionDeshabilitada =
    (!ocultarCargaArchivos && archivosSeleccionados.length === 0) ||
    (seccionesConOpciones.length > 0 && totalCamposSeleccionados === 0);

  useEffect(() => {
    if (!estaAbierto) return;

    setCamposSeleccionadosPorSeccion(
      Object.fromEntries(
        seccionesDisponibles.map((seccion) => [
          seccion.claveSeccion,
          seccion.campos.map((campo) => campo.id),
        ]),
      ),
    );
  }, [estaAbierto, seccionesDisponibles]);

  useEffect(() => {
    if (!estaAbierto || !ocultarCargaArchivos) return;
    setArchivosSeleccionados(archivosDisponibles);
  }, [archivosDisponibles, estaAbierto, ocultarCargaArchivos]);

  const limpiarEstado = () => {
    setArchivosSeleccionados([]);
    setEspecificaciones("");
    setCamposSeleccionadosPorSeccion({});
  };

  const manejarCerrar = () => {
    if (estaProcesando) return;
    limpiarEstado();
    onCerrar();
  };

  const agregarArchivos = (listaArchivos: File[]) => {
    if (!listaArchivos.length) return;
    setArchivosSeleccionados((anteriores) => [...anteriores, ...listaArchivos]);
  };

  const eliminarArchivo = (indiceArchivo: number) => {
    setArchivosSeleccionados((anteriores) =>
      anteriores.filter((_, indice) => indice !== indiceArchivo),
    );
  };

  const actualizarCamposSeccion = (claveSeccion: string, valor: number[]) => {
    setCamposSeleccionadosPorSeccion((anterior) => ({
      ...anterior,
      [claveSeccion]: valor,
    }));
  };

  const construirConfiguracionSecciones = () =>
    seccionesConOpciones.reduce<InformeConfiguracionExtraccion>(
      (acumulado, seccion) => {
        const idsSeleccionados =
          camposSeleccionadosPorSeccion[seccion.claveSeccion] ?? [];
        seccion.campos
          .filter((campo) => idsSeleccionados.includes(campo.id))
          .forEach((campo) => {
            const claveSeccionExtraccion =
              campo.claveSeccionExtraccion ?? seccion.claveSeccion;
            const camposSeleccionados = campo.clavesCamposExtraccion ?? [
              campo.claveCampo,
            ];

            acumulado[claveSeccionExtraccion] = [
              ...(acumulado[claveSeccionExtraccion] ?? []),
              ...camposSeleccionados,
            ];
          });

        return acumulado;
      },
      {},
    );

  const manejarExtraer = async (
    modo: ModoProcesamientoInforme = "revision",
  ) => {
    if (estaAccionDeshabilitada) return;

    setEstaProcesando(true);
    setModoProcesando(modo);
    try {
      await onExtraer(
        archivosSeleccionados,
        alcance,
        especificaciones,
        construirConfiguracionSecciones(),
        modo,
      );
      limpiarEstado();
      onCerrar();
    } finally {
      setModoProcesando(null);
      setEstaProcesando(false);
    }
  };

  return {
    actualizarCamposSeccion,
    agregarArchivos,
    archivosSeleccionados,
    camposSeleccionadosPorSeccion,
    descripcion,
    eliminarArchivo,
    especificaciones,
    estaAccionDeshabilitada,
    estaProcesando,
    manejarCerrar,
    manejarExtraer,
    modoProcesando,
    seccionesConOpciones,
    setEspecificaciones,
    titulo,
    totalCamposSeleccionados,
  };
}
