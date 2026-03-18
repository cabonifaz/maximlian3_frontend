import { Outlet } from "react-router";
import { Sidebar } from "@maximilian/components/common/Sidebar";
import { Header } from "@maximilian/components/common/Header";
import { 
  Database, 
  Users, 
  Package, 
  UserPlus, 
  CheckSquare, 
  FileText 
} from "lucide-react";

const coordinatorMenuItems = [
  { name: "Banco de Información", icon: Database, path: "/coordinator/bank" },
  { name: "Clientes", icon: Users, path: "/coordinator/clients" },
  { name: "Pedidos", icon: Package, path: "/coordinator/orders" },
  { name: "Asignaciones", icon: UserPlus, path: "/coordinator/assignments" },
  { name: "Revisión y Aprobación", icon: CheckSquare, path: "/coordinator/review" },
  { name: "Facturación", icon: FileText, path: "/coordinator/billing" },
];

export default function CoordinatorLayout() {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden w-full">
      <Sidebar items={coordinatorMenuItems} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header role="Coordinador" />
        <main className="flex-1 overflow-y-auto p-8 bg-white/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
