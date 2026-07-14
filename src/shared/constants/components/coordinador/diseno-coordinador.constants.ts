import { CheckSquare, Database, FileText, Package, UserPlus, Users } from "lucide-react";

export const coordinatorMenuItems = [
  { name: "Banco de Información", icon: Database, path: "/coordinador/banco-informacion" },
  { name: "Clientes", icon: Users, path: "/coordinador/clientes" },
  { name: "Pedidos", icon: Package, path: "/coordinador/pedidos" },
  { name: "Asignaciones", icon: UserPlus, path: "/coordinador/asignaciones" },
  { name: "Revisión y Aprobación", icon: CheckSquare, path: "/coordinador/revision" },
  { name: "Facturación", icon: FileText, path: "/coordinador/facturacion" },
];
