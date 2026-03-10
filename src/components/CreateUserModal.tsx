import { useState } from "react";
import { X, Check } from "lucide-react";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (userData: any) => void;
}

type Tab = "info" | "roles";

export function CreateUserModal({ isOpen, onClose, onConfirm }: CreateUserModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [formData, setFormData] = useState({
    firstName: "",
    paternalLastName: "",
    maternalLastName: "",
    username: "",
    email: "",
    roles: [] as string[],
  });

  if (!isOpen) return null;

  const rolesOptions = ["Analista", "Traductor", "Coordinador", "Administrador"];

  const handleRoleToggle = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  };

  const handleConfirm = () => {
    onConfirm(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-brand-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between border-b border-gray-100">
          <h2 className="text-xl font-bold text-brand-black">
            {activeTab === "info" ? "Agrega un Usuario" : "Roles de Usuario"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-brand-black transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="px-8 mt-6">
          <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-200">
            <button
              onClick={() => setActiveTab("info")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === "info"
                  ? "bg-brand-white text-brand-black shadow-sm"
                  : "text-gray-500 hover:text-brand-black"
              }`}
            >
              Información
            </button>
            <button
              onClick={() => setActiveTab("roles")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === "roles"
                  ? "bg-brand-white text-brand-black shadow-sm"
                  : "text-gray-500 hover:text-brand-black"
              }`}
            >
              Roles
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 min-h-[320px]">
          {activeTab === "info" ? (
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-brand-black">Nombre</label>
                <input
                  type="text"
                  placeholder="Nombre"
                  className="w-full px-4 py-2 bg-brand-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-wine/20 focus:border-brand-wine outline-none transition-all"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-brand-black">Apellido Paterno</label>
                <input
                  type="text"
                  placeholder="Apellido Paterno"
                  className="w-full px-4 py-2 bg-brand-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-wine/20 focus:border-brand-wine outline-none transition-all"
                  value={formData.paternalLastName}
                  onChange={(e) => setFormData({ ...formData, paternalLastName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-brand-black">Apellido Materno</label>
                <input
                  type="text"
                  placeholder="Apellido Materno"
                  className="w-full px-4 py-2 bg-brand-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-wine/20 focus:border-brand-wine outline-none transition-all"
                  value={formData.maternalLastName}
                  onChange={(e) => setFormData({ ...formData, maternalLastName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-brand-black">Nombre de Usuario</label>
                <input
                  type="text"
                  placeholder="Nombre de Usuario"
                  className="w-full px-4 py-2 bg-brand-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-wine/20 focus:border-brand-wine outline-none transition-all"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-semibold text-brand-black">Email</label>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-2 bg-brand-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-wine/20 focus:border-brand-wine outline-none transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-brand-black mb-4">Seleccionar Roles</p>
              <div className="space-y-3">
                {rolesOptions.map((role) => (
                  <label
                    key={role}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div
                      onClick={() => handleRoleToggle(role)}
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                        formData.roles.includes(role)
                          ? "bg-brand-black border-brand-black"
                          : "border-gray-300 group-hover:border-brand-black"
                      }`}
                    >
                      {formData.roles.includes(role) && (
                        <Check size={14} className="text-brand-white" />
                      )}
                    </div>
                    <span className="text-sm text-gray-700 font-medium">{role}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={handleConfirm}
            className="flex items-center gap-2 px-8 py-2.5 bg-brand-black text-brand-white rounded-lg text-sm font-bold hover:bg-brand-black/90 transition-all shadow-lg shadow-black/10"
          >
            <div className="w-2 h-2 rounded-full bg-brand-white" />
            <span>Confirmar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
