import { useNavigate } from "react-router";
import { Shield, ChevronRight, User, LogOut } from "lucide-react";

const roles = [
  {
    id: "admin",
    title: "Administrador",
    description: "Acceso a configuracion de parametros y la gestion de usuarios",
  },
  {
    id: "coordinator",
    title: "Coordinador",
    description: "Gestion, supervision y revision de pedidos, clientes y facturas dentro del sistema",
  },
  {
    id: "analyst",
    title: "Analista",
    description: "Lectura de pedidos e investigacion de informes",
  },
];

export default function RoleSelectionPage() {
  const navigate = useNavigate();

  const handleRoleSelect = (roleId: string) => {
    console.log("Role selected:", roleId);
    navigate("/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-brand-white w-full max-w-md p-10 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
        {/* Logo */}
        <div className="bg-brand-black p-4 rounded-3xl rotate-45 mb-8">
          <Shield className="text-brand-white w-10 h-10 -rotate-45" />
        </div>

        <h1 className="text-4xl font-extrabold text-brand-black mb-2">Safety Report</h1>
        <p className="text-gray-400 text-center text-sm mb-10 leading-relaxed px-6">
          Credenciales validadas correctamente. Seleccione su rol para ingresar al sistema
        </p>

        <div className="w-full space-y-4">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => handleRoleSelect(role.id)}
              className="w-full p-5 bg-brand-white border border-gray-100 rounded-2xl flex items-center gap-4 hover:border-brand-wine/30 hover:shadow-lg hover:shadow-brand-wine/5 group transition-all text-left"
            >
              <div className="flex-1">
                <h3 className="text-brand-black font-bold mb-1 group-hover:text-brand-wine transition-colors">
                  {role.title}
                </h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  {role.description}
                </p>
              </div>
              <ChevronRight className="text-gray-300 group-hover:text-brand-wine transition-colors" size={20} />
            </button>
          ))}
        </div>

        <div className="w-full mt-10 pt-6 border-t border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
              <User size={20} />
            </div>
            <span className="text-sm font-bold text-brand-black">Juan Espinoza</span>
          </div>
          
          <button 
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 text-brand-wine font-bold text-sm hover:opacity-80 transition-opacity"
          >
            <LogOut size={18} />
            <span>Cerrar sesion</span>
          </button>
        </div>
      </div>
    </div>
  );
}
