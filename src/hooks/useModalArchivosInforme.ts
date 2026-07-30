import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ReferenciaBloqueCargaArchivosAnalista } from "@maximilian/components/investigacion/CustomBloqueCargaArchivos";
import { informeService } from "@maximilian/services/informe.service";
import { servicioInformeArchivo } from "@maximilian/services/informe-archivo.service";
import { servicioTablaMaestra } from "@maximilian/services/tabla-maestra.service";
import type { ArchivoInvestigacionAnalista } from "@maximilian/shared/types/investigacion.type";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import { obtenerExtensionArchivo } from "@maximilian/shared/utils/archivo.util";
import { traducirOpcionesTablaMaestra } from "@maximilian/shared/utils/tabla-maestra-idioma.util";

interface ParametrosUseModalArchivosInforme {
  archivos: ArchivoInvestigacionAnalista[];
  estaAbierto: boolean;
  idIdioma?: number;
  idInforme?: number;
  idPedido?: number;
  onArchivosChange: (archivos: ArchivoInvestigacionAnalista[]) => void;
  onInformeCreado?: (idInforme: number) => void;
  soloLectura: boolean;
}

export function esOpcionEvidencia(opcion?: {
  string1?: string | null;
  string2?: string | null;
  string3?: string | null;
  string4?: string | null;
  string5?: string | null;
  string6?: string | null;
  string7?: string | null;
}) {
  return [
    opcion?.string1,
    opcion?.string2,
    opcion?.string3,
    opcion?.string4,
    opcion?.string5,
    opcion?.string6,
    opcion?.string7,
  ].some((texto) => texto?.trim().toLowerCase().includes("evid"));
}

export function useModalArchivosInforme({
  archivos,
  estaAbierto,
  idIdioma,
  idInforme,
  idPedido,
  onArchivosChange,
  onInformeCreado,
  soloLectura,
}: ParametrosUseModalArchivosInforme) {
  const bloqueCargaRef = useRef<ReferenciaBloqueCargaArchivosAnalista>(null);
  const [idArchivoDescargando, setIdArchivoDescargando] = useState<string | null>(null);
  const [idArchivoActualizando, setIdArchivoActualizando] = useState<string | null>(null);
  const [archivoAEliminar, setArchivoAEliminar] =
    useState<ArchivoInvestigacionAnalista | null>(null);
  const [estaEliminando, setEstaEliminando] = useState(false);
  const [estaGuardandoArchivos, setEstaGuardandoArchivos] = useState(false);

  const { data: opcionesTipoEvidenciaBase } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.TIPO_EVIDENCIA],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.TIPO_EVIDENCIA),
    enabled: estaAbierto,
    staleTime: Infinity,
  });
  const { data: opcionesFaseEvidenciaBase } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.FASE_EVIDENCIA],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.FASE_EVIDENCIA),
    enabled: estaAbierto,
    staleTime: Infinity,
  });

  const opcionesTipoEvidencia = useMemo(
    () => traducirOpcionesTablaMaestra(opcionesTipoEvidenciaBase, idIdioma),
    [idIdioma, opcionesTipoEvidenciaBase],
  );
  const opcionesFaseEvidencia = useMemo(
    () => traducirOpcionesTablaMaestra(opcionesFaseEvidenciaBase, idIdioma),
    [idIdioma, opcionesFaseEvidenciaBase],
  );

  const obtenerIdTipoEvidencia = (archivo: ArchivoInvestigacionAnalista) =>
    archivo.idTipoEvidencia ??
    opcionesTipoEvidencia?.find(
      (opcion) =>
        opcion.string1?.trim().toLowerCase() ===
        archivo.tipoDocumento.toLowerCase(),
    )?.num1 ??
    undefined;

  const esTipoEvidencia = (archivo: ArchivoInvestigacionAnalista) => {
    const idTipoEvidencia = obtenerIdTipoEvidencia(archivo);
    const opcionTipo = opcionesTipoEvidencia?.find(
      (opcion) => opcion.num1 === idTipoEvidencia,
    );

    return esOpcionEvidencia(opcionTipo) || archivo.tipoDocumento === "Evidencia";
  };

  const archivosNuevos = archivos.filter(
    (archivo) => !archivo.esPersistido && archivo.archivo,
  );
  const archivosNuevosSinTipo = archivosNuevos.filter(
    (archivo) => !obtenerIdTipoEvidencia(archivo),
  );
  const archivosNuevosEvidenciaSinFase = archivosNuevos.filter(
    (archivo) => esTipoEvidencia(archivo) && !archivo.idFaseEvidencia,
  );
  const hayArchivosNuevosIncompletos =
    archivosNuevosSinTipo.length > 0 || archivosNuevosEvidenciaSinFase.length > 0;

  const descargarArchivo = async (archivo: ArchivoInvestigacionAnalista) => {
    if (!archivo.idInformeArchivo && !archivo.urlDescarga) return;

    setIdArchivoDescargando(archivo.id);
    try {
      const downloadUrl = archivo.idInformeArchivo
        ? (
            await servicioInformeArchivo.obtener({
              idInformeArchivo: archivo.idInformeArchivo,
            })
          ).downloadUrl
        : archivo.urlDescarga;
      if (downloadUrl) window.open(downloadUrl, "_blank", "noopener,noreferrer");
    } finally {
      setIdArchivoDescargando(null);
    }
  };

  const agregarArchivos = (listaArchivos: File[]) => {
    if (soloLectura || !listaArchivos.length) return;

    const nuevosArchivos: ArchivoInvestigacionAnalista[] = listaArchivos.map(
      (archivo) => ({
        id: `${archivo.name}-${archivo.size}-${Date.now()}-${Math.random()}`,
        nombre: archivo.name,
        extension: obtenerExtensionArchivo(archivo.name),
        tamano: archivo.size,
        tipoDocumento: "",
        archivo,
      }),
    );

    onArchivosChange([...archivos, ...nuevosArchivos]);
  };

  const actualizarArchivoLocal = (
    idArchivo: string,
    cambios: Partial<ArchivoInvestigacionAnalista>,
  ) => {
    onArchivosChange(
      archivos.map((item) => (item.id === idArchivo ? { ...item, ...cambios } : item)),
    );
  };

  const quitarArchivoLocal = (idArchivo: string) => {
    onArchivosChange(archivos.filter((item) => item.id !== idArchivo));
  };

  const actualizarArchivoPersistido = async (
    archivo: ArchivoInvestigacionAnalista,
    cambios: Pick<
      ArchivoInvestigacionAnalista,
      "idTipoEvidencia" | "idFaseEvidencia" | "tipoDocumento"
    >,
  ) => {
    if (soloLectura || !archivo.idInformeArchivo || !cambios.idTipoEvidencia) return;

    setIdArchivoActualizando(archivo.id);
    try {
      await servicioInformeArchivo.actualizar({
        idInformeArchivo: archivo.idInformeArchivo,
        idTipoArchivo: cambios.idTipoEvidencia,
        idFaseEvidencia: cambios.idFaseEvidencia ?? null,
      });
      actualizarArchivoLocal(archivo.id, cambios);
    } finally {
      setIdArchivoActualizando(null);
    }
  };

  const guardarArchivosNuevos = async () => {
    if (soloLectura || !idPedido || archivosNuevos.length === 0) return;
    if (archivosNuevosSinTipo.length > 0) {
      toast.error("Selecciona el tipo de todos los archivos antes de adjuntar.");
      return;
    }
    if (archivosNuevosEvidenciaSinFase.length > 0) {
      toast.error("Selecciona la fase de cada evidencia antes de adjuntar.");
      return;
    }

    const toastId = toast.loading("Preparando archivos...");
    setEstaGuardandoArchivos(true);
    try {
      const respuestaUrls = await servicioInformeArchivo.generarUrls({
        idPedido,
        nombres: archivosNuevos.map((archivo) => archivo.nombre),
      });
      const idInformeParaArchivos = respuestaUrls.idInforme ?? idInforme ?? 0;
      const urlsDisponibles = [...respuestaUrls.archivos];
      const archivosSubidos: Array<{
        archivo: ArchivoInvestigacionAnalista;
        archivoUrl: string;
      }> = [];
      const nombresFallidos: string[] = [];

      for (const archivo of archivosNuevos) {
        const indiceUrl = urlsDisponibles.findIndex(
          (item) => item.nombre === archivo.nombre,
        );
        const urlGenerada =
          indiceUrl >= 0 ? urlsDisponibles.splice(indiceUrl, 1)[0] : urlsDisponibles.shift();

        if (!urlGenerada || !archivo.archivo) {
          nombresFallidos.push(archivo.nombre);
          continue;
        }

        try {
          toast.loading(`Subiendo ${archivo.nombre}...`, { id: toastId });
          await informeService.subirArchivoUrlPrefirmada(
            urlGenerada.uploadUrl,
            archivo.archivo,
          );
          archivosSubidos.push({ archivo, archivoUrl: urlGenerada.archivoUrl });
        } catch {
          nombresFallidos.push(archivo.nombre);
        }
      }

      if (archivosSubidos.length > 0) {
        toast.loading("Registrando archivos...", { id: toastId });
        const respuestaInsercion = await servicioInformeArchivo.insertarLote({
          idInforme: idInformeParaArchivos,
          idPedido,
          archivos: archivosSubidos.map(({ archivo, archivoUrl }) => ({
            nombre: archivo.nombre,
            archivoUrl,
            extension: archivo.extension,
            tamanoBytes: archivo.tamano,
            idTipoArchivo: archivo.idTipoEvidencia ?? null,
            idFaseEvidencia: archivo.idFaseEvidencia ?? null,
          })),
        });
        const idInformeCreado = respuestaInsercion.idInforme ?? respuestaUrls.idInforme;
        if (!idInforme && idInformeCreado) {
          onInformeCreado?.(idInformeCreado);
        }

        const idsSubidos = new Set(archivosSubidos.map(({ archivo }) => archivo.id));
        onArchivosChange(
          archivos.map((archivo) =>
            idsSubidos.has(archivo.id)
              ? { ...archivo, esPersistido: true, archivo: undefined }
              : archivo,
          ),
        );
      }

      if (nombresFallidos.length > 0) {
        toast.error(`No se pudieron subir: ${nombresFallidos.join(", ")}.`, {
          id: toastId,
        });
      } else {
        toast.dismiss(toastId);
      }
    } catch {
      toast.error("No se pudieron adjuntar los archivos.", { id: toastId });
    } finally {
      setEstaGuardandoArchivos(false);
    }
  };

  const eliminarArchivoPersistido = async () => {
    if (soloLectura || !archivoAEliminar?.idInformeArchivo) return;

    setEstaEliminando(true);
    try {
      await servicioInformeArchivo.eliminar({
        idInformeArchivo: archivoAEliminar.idInformeArchivo,
      });
      quitarArchivoLocal(archivoAEliminar.id);
      setArchivoAEliminar(null);
    } finally {
      setEstaEliminando(false);
    }
  };

  return {
    actualizarArchivoLocal,
    actualizarArchivoPersistido,
    agregarArchivos,
    archivoAEliminar,
    archivosNuevos,
    archivosNuevosEvidenciaSinFase,
    archivosNuevosSinTipo,
    bloqueCargaRef,
    descargarArchivo,
    eliminarArchivoPersistido,
    esTipoEvidencia,
    estaEliminando,
    estaGuardandoArchivos,
    guardarArchivosNuevos,
    hayArchivosNuevosIncompletos,
    idArchivoActualizando,
    idArchivoDescargando,
    obtenerIdTipoEvidencia,
    opcionesFaseEvidencia,
    opcionesTipoEvidencia,
    quitarArchivoLocal,
    setArchivoAEliminar,
  };
}
