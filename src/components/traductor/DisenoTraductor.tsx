import { elementosMenuTraductor } from "@maximilian/shared/constants/components/traductor/diseno-traductor.constants";
import { useState } from "react";
import { Outlet } from "react-router";
import { BarraLateral } from "@maximilian/components/common/BarraLateral";
import { Encabezado } from "@maximilian/components/common/Encabezado";

export default function DisenoTraductor() {
  const [estaColapsada, setEstaColapsada] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      <BarraLateral items={elementosMenuTraductor} estaColapsada={estaColapsada} />
      <div className="flex-1 flex min-w-0 flex-col">
        <Encabezado
          role="Traductor"
          estaColapsada={estaColapsada}
          alAlternarBarraLateral={() => setEstaColapsada((valorActual) => !valorActual)}
        />
        <main className="flex-1 overflow-y-auto bg-white/50 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
