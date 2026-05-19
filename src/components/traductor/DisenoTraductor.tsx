import { Outlet } from "react-router";
import { Folder } from "lucide-react";
import { BarraLateral } from "@maximilian/components/common/BarraLateral";
import { Encabezado } from "@maximilian/components/common/Encabezado";

const elementosMenuTraductor = [
  { name: "Mi Bandeja", icon: Folder, path: "/traductor/bandeja" },
];

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
