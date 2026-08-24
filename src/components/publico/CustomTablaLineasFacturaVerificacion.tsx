import { ClipboardList } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import type {
  CabeceraVerificacionFacturaApi,
  LineaVerificacionFacturaApi,
} from "@maximilian/shared/types/verificacion-factura.type";
import { formatearMontoConSimbolo } from "@maximilian/shared/utils/formato-monto.util";

interface PropsCustomTablaLineasFacturaVerificacion {
  cabecera: CabeceraVerificacionFacturaApi;
  lineas: LineaVerificacionFacturaApi[];
  onVerDetallePedidos: () => void;
  onVerDetalleLinea: (linea: LineaVerificacionFacturaApi) => void;
}

function FilaTotal({
  etiqueta,
  valor,
  destacado = false,
}: {
  etiqueta: string;
  valor: string;
  destacado?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span
        className={
          destacado
            ? "text-sm font-bold text-brand-black"
            : "text-xs font-medium text-slate-500"
        }
      >
        {etiqueta}
      </span>
      <span
        className={
          destacado
            ? "text-lg font-black text-brand-black"
            : "text-sm font-medium text-slate-700"
        }
      >
        {valor}
      </span>
    </div>
  );
}

export function CustomTablaLineasFacturaVerificacion({
  cabecera,
  lineas,
  onVerDetallePedidos,
  onVerDetalleLinea,
}: PropsCustomTablaLineasFacturaVerificacion) {
  const simbolo = cabecera.monedaCodigo;

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-brand-black">Productos y servicios</h2>
          <p className="mt-0.5 text-xs text-slate-400">Detalle de conceptos incluidos en el comprobante.</p>
        </div>
        <CustomButton variant="secondary" size="sm" onClick={onVerDetallePedidos}>
          <ClipboardList size={14} />
          Ver detalle de pedidos
        </CustomButton>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full min-w-[960px] text-sm">
          <thead className="bg-slate-50 text-xs font-bold text-slate-500">
            <tr>
              <th className="px-4 py-3 text-center">Cant.</th>
              <th className="px-4 py-3 text-left">Código</th>
              <th className="px-4 py-3 text-left">Descripción</th>
              <th className="px-4 py-3 text-center">U.M.</th>
              <th className="px-4 py-3 text-center">Valor U.</th>
              <th className="px-4 py-3 text-center">Dscto.</th>
              <th className="w-48 min-w-48 max-w-48 px-4 py-3 text-center">Afectación IGV</th>
              <th className="px-4 py-3 text-center">IGV %</th>
              <th className="px-4 py-3 text-center">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lineas.map((linea) => (
              <tr
                key={linea.numeroLinea}
                onClick={() => onVerDetalleLinea(linea)}
                className="cursor-pointer transition-colors hover:bg-slate-50"
                title="Ver detalle de pedidos de este producto"
              >
                <td className="px-4 py-3 text-center text-slate-600">{linea.cantidad}</td>
                <td className="px-4 py-3 text-left text-slate-600">
                  {linea.productoCodigo}
                </td>
                <td className="px-4 py-3 text-left font-medium text-slate-700">
                  {linea.descripcion}
                </td>
                <td className="px-4 py-3 text-center text-slate-600">
                  {linea.unidadMedidaCodigo}
                </td>
                <td className="px-4 py-3 text-center text-slate-600">
                  {formatearMontoConSimbolo(linea.valorUnitario, simbolo)}
                </td>
                <td className="px-4 py-3 text-center text-slate-600">
                  {formatearMontoConSimbolo(linea.montoDescuento, simbolo)}
                </td>
                <td className="w-48 min-w-48 max-w-48 px-4 py-3 text-center text-slate-600">
                  {linea.afectacionIgvCodigo}
                </td>
                <td className="px-4 py-3 text-center text-slate-600">
                  {linea.porcentajeIgv}%
                </td>
                <td className="px-4 py-3 text-center font-medium text-slate-700">
                  {formatearMontoConSimbolo(linea.totalLinea, simbolo)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ml-auto w-full max-w-xs space-y-1 border-t border-slate-100 pt-4">
        <FilaTotal etiqueta="Gravado" valor={formatearMontoConSimbolo(cabecera.totalGravado, simbolo)} />
        <FilaTotal etiqueta="Descuento" valor={formatearMontoConSimbolo(cabecera.totalDescuento, simbolo)} />
        <FilaTotal etiqueta="IGV" valor={formatearMontoConSimbolo(cabecera.totalIgv, simbolo)} />
        <FilaTotal
          etiqueta="Total"
          valor={formatearMontoConSimbolo(cabecera.totalImporte, simbolo)}
          destacado
        />
      </div>
    </div>
  );
}
