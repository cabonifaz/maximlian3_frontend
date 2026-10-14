import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { servicioInformeMigracion } from "@maximilian/services/informe-migracion.service";
import { INTERVALO_ACTUALIZACION_LOTES_MIGRACION_MS } from "@maximilian/shared/constants/components/common/migracion-informe.constants";
import type { DatosLoteMigracionInforme } from "@maximilian/schemas/informe-migracion.schema";
import type { RolMigracionInforme } from "@maximilian/shared/types/informe-migracion.type";

export function useLotesMigracionInforme(rol: RolMigracionInforme) {
  const clienteConsulta = useQueryClient();
  const consulta = useQuery({
    queryKey: ["lotes-migracion-informe", rol],
    queryFn: ({ signal }) => servicioInformeMigracion.listarLotes(rol, signal),
    refetchInterval: (consultaActual) => consultaActual.state.data?.lotes.some(
      (lote) => !["completado", "fallido", "parcial"].includes(lote.estado),
    ) ? INTERVALO_ACTUALIZACION_LOTES_MIGRACION_MS : false,
    retry: false,
  });

  const crear = useMutation({
    mutationFn: async (datos: DatosLoteMigracionInforme) => {
      const respuesta = await servicioInformeMigracion.crearLote({
        nombre: datos.nombre,
        rol,
        idPlantilla: datos.idPlantilla,
        idIdiomaOrigen: datos.idIdiomaOrigen,
        idIdiomaDestino: rol === "traductor" ? datos.idIdiomaDestino : undefined,
        idFormatoFecha: datos.idFormatoFecha,
        archivos: datos.archivos.map((archivo) => ({
          nombre: archivo.name,
          tipoArchivo: archivo.type,
          tamano: archivo.size,
        })),
      });

      const archivosPorNombre = new Map(datos.archivos.map((archivo) => [archivo.name, archivo]));
      const idToast = toast.loading("Cargando documentos del lote...");
      try {
        await Promise.all(respuesta.archivos.map((archivoCarga) => {
          const archivo = archivosPorNombre.get(archivoCarga.nombre);
          if (!archivo) throw new Error("El backend devolvió un archivo no solicitado");
          return servicioInformeMigracion.subirArchivoLote(archivoCarga.urlCarga, archivo);
        }));
        await servicioInformeMigracion.iniciarLote(respuesta.idLote);
        toast.dismiss(idToast);
      } catch {
        toast.error("No se pudieron cargar todos los documentos. El lote no fue iniciado.", { id: idToast });
        throw new Error("Carga de lote incompleta");
      }
    },
    onSuccess: () => clienteConsulta.invalidateQueries({ queryKey: ["lotes-migracion-informe", rol] }),
  });

  const reintentar = useMutation({
    mutationFn: servicioInformeMigracion.reintentarLote,
    onSuccess: () => clienteConsulta.invalidateQueries({ queryKey: ["lotes-migracion-informe", rol] }),
  });

  return { ...consulta, crear, reintentar };
}
