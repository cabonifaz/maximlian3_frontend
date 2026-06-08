import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { CheckCircle2, CircleX, Download, Eye, ShieldCheck } from "lucide-react";
import { CustomModalRechazoInforme } from "@maximilian/components/coordinador/CustomModalRechazoInforme";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import {
  CustomVistaPreviaInformeComparado,
  type EncabezadoVistaPreviaInforme,
} from "@maximilian/components/common/CustomVistaPreviaInforme";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { informeService } from "@maximilian/services/informe.service";
import { servicioTablaMaestra } from "@maximilian/services/tablaMaestra.service";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import { construirPayloadInforme } from "@maximilian/shared/utils/construirPayloadInforme";
import { obtenerDatosInvestigacionAnalista } from "@maximilian/shared/utils/datos-simulados-investigacion";

const ID_ESTADO_INFORME_APROBADO = 4;
const ID_ESTADO_INFORME_RECHAZADO = 5;

export default function RevisionInformeCoordinador() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { idPedido } = useParams();
  const [searchParams] = useSearchParams();
  const idInforme = Number(searchParams.get("idInforme"));
  const esEjemplo = searchParams.get("ejemplo") === "1";
  const [estaAbiertoModalRechazo, setEstaAbiertoModalRechazo] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const datosEjemplo = useMemo(() => obtenerDatosInvestigacionAnalista("detalle"), []);

  const { data: informeObtenido, isLoading } = useQuery({
    queryKey: ["coordinador-revision-detalle", idPedido, idInforme],
    queryFn: () => informeService.obtener({
      idPedido: Number(idPedido),
    }),
    enabled: !esEjemplo && Number.isFinite(Number(idPedido)) && Number(idPedido) > 0,
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

  const datosInvestigacion = informeObtenido?.datosInvestigacion ?? (esEjemplo ? datosEjemplo : undefined);
  const idPedidoNumerico = Number(idPedido);
  const idInformeSeguro = Number.isFinite(idInforme) ? idInforme : 0;

  const encabezado: EncabezadoVistaPreviaInforme = {
    pais: datosInvestigacion?.resumen.pais || "-",
    fecha: "31/12/2025",
    tipoSolicitud: datosInvestigacion?.resumen.prioridad || "-",
    analista: "ANA007",
    traductor: "TR0010",
  };

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
        toast.success(idEstadoInforme === ID_ESTADO_INFORME_APROBADO ? "Ejemplo aprobado." : "Ejemplo rechazado.");
      }
      queryClient.invalidateQueries({ queryKey: ["asignaciones-bandeja-coordinador-revision"] });
      navigate("/coordinador/revision");
    },
    onError: () => {
      toast.error("No se pudo actualizar el estado del informe.");
    },
  });

  const puedeEditarRevision = !isLoading && !mutationRevision.isPending && Boolean(datosInvestigacion);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-slate-700">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-brand-black">Revisión y Aprobación</h1>
            <p className="text-sm text-slate-500">
              {esEjemplo ? "Vista de ejemplo para el flujo de aprobación." : "Comparación del informe original y traducido."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <CustomButton variant="secondary" size="sm" onClick={() => navigate("/coordinador/revision")}>
            Cerrar
          </CustomButton>
          <CustomButton size="sm" onClick={() => window.print()}>
            <Download size={14} />
            Descargar PDF
          </CustomButton>
        </div>
      </div>

      <div className="space-y-3">
        {datosInvestigacion ? (
          <CustomVistaPreviaInformeComparado
            datosInvestigacion={datosInvestigacion}
            encabezado={encabezado}
            indicadorReporteTraducido="Traducido"
            className="space-y-3"
            contenidoEntreTabsYTarjetas={(
              <div className="grid gap-4 xl:grid-cols-2">
                <section className="space-y-2">
                  <div className="flex min-h-[68px] items-start justify-between gap-4">
                    <div className="min-w-0 pt-2">
                      <CustomLabel as="p" className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                        Informe original
                      </CustomLabel>
                      <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                        (Español)
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <CustomButton
                        variant="secondary"
                        size="sm"
                        className="border-green-400 text-green-600"
                        disabled={!puedeEditarRevision}
                        onClick={() => mutationRevision.mutate(ID_ESTADO_INFORME_APROBADO)}
                      >
                        <CheckCircle2 size={14} />
                        Aprobar
                      </CustomButton>
                      <CustomButton
                        variant="secondary"
                        size="sm"
                        className="border-red-400 text-red-500"
                        disabled={!puedeEditarRevision}
                        onClick={() => setEstaAbiertoModalRechazo(true)}
                      >
                        <CircleX size={14} />
                        Rechazar
                      </CustomButton>
                      <span className="rounded-full bg-slate-100 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                        Original
                      </span>
                    </div>
                  </div>
                </section>

                <section className="space-y-2">
                  <div className="flex min-h-[68px] items-start justify-between gap-6">
                    <div className="min-w-0 pt-2">
                      <CustomLabel as="p" className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                        Informe traducido
                      </CustomLabel>
                      <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                        (Inglés)
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <CustomButton
                        variant="secondary"
                        size="sm"
                        className="border-green-400 text-green-600"
                        disabled={!puedeEditarRevision}
                        onClick={() => mutationRevision.mutate(ID_ESTADO_INFORME_APROBADO)}
                      >
                        <CheckCircle2 size={14} />
                        Aprobar
                      </CustomButton>
                      <CustomButton
                        variant="secondary"
                        size="sm"
                        className="border-red-400 text-red-500"
                        disabled={!puedeEditarRevision}
                        onClick={() => setEstaAbiertoModalRechazo(true)}
                      >
                        <CircleX size={14} />
                        Rechazar
                      </CustomButton>
                      <span className="rounded-full bg-blue-100 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">
                        Traducido
                      </span>
                    </div>
                  </div>
                </section>
              </div>
            )}
          />
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500 shadow-sm">
            No se pudo cargar el contenido del informe para la revisión.
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Eye size={16} />
            {esEjemplo ? "Ejemplo de revisión" : "Revisión activa"}
          </div>
          <CustomButton variant="secondary" size="sm" onClick={() => navigate("/coordinador/revision")}>
            Volver a informes
          </CustomButton>
        </div>
      </div>

      <CustomModalRechazoInforme
        estaAbierto={estaAbiertoModalRechazo}
        motivoRechazo={motivoRechazo}
        onMotivoRechazoChange={setMotivoRechazo}
        onCerrar={() => setEstaAbiertoModalRechazo(false)}
        onConfirmar={() => mutationRevision.mutate(ID_ESTADO_INFORME_RECHAZADO)}
      />
    </div>
  );
}
