import { Outlet } from "react-router";
import { BarraLateral } from "@maximilian/components/common/BarraLateral";
import { Encabezado } from "@maximilian/components/common/Encabezado";
import { 
  Database, 
  Users, 
  Package, 
  UserPlus, 
  CheckSquare, 
  FileText 
} from "lucide-react";

const coordinatorMenuItems = [
  { name: "Banco de Información", icon: Database, path: "/coordinador/banco-informacion" },
  { name: "Clientes", icon: Users, path: "/coordinador/clientes" },
  { name: "Pedidos", icon: Package, path: "/coordinador/pedidos" },
  { name: "Asignaciones", icon: UserPlus, path: "/coordinador/asignaciones" },
  { name: "Revisión y Aprobación", icon: CheckSquare, path: "/coordinador/revision" },
  { name: "Facturación", icon: FileText, path: "/coordinador/facturacion" },
];

export default function DisenoCoordinador() {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden w-full">
      <BarraLateral items={coordinatorMenuItems} />
      <div className="flex-1 flex flex-col min-w-0">
        <Encabezado role="Coordinador" />
        <main className="flex-1 overflow-y-auto p-8 bg-white/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
