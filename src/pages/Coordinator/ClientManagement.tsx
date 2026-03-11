import { useState } from "react";
import { Search, Filter, Plus, MoreHorizontal, ChevronLeft, ChevronRight, Eye, UserMinus } from "lucide-react";
import { AddClientModal } from "@maximilian/components/AddClientModal";

const mockClients = [
  { id: 1, nombre: "Juan Espinoza", pais: "Perú", tipoPersona: "Natural", telefono: "+51 987 654 321", email: "juan.espinoza@softwarefactorylatam.com", estado: "Activo" },
  { id: 2, nombre: "Maria Fernanda Rios", pais: "Uruguay", tipoPersona: "Jurídica", telefono: "+598 98 123 456", email: "mrios@andinasoluciones.com", estado: "Activo" },
  { id: 3, nombre: "Carlos Mendoza", pais: "Colombia", tipoPersona: "Natural", telefono: "+57 301 555 0192", email: "carlos.mendoza@grupomh.pe", estado: "Activo" },
  { id: 4, nombre: "Lucia Torres", pais: "Argentina", tipoPersona: "Jurídica", telefono: "+54 11 2345 6789", email: "lucia.torres@nexaconsulting.com", estado: "Activo" },
  { id: 5, nombre: "Andrés Salazar", pais: "Chile", tipoPersona: "Natural", telefono: "+56 9 8765 4321", email: "andres.salazar@innovacorp.cl", estado: "Activo" },
];

export default function ClientManagement() {
  const [searchTerm, setSearchBar] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">Clientes</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Busca por nombre o nro. de registro tributario"
              className="w-full pl-10 pr-4 py-2 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchBar(e.target.value)}
            />
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-brand-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer hover:scale-[1.02] active:scale-[0.98]">
            <Filter className="w-4 h-4" />
            <span>País</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-brand-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer hover:scale-[1.02] active:scale-[0.98]">
            <div className="w-2 h-2 rounded-full bg-brand-wine" />
            <span>Estado</span>
          </button>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-black text-brand-white rounded-xl text-sm font-bold hover:bg-brand-black/90 transition-all shadow-lg shadow-black/10 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Cliente</span>
          </button>
        </div>
      </div>

      <div className="bg-brand-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="px-6 py-4">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">País</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Tipo de Persona</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Teléfono</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mockClients.map((client, index) => (
                <tr key={client.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <input type="checkbox" className="rounded border-gray-300 text-brand-wine focus:ring-brand-wine" />
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-brand-black">{client.nombre}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{client.pais}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{client.tipoPersona}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 font-medium">{client.telefono}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">{client.email}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-600">
                      {client.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button 
                      onClick={() => setActiveMenuId(activeMenuId === client.id ? null : client.id)}
                      className="p-2 text-gray-400 hover:text-brand-black hover:bg-gray-100 rounded-lg transition-all cursor-pointer hover:scale-110 active:scale-90"
                    >
                      <MoreHorizontal size={18} />
                    </button>

                    {activeMenuId === client.id && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setActiveMenuId(null)}
                        />
                        <div className={`absolute right-6 ${index >= mockClients.length - 2 ? "bottom-10" : "top-10"} w-48 bg-brand-white rounded-xl shadow-2xl border border-gray-200/50 py-1 z-20 animate-in fade-in zoom-in-95 duration-100`}>
                          <button 
                            onClick={() => setActiveMenuId(null)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <Eye size={14} />
                            <span>Ver detalle</span>
                          </button>
                          <button 
                            onClick={() => setActiveMenuId(null)}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <UserMinus size={14} />
                            <span>Desactivar cliente</span>
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-between">
          <p className="text-xs text-gray-400 font-medium">
            Mostrando 5 de 32 clientes
          </p>
          
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-brand-black transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-1">
              {[1, 2, 3].map((page) => (
                <button
                  key={page}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer hover:scale-110 ${
                    page === 2 
                      ? "bg-brand-black text-brand-white shadow-lg shadow-black/10" 
                      : "text-gray-400 hover:bg-gray-100 hover:text-brand-black"
                  }`}
                >
                  {page}
                </button>
              ))}
              <span className="px-2 text-gray-300">...</span>
            </div>
            <button className="p-2 text-gray-400 hover:text-brand-black transition-colors cursor-pointer">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <AddClientModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={(data) => console.log("New client:", data)} 
      />
    </div>
  );
}
