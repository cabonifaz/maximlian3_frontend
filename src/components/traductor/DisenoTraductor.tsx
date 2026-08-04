import { elementosMenuTraductor } from "@maximilian/shared/constants/components/traductor/diseno-traductor.constants";
import { Outlet } from "react-router";
import { BarraLateral } from "@maximilian/components/common/BarraLateral";
import { Encabezado } from "@maximilian/components/common/Encabezado";
import { useBarraLateralResponsive } from "@maximilian/hooks/useBarraLateralResponsive";

export default function DisenoTraductor() {
  const {
    alternarBarraLateralEscritorio,
    alternarBarraLateralMobile,
    cerrarBarraLateralMobile,
    estaAbiertaMobile,
    estaColapsada,
  } = useBarraLateralResponsive();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      <BarraLateral
        items={elementosMenuTraductor}
        estaColapsada={estaColapsada}
        estaAbiertaMobile={estaAbiertaMobile}
        alAlternarBarraLateral={alternarBarraLateralEscritorio}
        alCerrarBarraLateralMobile={cerrarBarraLateralMobile}
      />
      <div className="flex-1 flex min-w-0 flex-col">
        <Encabezado
          role="Traductor"
          estaAbiertaBarraLateralMobile={estaAbiertaMobile}
          alAlternarBarraLateralMobile={alternarBarraLateralMobile}
        />
        <main className="flex-1 overflow-y-auto bg-white/50 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
