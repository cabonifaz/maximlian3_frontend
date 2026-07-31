import { CustomCumplimientoEntregasGerente } from "@maximilian/components/gerente/CustomCumplimientoEntregasGerente";
import { CustomEstadoPedidosGerente } from "@maximilian/components/gerente/CustomEstadoPedidosGerente";
import { CustomFacturacionGerente } from "@maximilian/components/gerente/CustomFacturacionGerente";
import { CustomResumenClientesGerente } from "@maximilian/components/gerente/CustomResumenClientesGerente";

export default function DashboardGerente() {
  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <CustomResumenClientesGerente />
      <div className="grid gap-5 xl:grid-cols-2">
        <CustomEstadoPedidosGerente />
        <CustomFacturacionGerente />
      </div>
      <CustomCumplimientoEntregasGerente />
    </div>
  );
}
