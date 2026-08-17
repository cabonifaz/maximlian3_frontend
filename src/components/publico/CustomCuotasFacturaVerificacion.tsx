import {
  CLASES_ESTADO_CUOTA_VERIFICACION_FACTURA,
  CLASE_ESTADO_VERIFICACION_FACTURA_PREDETERMINADA,
} from "@maximilian/shared/constants/pages/Publico/verificacion-factura.constants";
import type {
  CabeceraVerificacionFacturaApi,
  CuotaVerificacionFacturaApi,
} from "@maximilian/shared/types/verificacion-factura.type";
import { formatearFechaIsoADdMmYyyy } from "@maximilian/shared/utils/fecha.util";
import { formatearMontoConSimbolo } from "@maximilian/shared/utils/formato-monto.util";

interface PropsCustomCuotasFacturaVerificacion {
  cabecera: CabeceraVerificacionFacturaApi;
  cuotas: CuotaVerificacionFacturaApi[];
}

export function CustomCuotasFacturaVerificacion({
  cabecera,
  cuotas,
}: PropsCustomCuotasFacturaVerificacion) {
  const simbolo = cabecera.monedaCodigo;

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-sm font-bold text-brand-black">Cuotas</h2>
        <p className="mt-0.5 text-xs text-slate-400">Vencimiento de los pagos programados.</p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-slate-50 text-xs font-bold text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left">Nro. Cuota</th>
              <th className="px-4 py-3 text-right">Monto</th>
              <th className="px-4 py-3 text-center">Vencimiento</th>
              <th className="px-4 py-3 text-center">Fecha de pago</th>
              <th className="px-4 py-3 text-center">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cuotas.map((cuota) => (
              <tr key={cuota.numeroCuota}>
                <td className="px-4 py-3 text-left text-slate-600">{cuota.numeroCuota}</td>
                <td className="px-4 py-3 text-right font-medium text-slate-700">
                  {formatearMontoConSimbolo(cuota.monto, simbolo)}
                </td>
                <td className="px-4 py-3 text-center text-slate-600">
                  {formatearFechaIsoADdMmYyyy(cuota.fechaVencimiento)}
                </td>
                <td className="px-4 py-3 text-center text-slate-600">
                  {cuota.fechaPago ? formatearFechaIsoADdMmYyyy(cuota.fechaPago) : "-"}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                      CLASES_ESTADO_CUOTA_VERIFICACION_FACTURA[cuota.estadoCuotaCodigo]
                        ?? CLASE_ESTADO_VERIFICACION_FACTURA_PREDETERMINADA
                    }`}
                  >
                    {cuota.estadoCuotaCodigo}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
