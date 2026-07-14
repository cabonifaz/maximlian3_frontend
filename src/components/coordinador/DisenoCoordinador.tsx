import { coordinatorMenuItems } from "@maximilian/shared/constants/components/coordinador/disenoCoordinador.constants";
import { Outlet, useMatch } from "react-router";
import { BarraLateral } from "@maximilian/components/common/BarraLateral";
import { Encabezado } from "@maximilian/components/common/Encabezado";

export default function DisenoCoordinador() {
  const esDetalleRevision = Boolean(useMatch("/coordinador/revision/:idPedido"));

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden w-full">
      <BarraLateral items={coordinatorMenuItems} />
      <div className="flex-1 flex flex-col min-w-0">
        <Encabezado role="Coordinador" />
        <main className={`flex-1 overflow-y-auto bg-white/50 ${esDetalleRevision ? "p-0" : "p-8"}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
