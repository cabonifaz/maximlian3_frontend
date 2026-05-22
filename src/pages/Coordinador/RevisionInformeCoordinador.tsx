import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { CheckCircle2, CircleX, Download, Eye, ShieldCheck } from "lucide-react";
import { CustomModalRechazoInforme } from "@maximilian/components/coordinador/CustomModalRechazoInforme";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { informeService } from "@maximilian/services/informe.service";
import { servicioTablaMaestra } from "@maximilian/services/tablaMaestra.service";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import { construirPayloadInforme } from "@maximilian/shared/utils/construirPayloadInforme";
import { obtenerDatosInvestigacionAnalista } from "@maximilian/shared/utils/datos-simulados-investigacion";

const ID_ESTADO_INFORME_APROBADO = 4;
const ID_ESTADO_INFORME_RECHAZADO = 5;

function TarjetaDocumentoRevision({
  titulo,
  idioma,
  indicador,
  colorIndicador,
  encabezado,
  nombreEmpresa,
  direccion,
  observacion,
  tituloSeccion,
  tituloConfidencial,
}: {
  titulo: string;
  idioma: string;
  indicador: string;
  colorIndicador: string;
  encabezado: {
    pais: string;
    fecha: string;
    tipoSolicitud: string;
    analista: string;
    traductor: string;
  };
  nombreEmpresa: string;
  direccion: string;
  observacion: string;
  tituloSeccion: string;
  tituloConfidencial: string;
}) {
  return (
    <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{titulo}</p>
          <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-700">{idioma}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${colorIndicador}`}>
          {indicador}
        </span>
      </div>

      <div className="mb-5 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-[11px] leading-5 text-slate-600">
        <div className="mb-3 flex justify-center">
          <div className="text-center">
            <p className="text-lg font-bold text-slate-300">SAFETY REPORT</p>
          </div>
        </div>
        <p><span className="font-bold text-slate-700">País / Country:</span> {encabezado.pais}</p>
        <p><span className="font-bold text-slate-700">Fecha / Date:</span> {encabezado.fecha}</p>
        <p><span className="font-bold text-slate-700">Tipo / Type:</span> {encabezado.tipoSolicitud}</p>
        <p><span className="font-bold text-slate-700">Analista:</span> {encabezado.analista}</p>
        <p><span className="font-bold text-slate-700">Traductor:</span> {encabezado.traductor}</p>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-100 p-4">
            <p className="mb-3 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-slate-700">
              {tituloConfidencial}
            </p>
            <p className="mb-3 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              {tituloSeccion}
            </p>

          <div className="grid gap-3 text-[11px] leading-5 text-slate-600 md:grid-cols-[180px_minmax(0,1fr)]">
            <p className="font-bold uppercase tracking-[0.14em] text-slate-400">Nombre de la empresa / Company</p>
            <p>{nombreEmpresa}</p>
            <p className="font-bold uppercase tracking-[0.14em] text-slate-400">Dirección / Address</p>
            <p>{direccion}</p>
            <p className="font-bold uppercase tracking-[0.14em] text-slate-400">Observaciones / Remarks</p>
            <p>{observacion}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function RevisionInformeCoordinador() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { idPedido } = useParams();
  const [searchParams] = useSearchParams();
  const idInforme = Number(searchParams.get("idInforme"));
  const idIdioma = Number(searchParams.get("idIdioma"));
  const esEjemplo = searchParams.get("ejemplo") === "1";
  const [estaAbiertoModalRechazo, setEstaAbiertoModalRechazo] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState("");

  const datosEjemplo = useMemo(() => obtenerDatosInvestigacionAnalista("detalle"), []);

  const { data: informeObtenido, isLoading } = useQuery({
    queryKey: ["coordinador-revision-detalle", idInforme],
    queryFn: () => informeService.obtener(idInforme),
    enabled: !esEjemplo && Number.isFinite(idInforme) && idInforme > 0,
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

  const datosInvestigacion = informeObtenido?.datosInvestigacion ?? datosEjemplo;
  const idPedidoNumerico = Number(idPedido);
  const idInformeSeguro = Number.isFinite(idInforme) ? idInforme : 0;

  const encabezado = {
    pais: datosInvestigacion.resumen.pais || "Brasil",
    fecha: "31/12/2025",
    tipoSolicitud: datosInvestigacion.resumen.prioridad || "Normal",
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
        idIdiomaPedido: Number.isFinite(idIdioma) ? idIdioma : 0,
        datosInvestigacion,
        opcionesTipoPersona,
        opcionesPais,
        opcionesEstadoCliente,
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

  const nombreEmpresa = datosInvestigacion.identificacion.nombreEmpresa || "COMPANHIA SIDERURGICA NACIONAL";
  const direccion = datosInvestigacion.identificacion.direccionPrincipal || "Av. Brigadeiro Faria Lima No. 3400, Andar 19 e 20, Bairro Itaim Bibi";
  const observacion = datosInvestigacion.identificacion.datosAdicionales
    || "Este informe fue solicitado con una dirección incorrecta y debe revisarse antes de aprobar.";

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

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="space-y-4">
          <div className="flex min-h-[88px] items-start justify-between gap-4">
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
                disabled={isLoading || mutationRevision.isPending}
                onClick={() => mutationRevision.mutate(ID_ESTADO_INFORME_APROBADO)}
              >
                <CheckCircle2 size={14} />
                Aprobar
              </CustomButton>
              <CustomButton
                variant="secondary"
                size="sm"
                className="border-red-400 text-red-500"
                disabled={isLoading || mutationRevision.isPending}
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

          <TarjetaDocumentoRevision
            titulo="Reporte original"
            idioma="(Español)"
            indicador="Original"
            colorIndicador="bg-slate-100 text-slate-500"
            encabezado={encabezado}
            nombreEmpresa={nombreEmpresa}
            direccion={direccion}
            observacion={observacion}
            tituloSeccion="Identificación"
            tituloConfidencial="Informe confidencial"
          />
        </section>

        <section className="space-y-4">
          <div className="flex min-h-[88px] items-start justify-between gap-4">
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
                disabled={isLoading || mutationRevision.isPending}
                onClick={() => mutationRevision.mutate(ID_ESTADO_INFORME_APROBADO)}
              >
                <CheckCircle2 size={14} />
                Aprobar
              </CustomButton>
              <CustomButton
                variant="secondary"
                size="sm"
                className="border-red-400 text-red-500"
                disabled={isLoading || mutationRevision.isPending}
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

          <TarjetaDocumentoRevision
            titulo="Reporte traducido"
            idioma="(Inglés)"
            indicador="Traducido"
            colorIndicador="bg-blue-100 text-blue-600"
            encabezado={encabezado}
            nombreEmpresa="COMPANHIA SIDERURGICA NACIONAL"
            direccion="Av. Brigadeiro Faria Lima No. 3400, Floor 19 e 20, Itaim Bibi District"
            observacion="This report was requested with an incorrect address and should be reviewed before approval."
            tituloSeccion="Identification"
            tituloConfidencial="Confidential report"
          />
        </section>
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
