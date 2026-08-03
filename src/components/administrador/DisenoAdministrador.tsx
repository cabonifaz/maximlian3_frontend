import { adminMenuItems } from "@maximilian/shared/constants/components/administrador/diseno-administrador.constants";
import { useState } from "react";
import { Outlet } from "react-router";
import { BarraLateral } from "@maximilian/components/common/BarraLateral";
import { Encabezado } from "@maximilian/components/common/Encabezado";

export default function DisenoAdministrador() {
  const [estaColapsada, setEstaColapsada] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden w-full">
      <BarraLateral items={adminMenuItems} estaColapsada={estaColapsada} />
      <div className="flex-1 flex flex-col min-w-0">
        <Encabezado
          estaColapsada={estaColapsada}
          alAlternarBarraLateral={() => setEstaColapsada((valorActual) => !valorActual)}
        />
        <main className="flex-1 overflow-y-auto p-8 bg-white/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
