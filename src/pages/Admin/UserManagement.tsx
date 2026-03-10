import { Search, Plus, Filter, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";

const users = [
  { id: 1, name: "Juan", paternal: "Alarcon", maternal: "Concha", username: "jconcha", role: "Coordinador", email: "juan.alarcon@safetyreport.com.pe", status: "Activo" },
  { id: 2, name: "María Fernanda", paternal: "Ríos", maternal: "Zapallar", username: "mfrios", role: "Analista", email: "mrios@safetyreport.com.pe", status: "Activo" },
  { id: 3, name: "Carlos", paternal: "Mendoza", maternal: "Gonzales", username: "cmendoza", role: "Traductor", email: "carlos.mendoza@safetyreport.com.pe", status: "Activo" },
  { id: 4, name: "Lucía", paternal: "Torres", maternal: "Torres", username: "lutorres", role: "Administrador", email: "lucia.torres@safetyreport.com.pe", status: "Activo" },
  { id: 5, name: "Andrés", paternal: "Salazar", maternal: "Perez", username: "aperez", role: "Coordinador, Analista", email: "andres.salazar@safetyreport.com.pe", status: "Activo" },
];

export default function UserManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-black">Usuarios</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar usuario" 
              className="pl-10 pr-4 py-2 bg-brand-white border border-gray-200 rounded-lg text-sm w-72 focus:ring-2 focus:ring-brand-wine/20 focus:border-brand-wine outline-none transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            <Filter size={16} />
            <span>Estado</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-brand-wine text-brand-white rounded-lg text-sm font-medium hover:bg-brand-wine/90 transition-all shadow-sm shadow-brand-wine/20">
            <Plus size={16} />
            <span>Agregar Usuario</span>
          </button>
        </div>
      </div>

      <div className="bg-brand-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-medium">
              <tr>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Apellido Paterno</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Apellido Materno</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Nombre de Usuario</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Rol</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-brand-black font-medium">{user.name}</td>
                  <td className="px-6 py-4 text-gray-600">{user.paternal}</td>
                  <td className="px-6 py-4 text-gray-600">{user.maternal}</td>
                  <td className="px-6 py-4 text-gray-600">{user.username}</td>
                  <td className="px-6 py-4 text-gray-600">{user.role}</td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold border border-green-100">
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-400 hover:text-brand-black transition-colors">
                      <MoreHorizontal size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-gray-500 text-xs">
          <span>Mostrando 5 de 32 pedidos</span>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1 hover:text-brand-black disabled:opacity-30" disabled>
              <ChevronLeft size={16} /> Anterior
            </button>
            <div className="flex items-center gap-2">
              <button className="w-6 h-6 flex items-center justify-center rounded bg-brand-black text-brand-white font-medium">1</button>
              <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100">2</button>
              <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100">3</button>
              <span>...</span>
            </div>
            <button className="flex items-center gap-1 hover:text-brand-black">
              Siguiente <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
