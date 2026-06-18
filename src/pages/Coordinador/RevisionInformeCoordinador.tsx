import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { CustomModalRechazoInforme } from "@maximilian/components/coordinador/CustomModalRechazoInforme";
import { CustomVisorRevisionInforme } from "@maximilian/components/coordinador/CustomVisorRevisionInforme";
import PantallaCarga from "@maximilian/components/common/PantallaCarga";
import { informeService } from "@maximilian/services/informe.service";
import { servicioTablaMaestra } from "@maximilian/services/tablaMaestra.service";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import { construirPayloadInforme } from "@maximilian/shared/utils/construirPayloadInforme";
import { obtenerDatosInvestigacionAnalista } from "@maximilian/shared/utils/datos-simulados-investigacion";

const ID_ESTADO_INFORME_APROBADO = 4;
const ID_ESTADO_INFORME_RECHAZADO = 2;

export default function RevisionInformeCoordinador() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { idPedido } = useParams();
  const [parametrosBusqueda] = useSearchParams();
  const idInforme = Number(parametrosBusqueda.get("idInforme"));
  const esEjemplo = parametrosBusqueda.get("ejemplo") === "1";
  const [estaAbiertoModalRechazo, setEstaAbiertoModalRechazo] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState("");
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

  const { data: opcionesTipoPersona } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.TIPO_PERSONA],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.TIPO_PERSONA),
    staleTime: Infinity,
  });

  const { data: opcionesPais } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.PAIS],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.PAIS),
    staleTime: Infinity,
  });

  const { data: opcionesEstadoCliente } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.ESTADO_CLIENTE],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.ESTADO_CLIENTE),
    staleTime: Infinity,
  });

  const { data: opcionesSectorEconomico } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.SECTOR_ECONOMICO],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.SECTOR_ECONOMICO),
    staleTime: Infinity,
  });

  const datosInvestigacion =
    informeObtenido?.datosInvestigacion ??
    (esEjemplo ? datosEjemplo : undefined);
  const idPedidoNumerico = Number(idPedido);
  const idInformeSeguro =
    informeObtenido?.idInforme ?? (Number.isFinite(idInforme) ? idInforme : 0);

  const {
    data: documentoGenerado,
    isLoading: estaCargandoDocumento,
    isError: errorDocumento,
  } = useQuery({
    queryKey: ["informe-documento-generado", idInformeSeguro, idPedidoNumerico],
    queryFn: () =>
      informeService.generarDocumento(idInformeSeguro, idPedidoNumerico),
    enabled:
      !esEjemplo &&
      idInformeSeguro > 0 &&
      Number.isFinite(idPedidoNumerico) &&
      idPedidoNumerico > 0,
    staleTime: 15 * 60 * 1000,
  });

  const mutationRevision = useMutation({
    mutationFn: async (idEstadoInforme: number) => {
      if (esEjemplo) return;

      const payload = construirPayloadInforme({
        idPedido: Number.isFinite(idPedidoNumerico) ? idPedidoNumerico : 0,
        idInforme: idInformeSeguro,
        idEstadoInforme,
        datosInvestigacion: datosInvestigacion!,
        opcionesTipoPersona,
        opcionesPais,
        opcionesEstadoCliente,
        opcionesSectorEconomico,
      });

      await informeService.editar(payload);
    },
    onSuccess: (_, idEstadoInforme) => {
      if (esEjemplo) {
        toast.success(
          idEstadoInforme === ID_ESTADO_INFORME_APROBADO
            ? "Ejemplo aprobado."
            : "Ejemplo rechazado.",
        );
      }
      queryClient.invalidateQueries({
        queryKey: ["asignaciones-bandeja-coordinador-revision"],
      });
      navigate("/coordinador/revision");
    },
    onError: () => {
      toast.error("No se pudo actualizar el estado del informe.");
    },
  });

  const puedeEditarRevision =
    !isLoading && !mutationRevision.isPending && Boolean(datosInvestigacion);

  if (isLoading) return <PantallaCarga message="Obteniendo informe..." />;

  return (
    <>
      <CustomVisorRevisionInforme
        documento={documentoGenerado}
        estaCargandoDocumento={estaCargandoDocumento}
        errorDocumento={errorDocumento}
        puedeEditar={puedeEditarRevision}
        esEjemplo={esEjemplo}
        onCerrar={() => navigate("/coordinador/revision")}
        onDescargar={() => window.print()}
        onAprobar={() => mutationRevision.mutate(ID_ESTADO_INFORME_APROBADO)}
        onRechazar={() => setEstaAbiertoModalRechazo(true)}
        onVolver={() => navigate("/coordinador/revision")}
      />

      <CustomModalRechazoInforme
        estaAbierto={estaAbiertoModalRechazo}
        motivoRechazo={motivoRechazo}
        onMotivoRechazoChange={setMotivoRechazo}
        onCerrar={() => setEstaAbiertoModalRechazo(false)}
        onConfirmar={() => mutationRevision.mutate(ID_ESTADO_INFORME_RECHAZADO)}
      />
    </>
  );
}
