import { NumberTicker } from "@maximilian/components/common/shadcn/number-ticker";
import type { IndicadoresFacturacionAnaliticaDashboard } from "@maximilian/shared/types/dashboard.type";

interface PropsCustomIndicadoresFacturacionAnaliticaGerente {
  indicadores: IndicadoresFacturacionAnaliticaDashboard;
  fechaHasta?: Date;
}

export function CustomIndicadoresFacturacionAnaliticaGerente({
  indicadores,
  fechaHasta,
}: PropsCustomIndicadoresFacturacionAnaliticaGerente) {
  const tarjetas = [
    {
      etiqueta: fechaHasta ? "Facturación acumulada hasta la fecha" : "Total facturado",
      valor: indicadores.totalFacturado,
      esMoneda: true,
    },
    {
      etiqueta: "Pendiente por facturar",
      valor: indicadores.montoPendienteFacturar,
      esMoneda: true,
    },
    {
      etiqueta: "Pedidos facturados",
      valor: indicadores.cantidadPedidosFacturados,
      esMoneda: false,
    },
    {
      etiqueta: "Pedidos pendientes de facturar",
      valor: indicadores.cantidadPedidosPendientes,
      esMoneda: false,
    },
    {
      etiqueta: "Notas de crédito",
      valor: indicadores.totalNotasCredito,
      esMoneda: true,
    },
    {
      etiqueta: "Notas de débito",
      valor: indicadores.totalNotasDebito,
      esMoneda: true,
    },
  ];

  return (
    <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {tarjetas.map((tarjeta) => (
        <div key={tarjeta.etiqueta} className="rounded-xl bg-slate-50 p-4">
          <strong className="block text-xl font-bold text-slate-800">
            {tarjeta.esMoneda ? indicadores.monedaIcono : null}
            <NumberTicker
              value={tarjeta.valor}
              decimalPlaces={tarjeta.esMoneda ? 2 : 0}
              rigidez={260}
              className="tracking-normal text-slate-800"
            />
          </strong>
          <span className="text-[10px] uppercase text-slate-400">{tarjeta.etiqueta}</span>
        </div>
      ))}
    </div>
  );
}
