import { X } from "lucide-react";
import { CustomButton } from "./CustomButton";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  isSubmitting?: boolean;
  children: React.ReactNode;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  isSubmitting = false,
  children,
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-brand-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-brand-black">{title}</h2>
          <CustomButton variant="ghost" size="icon" onClick={onClose}>
            <X size={20} className="text-gray-400" />
          </CustomButton>
        </div>

        <div className="px-8 py-6 space-y-4">
          <p className="text-sm text-gray-600">¿Estás seguro de que deseas continuar? Esta acción no se puede deshacer.</p>
          <div className="bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700 space-y-1">
            {children}
          </div>
        </div>

        <div className="px-8 py-6 border-t border-gray-100 flex justify-end gap-3">
          <CustomButton
            variant="secondary"
            size="compact"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </CustomButton>
          <CustomButton
            variant="danger"
            size="compact"
            onClick={onConfirm}
            loading={isSubmitting}
            loadingText="Confirmando..."
          >
            Confirmar
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
