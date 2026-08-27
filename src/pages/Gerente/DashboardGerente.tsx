import { CustomCumplimientoDesempenoGerente } from "@maximilian/components/gerente/CustomCumplimientoDesempenoGerente";
import { CustomEstadoPedidosGerente } from "@maximilian/components/gerente/CustomEstadoPedidosGerente";
import { CustomFacturacionAnaliticaGerente } from "@maximilian/components/gerente/CustomFacturacionAnaliticaGerente";
import { CustomResumenClientesGerente } from "@maximilian/components/gerente/CustomResumenClientesGerente";

export default function DashboardGerente() {
  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="grid gap-5 xl:grid-cols-2">
        <CustomResumenClientesGerente />
        <CustomEstadoPedidosGerente />
      </div>
      <CustomCumplimientoDesempenoGerente />
      <CustomFacturacionAnaliticaGerente />
    </div>
  );
}
