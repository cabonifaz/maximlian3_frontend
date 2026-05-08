import { Outlet } from "react-router";
import { Folder, LibraryBig } from "lucide-react";
import { BarraLateral } from "@maximilian/components/common/BarraLateral";
import { Encabezado } from "@maximilian/components/common/Encabezado";

const elementosMenuAnalista = [
  { name: "Mi Bandeja", icon: Folder, path: "/analista/bandeja" },
  { name: "Banco de Información", icon: LibraryBig, path: "/analista/banco-informacion" },
];

export default function DisenoAnalista() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      <BarraLateral items={elementosMenuAnalista} />
      <div className="flex-1 flex min-w-0 flex-col">
        <Encabezado role="Analista" />
        <main className="flex-1 overflow-y-auto bg-white/50 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
