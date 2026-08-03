import { Outlet } from "react-router";
import { BarraLateral } from "@maximilian/components/common/BarraLateral";
import { Encabezado } from "@maximilian/components/common/Encabezado";
import { useBarraLateralResponsive } from "@maximilian/hooks/useBarraLateralResponsive";
import { elementosMenuGerente } from "@maximilian/shared/constants/components/gerente/diseno-gerente.constants";

export default function DisenoGerente() {
  const {
    alternarBarraLateralEscritorio,
    alternarBarraLateralMobile,
    cerrarBarraLateralMobile,
    estaAbiertaMobile,
    estaColapsada,
  } = useBarraLateralResponsive();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      <BarraLateral
        items={elementosMenuGerente}
        estaColapsada={estaColapsada}
        estaAbiertaMobile={estaAbiertaMobile}
        alAlternarBarraLateral={alternarBarraLateralEscritorio}
        alCerrarBarraLateralMobile={cerrarBarraLateralMobile}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Encabezado
          role="Gerente"
          estaAbiertaBarraLateralMobile={estaAbiertaMobile}
          alAlternarBarraLateralMobile={alternarBarraLateralMobile}
        />
        <main className="flex-1 overflow-y-auto bg-slate-50 p-5 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
