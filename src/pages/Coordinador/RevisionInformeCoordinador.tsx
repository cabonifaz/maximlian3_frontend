import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { CustomModalRechazoInforme } from "@maximilian/components/coordinador/CustomModalRechazoInforme";
import { CustomVisorRevisionInforme } from "@maximilian/components/coordinador/CustomVisorRevisionInforme";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import PantallaCarga from "@maximilian/components/common/PantallaCarga";
import { informeService } from "@maximilian/services/informe.service";
import { servicioInformeObservacion } from "@maximilian/services/informeObservacion.service";
import type {
  FormatoDescargaInforme,
  InformeActualizarEstadoRequest,
  InformeObservacion,
} from "@maximilian/shared/types/informe.type";
import { obtenerDatosInvestigacionAnalista } from "@maximilian/shared/utils/datos-simulados-investigacion";

const ID_ESTADO_INFORME_APROBADO = 4;

export default function RevisionInformeCoordinador() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { idPedido } = useParams();
  const [parametrosBusqueda] = useSearchParams();
  const idInforme = Number(parametrosBusqueda.get("idInforme"));
  const idInformeOriginal = Number(parametrosBusqueda.get("idInformeOriginal"));
  const idIdioma = Number(parametrosBusqueda.get("idIdioma"));
  const esEjemplo = parametrosBusqueda.get("ejemplo") === "1";
  const tieneInformeOriginal = Number.isFinite(idInformeOriginal) && idInformeOriginal > 0;
  const [estaAbiertoModalRechazo, setEstaAbiertoModalRechazo] = useState(false);
  const [observacionesRechazo, setObservacionesRechazo] = useState<InformeObservacion[]>([]);
  const datosEjemplo = useMemo(
    () => obtenerDatosInvestigacionAnalista("detalle"),
    [],
  );

  const { data: informeObtenido, isLoading } = useQuery({
    queryKey: ["coordinador-revision-detalle", idPedido],
    queryFn: () => informeService.obtener({ idPedido: Number(idPedido) }),
    enabled:
      !esEjemplo && Number.isFinite(Number(idPedido)) && Number(idPedido) > 0,
  });

  const datosInvestigacion =
    informeObtenido?.datosInvestigacion ??
    (esEjemplo ? datosEjemplo : undefined);
  const idPedidoNumerico = Number(idPedido);
  const idInformeSeguro =
    informeObtenido?.idInforme ?? (Number.isFinite(idInforme) ? idInforme : 0);
  const puedeDescargar = !esEjemplo
    && idInformeSeguro > 0
    && Number.isFinite(idPedidoNumerico)
    && idPedidoNumerico > 0;
  const puedeDescargarOriginal = !esEjemplo
    && tieneInformeOriginal
    && Number.isFinite(idPedidoNumerico)
    && idPedidoNumerico > 0;
  const idiomaInformeTraducido = idIdioma === 2
    ? "Ingl\u00e9s"
    : idIdioma === 3
      ? "Portugu\u00e9s"
      : "Traducido";
  const encabezadoVistaPrevia = {
    pais: datosInvestigacion?.identificacion.pais || "-",
    fecha: new Date().toLocaleDateString("es-PE"),
    tipoSolicitud: "-",
    analista: "-",
    traductor: "-",
  };

  const {
    data: observacionesGuardadas,
    isLoading: estaCargandoObservaciones,
  } = useQuery({
    queryKey: ["informe-observaciones", idPedidoNumerico],
    queryFn: () => servicioInformeObservacion.listar(idPedidoNumerico),
    enabled: !esEjemplo && Number.isFinite(idPedidoNumerico) && idPedidoNumerico > 0,
  });

  const mutationRevision = useMutation({
    mutationFn: async (payload: InformeActualizarEstadoRequest) => {
      if (esEjemplo) return;
      await informeService.actualizarEstado(payload);
    },
    onSuccess: async (_, payload) => {
      setEstaAbiertoModalRechazo(false);
      setObservacionesRechazo([]);
      if (esEjemplo) {
        toast.success(
          payload.idEstadoInforme === ID_ESTADO_INFORME_APROBADO
            ? "Ejemplo aprobado."
            : "Ejemplo rechazado.",
        );
      }
      await queryClient.invalidateQueries({
        queryKey: ["informes-bandeja-coordinador-revision"],
      });
      navigate("/coordinador/revision");
    },
    onError: () => {
      toast.error("No se pudo actualizar el estado del informe.");
    },
  });

  const mutationRechazo = useMutation({
    mutationFn: async (observaciones: InformeObservacion[]) => {
      if (esEjemplo) return;

      const observacionesNuevas = observaciones.filter(
        (observacion) => observacion.idInformeObservacion <= 0,
      );
      const observacionesOriginales = new Map(
        (observacionesGuardadas ?? []).map((observacion) => [
          observacion.idInformeObservacion,
          observacion,
        ]),
      );
      const observacionesEditadas = observaciones.filter((observacion) => {
        if (observacion.idInformeObservacion <= 0) return false;
        const original = observacionesOriginales.get(observacion.idInformeObservacion);
        return Boolean(
          original
          && (original.observacion !== observacion.observacion
            || original.checked !== observacion.checked),
        );
      });

      await Promise.all(
        observacionesEditadas.map((observacion) =>
          servicioInformeObservacion.editar(observacion),
        ),
      );

      if (observacionesNuevas.length > 0) {
        await servicioInformeObservacion.insertarLote({
          idInforme: idInformeSeguro,
          idPedido: idPedidoNumerico,
          observaciones: observacionesNuevas.map(({ observacion, checked }) => ({
            observacion,
            checked,
          })),
        });
      }
    },
    onSuccess: async () => {
      setEstaAbiertoModalRechazo(false);
      setObservacionesRechazo([]);
      if (esEjemplo) toast.success("Ejemplo rechazado.");
      await queryClient.invalidateQueries({
        queryKey: ["informes-bandeja-coordinador-revision"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["informe-observaciones", idPedidoNumerico],
      });
      navigate("/coordinador/revision");
    },
  });

  const mutationEliminarObservacion = useMutation({
    mutationFn: (idInformeObservacion: number) =>
      servicioInformeObservacion.eliminar({ idInformeObservacion }),
    onSuccess: async (_, idInformeObservacion) => {
      setObservacionesRechazo((observaciones) =>
        observaciones.filter(
          (observacion) => observacion.idInformeObservacion !== idInformeObservacion,
        ),
      );
      await queryClient.invalidateQueries({
        queryKey: ["informe-observaciones", idPedidoNumerico],
      });
    },
  });

  const puedeEditarRevision =
    !isLoading
    && !estaCargandoObservaciones
    && !mutationRevision.isPending
    && !mutationRechazo.isPending
    && !mutationEliminarObservacion.isPending
    && Boolean(datosInvestigacion);

  const cerrarModalRechazo = () => {
    if (mutationRechazo.isPending) return;
    setEstaAbiertoModalRechazo(false);
  };

  const abrirModalRechazo = () => {
    if (observacionesRechazo.length === 0 && observacionesGuardadas) {
      setObservacionesRechazo(observacionesGuardadas);
    }
    setEstaAbiertoModalRechazo(true);
  };

  const confirmarRechazo = () => {
    const observacionesValidas = observacionesRechazo
      .map((observacion) => ({
        ...observacion,
        observacion: observacion.observacion.trim(),
      }))
      .filter((observacion) => observacion.observacion);
    if (!observacionesValidas.some((observacion) => observacion.idInformeObservacion <= 0)) return;

    mutationRechazo.mutate(observacionesValidas);
  };

  const descargarDocumento = async (formato: FormatoDescargaInforme, idInformeDescarga = idInformeSeguro) => {
    const etiquetaFormato = formato.slice(1).toUpperCase();
    const idToast = toast.loading(`Descargando documento ${etiquetaFormato}...`);
    try {
      const documentoDescarga = await informeService.obtenerDocumento(
        idInformeDescarga,
        idPedidoNumerico,
        formato,
      );
      const enlace = document.createElement("a");
      enlace.href = documentoDescarga.url;
      enlace.rel = "noopener noreferrer";
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      toast.dismiss(idToast);
    } catch {
      toast.error(`No se pudo descargar el documento ${etiquetaFormato}.`, { id: idToast });
    }
  };

  if (isLoading) return <PantallaCarga message="Obteniendo informe..." />;

  if (tieneInformeOriginal) {
    return (
      <>
        <div className="flex h-[calc(100vh-4rem)] min-h-0 flex-col overflow-hidden bg-slate-100">
          <div className="grid min-h-0 flex-1 gap-3 overflow-hidden p-3 xl:grid-cols-2">
            <CustomVisorRevisionInforme
              datosInvestigacion={datosInvestigacion}
              encabezado={encabezadoVistaPrevia}
              idInforme={idInformeOriginal}
              idPedido={esEjemplo ? undefined : idPedidoNumerico}
              puedeDescargar={puedeDescargarOriginal}
              puedeEditar={false}
              esEjemplo={esEjemplo}
              tituloInforme="Informe original"
              idiomaInforme={"Espa\u00f1ol"}
              mostrarAccionesRevision={false}
              mostrarPie={false}
              mostrarCerrar={false}
              onCerrar={() => navigate("/coordinador/revision")}
              onDescargar={(formato) => {
                void descargarDocumento(formato, idInformeOriginal);
              }}
              onAprobar={() => undefined}
              onRechazar={() => undefined}
              onVolver={() => navigate("/coordinador/revision")}
            />

            <CustomVisorRevisionInforme
              datosInvestigacion={datosInvestigacion}
              encabezado={encabezadoVistaPrevia}
              idInforme={esEjemplo ? undefined : idInformeSeguro}
              idPedido={esEjemplo ? undefined : idPedidoNumerico}
              puedeDescargar={puedeDescargar}
              puedeEditar={puedeEditarRevision}
              esEjemplo={esEjemplo}
              tituloInforme="Informe traducido"
              idiomaInforme={idiomaInformeTraducido}
              mostrarAccionesRevision
              mostrarInformeTraducido
              mostrarPie={false}
              mostrarCerrar={false}
              onCerrar={() => navigate("/coordinador/revision")}
              onDescargar={(formato) => {
                void descargarDocumento(formato);
              }}
              onAprobar={() => mutationRevision.mutate({
                idInforme: idInformeSeguro,
                idEstadoInforme: ID_ESTADO_INFORME_APROBADO,
              })}
              onRechazar={abrirModalRechazo}
              onVolver={() => navigate("/coordinador/revision")}
            />
          </div>

          <footer className="z-30 flex shrink-0 items-center justify-end gap-3 border-t border-slate-200 bg-white/95 px-5 py-2.5 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="text-sm text-slate-500">
              {"Revisi\u00f3n activa"}
            </div>
            <CustomButton variant="secondary" size="sm" onClick={() => navigate("/coordinador/revision")}>
              Volver a informes
            </CustomButton>
          </footer>
        </div>

        <CustomModalRechazoInforme
          estaAbierto={estaAbiertoModalRechazo}
          observacionesRechazo={observacionesRechazo}
          onObservacionesRechazoChange={setObservacionesRechazo}
          onCerrar={cerrarModalRechazo}
          onConfirmar={confirmarRechazo}
          onEliminarObservacion={(observacion) => {
            mutationEliminarObservacion.mutate(observacion.idInformeObservacion);
          }}
          idObservacionEliminando={mutationEliminarObservacion.variables}
          cargando={mutationRechazo.isPending}
        />
      </>
    );
  }

  return (
    <>
      <CustomVisorRevisionInforme
        datosInvestigacion={datosInvestigacion}
        encabezado={encabezadoVistaPrevia}
        idInforme={esEjemplo ? undefined : idInformeSeguro}
        idPedido={esEjemplo ? undefined : idPedidoNumerico}
        puedeDescargar={puedeDescargar}
        puedeEditar={puedeEditarRevision}
        esEjemplo={esEjemplo}
        onCerrar={() => navigate("/coordinador/revision")}
        onDescargar={(formato) => {
          void descargarDocumento(formato);
        }}
        onAprobar={() => mutationRevision.mutate({
          idInforme: idInformeSeguro,
          idEstadoInforme: ID_ESTADO_INFORME_APROBADO,
        })}
        onRechazar={abrirModalRechazo}
        onVolver={() => navigate("/coordinador/revision")}
      />

      <CustomModalRechazoInforme
        estaAbierto={estaAbiertoModalRechazo}
        observacionesRechazo={observacionesRechazo}
        onObservacionesRechazoChange={setObservacionesRechazo}
        onCerrar={cerrarModalRechazo}
        onConfirmar={confirmarRechazo}
        onEliminarObservacion={(observacion) => {
          mutationEliminarObservacion.mutate(observacion.idInformeObservacion);
        }}
        idObservacionEliminando={mutationEliminarObservacion.variables}
        cargando={mutationRechazo.isPending}
      />
    </>
  );
}
