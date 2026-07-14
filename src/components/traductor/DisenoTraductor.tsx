import { elementosMenuTraductor } from "@maximilian/shared/constants/components/traductor/disenoTraductor.constants";
import { Outlet } from "react-router";
import { BarraLateral } from "@maximilian/components/common/BarraLateral";
import { Encabezado } from "@maximilian/components/common/Encabezado";

export default function DisenoTraductor() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      <BarraLateral items={elementosMenuTraductor} />
      <div className="flex-1 flex min-w-0 flex-col">
        <Encabezado role="Traductor" />
        <main className="flex-1 overflow-y-auto bg-white/50 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
