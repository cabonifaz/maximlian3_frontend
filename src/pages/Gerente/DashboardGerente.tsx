import { CustomCumplimientoEntregasGerente } from "@maximilian/components/gerente/CustomCumplimientoEntregasGerente";
import { CustomEstadoPedidosGerente } from "@maximilian/components/gerente/CustomEstadoPedidosGerente";
import { CustomFacturacionAnaliticaGerente } from "@maximilian/components/gerente/CustomFacturacionAnaliticaGerente";
import { CustomResumenClientesGerente } from "@maximilian/components/gerente/CustomResumenClientesGerente";

export default function DashboardGerente() {
  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <CustomResumenClientesGerente />
      <CustomEstadoPedidosGerente />
      <CustomCumplimientoEntregasGerente />
      <CustomFacturacionAnaliticaGerente />
    </div>
  );
}
