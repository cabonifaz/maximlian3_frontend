import { coordinatorMenuItems } from "@maximilian/shared/constants/components/coordinador/diseno-coordinador.constants";
import { Outlet, useMatch } from "react-router";
import { BarraLateral } from "@maximilian/components/common/BarraLateral";
import { Encabezado } from "@maximilian/components/common/Encabezado";
import { useBarraLateralResponsive } from "@maximilian/hooks/useBarraLateralResponsive";

export default function DisenoCoordinador() {
  const esDetalleRevision = Boolean(useMatch("/coordinador/revision/:idPedido"));
  const {
    alternarBarraLateralEscritorio,
    alternarBarraLateralMobile,
    cerrarBarraLateralMobile,
    estaAbiertaMobile,
    estaColapsada,
  } = useBarraLateralResponsive();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden w-full">
      <BarraLateral
        items={coordinatorMenuItems}
        estaColapsada={estaColapsada}
        estaAbiertaMobile={estaAbiertaMobile}
        alAlternarBarraLateral={alternarBarraLateralEscritorio}
        alCerrarBarraLateralMobile={cerrarBarraLateralMobile}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Encabezado
          role="Coordinador"
          estaAbiertaBarraLateralMobile={estaAbiertaMobile}
          alAlternarBarraLateralMobile={alternarBarraLateralMobile}
        />
        <main className={`flex-1 overflow-y-auto bg-white/50 ${esDetalleRevision ? "p-0" : "p-8"}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
