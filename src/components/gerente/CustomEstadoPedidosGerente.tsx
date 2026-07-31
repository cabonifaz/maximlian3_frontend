import { NumberTicker } from "@maximilian/components/common/shadcn/number-ticker";
import { CustomCargadorTarjetaDashboard } from "./CustomCargadorTarjetaDashboard";
import { useResumenPedidosDashboard } from "@maximilian/hooks/useDashboardGerente";

export function CustomEstadoPedidosGerente() {
  const { resumenPedidos, estaCargandoResumenPedidos } =
    useResumenPedidosDashboard();
  const totalPedidos = resumenPedidos.reduce(
    (total, estado) => total + estado.cantidad,
    0,
  );

  if (estaCargandoResumenPedidos) {
    return (
      <CustomCargadorTarjetaDashboard
        titulo="estado de pedidos"
        variante="grafica"
      />
    );
  }

  return (
    <section className="h-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-800">Estado de Pedidos</h2>
      </div>

      <div className="space-y-4">
        {resumenPedidos.map((estado) => (
          <div key={estado.idEstado}>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 font-medium text-black">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: estado.colorFondo }}
                />
                {estado.descripcionEstado}
              </span>
              <span className="text-black">
                <NumberTicker
                  value={estado.cantidad}
                  className="font-bold tracking-normal text-inherit"
                />
              </span>
            </div>
            <div
              className="h-1.5 overflow-hidden rounded-full bg-slate-100"
            >
              <div
                className="animacion-crecer-horizontal-dashboard h-full rounded-full"
                style={{
                  backgroundColor: estado.colorFondo,
                  width: totalPedidos > 0
                    ? `${(estado.cantidad / totalPedidos) * 100}%`
                    : "0%",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
