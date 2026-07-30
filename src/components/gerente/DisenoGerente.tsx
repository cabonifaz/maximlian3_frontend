import { Outlet } from "react-router";
import { BarraLateral } from "@maximilian/components/common/BarraLateral";
import { Encabezado } from "@maximilian/components/common/Encabezado";
import { elementosMenuGerente } from "@maximilian/shared/constants/components/gerente/diseno-gerente.constants";

export default function DisenoGerente() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      <BarraLateral items={elementosMenuGerente} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Encabezado role="Gerente" />
        <main className="flex-1 overflow-y-auto bg-slate-50 p-5 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
