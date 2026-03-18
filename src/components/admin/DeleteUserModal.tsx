import { X, Loader2 } from "lucide-react";

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName?: string;
  isSubmitting?: boolean;
}

export function DeleteUserModal({
  isOpen,
  onClose,
  onConfirm,
  userName,
  isSubmitting = false,
}: DeleteUserModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-brand-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-brand-black">
              ¿Eliminar este usuario?
            </h2>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-brand-black transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
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
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-brand-black text-brand-white rounded-lg text-sm font-bold hover:bg-brand-black/90 transition-all shadow-lg shadow-black/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Eliminando...</span>
                </>
              ) : (
                <span>Confirmar</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
