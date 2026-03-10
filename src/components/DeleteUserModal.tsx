import { X } from "lucide-react";

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName?: string;
}

export function DeleteUserModal({
  isOpen,
  onClose,
  onConfirm,
  userName,
}: DeleteUserModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-brand-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-brand-black">
              ¿Eliminar este usuario?
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-brand-black transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-2 text-gray-500 text-sm mb-8">
            <p>
              Esta acción eliminará al usuario{" "}
              {userName && <span className="font-bold text-brand-black">{userName}</span>} seleccionado de forma permanente.
            </p>
            <p>El usuario dejará de tener acceso al sistema.</p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-2 bg-brand-black text-brand-white rounded-lg text-sm font-bold hover:bg-brand-black/90 transition-all shadow-lg shadow-black/10"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
