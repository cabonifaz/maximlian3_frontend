import { adminMenuItems } from "@maximilian/shared/constants/components/administrador/diseno-administrador.constants";
import { Outlet } from "react-router";
import { BarraLateral } from "@maximilian/components/common/BarraLateral";
import { Encabezado } from "@maximilian/components/common/Encabezado";
import { useBarraLateralResponsive } from "@maximilian/hooks/useBarraLateralResponsive";

export default function DisenoAdministrador() {
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
        items={adminMenuItems}
        estaColapsada={estaColapsada}
        estaAbiertaMobile={estaAbiertaMobile}
        alAlternarBarraLateral={alternarBarraLateralEscritorio}
        alCerrarBarraLateralMobile={cerrarBarraLateralMobile}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Encabezado
          estaAbiertaBarraLateralMobile={estaAbiertaMobile}
          alAlternarBarraLateralMobile={alternarBarraLateralMobile}
        />
        <main className="flex-1 overflow-y-auto p-8 bg-white/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
