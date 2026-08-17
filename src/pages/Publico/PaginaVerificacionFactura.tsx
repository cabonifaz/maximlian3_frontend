import { useParams } from "react-router";
import { Download, FileWarning } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomCuotasFacturaVerificacion } from "@maximilian/components/publico/CustomCuotasFacturaVerificacion";
import { CustomEncabezadoFacturaVerificacion } from "@maximilian/components/publico/CustomEncabezadoFacturaVerificacion";
import { CustomTablaLineasFacturaVerificacion } from "@maximilian/components/publico/CustomTablaLineasFacturaVerificacion";
import { useVerificacionFactura } from "@maximilian/hooks/useVerificacionFactura";
import PantallaCarga from "@maximilian/components/common/PantallaCarga";

export default function PaginaVerificacionFactura() {
  const { token } = useParams<{ token: string }>();
  const {
    descargar,
    errorDescarga,
    factura,
    formatoDescargando,
    isError,
    isLoading,
    mensajeError,
  } = useVerificacionFactura(token);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center">
        <img
          src="/safety-logo.jpg"
          alt="Safety Report Logo"
          className="mb-8 h-16 object-contain"
        />

        {isLoading ? (
          <PantallaCarga message="Verificando comprobante" />
        ) : isError || !factura ? (
          <div className="flex w-full flex-col items-center gap-3 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <FileWarning size={22} />
            </div>
            <h1 className="text-lg font-bold text-brand-black">
              No se pudo verificar el comprobante
            </h1>
            <p className="max-w-sm text-sm text-slate-500">{mensajeError}</p>
          </div>
        ) : (
          <div className="w-full space-y-5">
            <CustomEncabezadoFacturaVerificacion cabecera={factura.cabecera} />
            <CustomTablaLineasFacturaVerificacion
              cabecera={factura.cabecera}
              lineas={factura.lineas}
            />
            {factura.cuotas.length > 0 ? (
              <CustomCuotasFacturaVerificacion
                cabecera={factura.cabecera}
                cuotas={factura.cuotas}
              />
            ) : null}

            <div className="flex flex-col items-end gap-2">
              <div className="flex flex-wrap justify-end gap-3">
                <CustomButton
                  variant="secondary"
                  size="compact"
                  onClick={() => void descargar("xml")}
                  loading={formatoDescargando === "xml"}
                  loadingText="Generando..."
                >
                  <Download size={14} />
                  Descargar XML
                </CustomButton>
                <CustomButton
                  variant="wine"
                  size="compact"
                  onClick={() => void descargar("pdf")}
                  loading={formatoDescargando === "pdf"}
                  loadingText="Generando..."
                >
                  <Download size={14} />
                  Descargar PDF
                </CustomButton>
              </div>
              {errorDescarga ? (
                <p className="text-xs font-medium text-red-500">{errorDescarga}</p>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
