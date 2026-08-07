import { ShieldCheck } from "lucide-react";
import {
  CLASES_ESTADO_VERIFICACION_FACTURA,
  CLASE_ESTADO_VERIFICACION_FACTURA_PREDETERMINADA,
  ETIQUETAS_TIPO_DOCUMENTO_VERIFICACION_FACTURA,
} from "@maximilian/shared/constants/pages/Publico/verificacion-factura.constants";
import type { CabeceraVerificacionFacturaApi } from "@maximilian/shared/types/verificacion-factura.type";
import { formatearFechaIsoADdMmYyyy } from "@maximilian/shared/utils/fecha.util";

interface PropsCustomEncabezadoFacturaVerificacion {
  cabecera: CabeceraVerificacionFacturaApi;
}

function CampoEncabezado({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {etiqueta}
      </p>
      <p className="mt-0.5 text-sm font-medium text-slate-700 break-words">
        {valor || "-"}
      </p>
    </div>
  );
}

export function CustomEncabezadoFacturaVerificacion({
  cabecera,
}: PropsCustomEncabezadoFacturaVerificacion) {
  const claseEstado =
    CLASES_ESTADO_VERIFICACION_FACTURA[cabecera.estadoCodigo]
    ?? CLASE_ESTADO_VERIFICACION_FACTURA_PREDETERMINADA;
  const etiquetaTipoDocumento =
    ETIQUETAS_TIPO_DOCUMENTO_VERIFICACION_FACTURA[cabecera.tipoDocumentoCodigo]
    ?? cabecera.tipoDocumentoCodigo;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-white to-brand-wine/5 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-wine/10 text-brand-wine">
            <ShieldCheck size={19} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-brand-black">
              {etiquetaTipoDocumento} {cabecera.serie}-{cabecera.correlativo}
            </h1>
            <p className="mt-0.5 text-xs text-slate-500">
              {cabecera.empresaRazonSocial}
            </p>
          </div>
        </div>
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${claseEstado}`}>
          {cabecera.estadoCodigo}
        </span>
      </div>

      <div className="grid gap-x-8 gap-y-5 p-6 md:grid-cols-2">
        <CampoEncabezado etiqueta="Emisor" valor={cabecera.empresaRazonSocial} />
        <CampoEncabezado etiqueta="RUC" valor={cabecera.empresaRuc} />
        <CampoEncabezado etiqueta="Dirección del emisor" valor={cabecera.empresaDireccion} />
        <CampoEncabezado
          etiqueta="Fecha de emisión"
          valor={`${formatearFechaIsoADdMmYyyy(cabecera.fechaEmision)} ${cabecera.horaEmision}`}
        />
        <CampoEncabezado etiqueta="Cliente" valor={cabecera.clienteNombre} />
        <CampoEncabezado etiqueta="Documento del cliente" valor={cabecera.clienteNumeroDocumento} />
        <CampoEncabezado etiqueta="Forma de pago" valor={cabecera.formaPagoCodigo} />
        <CampoEncabezado etiqueta="Moneda" valor={cabecera.monedaCodigo} />
        {cabecera.tipoCambio ? (
          <CampoEncabezado
            etiqueta="Tipo de cambio"
            valor={`1 ${cabecera.monedaCodigo} = ${cabecera.tipoCambio} PEN`}
          />
        ) : null}
        {cabecera.fechaAceptacion ? (
          <CampoEncabezado
            etiqueta="Fecha de aceptación SUNAT"
            valor={formatearFechaIsoADdMmYyyy(cabecera.fechaAceptacion)}
          />
        ) : null}
        {cabecera.sunatDescripcionRespuesta ? (
          <div className="md:col-span-2">
            <CampoEncabezado
              etiqueta="Respuesta SUNAT"
              valor={cabecera.sunatDescripcionRespuesta}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
