import { useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { CustomModalRechazoInforme } from "@maximilian/components/coordinador/CustomModalRechazoInforme";
import { CustomVisorRevisionInforme } from "@maximilian/components/coordinador/CustomVisorRevisionInforme";
import { informeService } from "@maximilian/services/informe.service";
import { pedidoService } from "@maximilian/services/pedido.service";
import { servicioInformeObservacion } from "@maximilian/services/informeObservacion.service";
import { servicioTablaMaestra } from "@maximilian/services/tablaMaestra.service";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import type {
  FormatoDescargaInforme,
  InformeActualizarEstadoRequest,
  InformeObservacion,
} from "@maximilian/shared/types/informe.type";

const ID_ESTADO_INFORME_APROBADO = 4;
type TabInformeComparado = "original" | "traducido";

export default function RevisionInformeCoordinador() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { idPedido } = useParams();
  const [parametrosBusqueda] = useSearchParams();
  const idInforme = Number(parametrosBusqueda.get("idInforme"));
  const idInformeOriginal = Number(parametrosBusqueda.get("idInformeOriginal"));
  const idIdioma = Number(parametrosBusqueda.get("idIdioma"));
  const tieneInformeOriginal = Number.isFinite(idInformeOriginal) && idInformeOriginal > 0;
  const [estaAbiertoModalRechazo, setEstaAbiertoModalRechazo] = useState(false);
  const [observacionesRechazo, setObservacionesRechazo] = useState<InformeObservacion[]>([]);
  const [tabInformeComparado, setTabInformeComparado] = useState<TabInformeComparado>("original");
  const datosInvestigacion = undefined;
  const idPedidoNumerico = Number(idPedido);
  const idInformeSeguro =
    Number.isFinite(idInforme) ? idInforme : 0;
  const puedeDescargar = idInformeSeguro > 0
    && Number.isFinite(idPedidoNumerico)
    && idPedidoNumerico > 0;
  const puedeDescargarOriginal = tieneInformeOriginal
    && Number.isFinite(idPedidoNumerico)
    && idPedidoNumerico > 0;
  const encabezadoVistaPrevia = {
    pais: "-",
    fecha: new Date().toLocaleDateString("es-PE"),
    tipoSolicitud: "-",
    analista: "-",
    traductor: "-",
  };

  const { data: pedido } = useQuery({
    queryKey: ["pedido-revision-descarga", idPedidoNumerico],
    queryFn: () => pedidoService.getById(idPedidoNumerico),
    enabled: Number.isFinite(idPedidoNumerico) && idPedidoNumerico > 0,
  });
  const puedeDescargarXml = pedido?.idPlantilla === 5;
  const idPlantillaPedido = pedido?.idPlantilla;
  const idIdiomaPedido = pedido?.idIdioma || idIdioma;

  const { data: opcionesPlantillaInforme } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.PLANTILLA_INFORME],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.PLANTILLA_INFORME),
    staleTime: Infinity,
  });

  const { data: opcionesIdioma } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.IDIOMA],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.IDIOMA),
    staleTime: Infinity,
  });

  const opcionPlantillaInforme = opcionesPlantillaInforme?.find(
    (opcion) => opcion.num1 === idPlantillaPedido,
  );
  const nombrePlantillaInforme = idPlantillaPedido
    ? opcionPlantillaInforme?.string1 || opcionPlantillaInforme?.descripcion || `Plantilla ${idPlantillaPedido}`
    : "";
  const opcionIdioma = opcionesIdioma?.find((opcion) => opcion.num1 === idIdiomaPedido);
  const idiomaInformeTraducido = idIdiomaPedido
    ? opcionIdioma?.string1
      || opcionIdioma?.descripcion
      || (idIdiomaPedido === 2 ? "Ingl\u00e9s" : idIdiomaPedido === 3 ? "Portugu\u00e9s" : "Traducido")
    : "Traducido";

  const {
    data: observacionesGuardadas,
    isLoading: estaCargandoObservaciones,
  } = useQuery({
    queryKey: ["informe-observaciones", idPedidoNumerico],
    queryFn: () => servicioInformeObservacion.listar(idPedidoNumerico),
    enabled: Number.isFinite(idPedidoNumerico) && idPedidoNumerico > 0,
  });

  const mutationRevision = useMutation({
    mutationFn: async (payload: InformeActualizarEstadoRequest) => {
      await informeService.actualizarEstado(payload);
    },
    onSuccess: async () => {
      setEstaAbiertoModalRechazo(false);
      setObservacionesRechazo([]);
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
    !estaCargandoObservaciones
    && !mutationRevision.isPending
    && !mutationRechazo.isPending
    && !mutationEliminarObservacion.isPending
    && (Boolean(datosInvestigacion) || puedeDescargar);

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
    if (formato === ".xml" && !puedeDescargarXml) {
      toast.error("La descarga XML solo esta disponible para la plantilla permitida.");
      return;
    }

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

  if (tieneInformeOriginal) {
    return (
      <>
        <div className="flex h-[calc(100vh-4rem)] min-h-0 flex-col overflow-hidden bg-slate-100">
          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-3">
            <div className="grid shrink-0 grid-cols-2 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm xl:hidden">
              <button
                type="button"
                onClick={() => setTabInformeComparado("original")}
                className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  tabInformeComparado === "original"
                    ? "bg-brand-black text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                Original
              </button>
              <button
                type="button"
                onClick={() => setTabInformeComparado("traducido")}
                className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  tabInformeComparado === "traducido"
                    ? "bg-brand-black text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                Traducido
              </button>
            </div>

            <div className="grid min-h-0 flex-1 gap-3 overflow-hidden xl:grid-cols-2">
              <div className={`${tabInformeComparado === "original" ? "h-full min-h-0" : "hidden h-full min-h-0"} xl:block`}>
                <CustomVisorRevisionInforme
                  datosInvestigacion={datosInvestigacion}
                  encabezado={encabezadoVistaPrevia}
                  idInforme={idInformeOriginal}
                  idPedido={idPedidoNumerico}
                  puedeDescargar={puedeDescargarOriginal}
                  puedeDescargarXml={puedeDescargarXml}
                  puedeEditar={false}
                  tituloInforme="Informe original"
                  idiomaInforme={"Espa\u00f1ol"}
                  tipoPlantilla={nombrePlantillaInforme}
                  mostrarAccionesRevision={false}
                  mostrarPie={false}
                  mostrarCerrar={false}
                  mostrarRegresar
                  mostrarEncabezadoRevision={false}
                  ocuparAltoDisponible
                  onCerrar={() => navigate("/coordinador/revision")}
                  onDescargar={(formato) => {
                    void descargarDocumento(formato, idInformeOriginal);
                  }}
                  onAprobar={() => undefined}
                  onRechazar={() => undefined}
                  onVolver={() => navigate("/coordinador/revision")}
                />
              </div>

              <div className={`${tabInformeComparado === "traducido" ? "h-full min-h-0" : "hidden h-full min-h-0"} xl:block`}>
                <CustomVisorRevisionInforme
                  datosInvestigacion={datosInvestigacion}
                  encabezado={encabezadoVistaPrevia}
                  idInforme={idInformeSeguro}
                  idPedido={idPedidoNumerico}
                  puedeDescargar={puedeDescargar}
                  puedeDescargarXml={puedeDescargarXml}
                  puedeEditar={puedeEditarRevision}
                  tituloInforme="Informe traducido"
                  idiomaInforme={idiomaInformeTraducido}
                  tipoPlantilla={nombrePlantillaInforme}
                  mostrarAccionesRevision
                  mostrarInformeTraducido
                  mostrarPie={false}
                  mostrarCerrar={false}
                  mostrarRegresar={false}
                  ocuparAltoDisponible
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
            </div>
          </div>
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
        idInforme={idInformeSeguro}
        idPedido={idPedidoNumerico}
        puedeDescargar={puedeDescargar}
        puedeDescargarXml={puedeDescargarXml}
        puedeEditar={puedeEditarRevision}
        tituloInforme={idIdiomaPedido && idIdiomaPedido !== 1 ? "Informe traducido" : "Informe original"}
        idiomaInforme={idIdiomaPedido && idIdiomaPedido !== 1 ? idiomaInformeTraducido : "Espa\u00f1ol"}
        tipoPlantilla={nombrePlantillaInforme}
        mostrarInformeTraducido={Boolean(idIdiomaPedido && idIdiomaPedido !== 1)}
        mostrarPie={false}
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
