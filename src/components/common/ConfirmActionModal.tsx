import { X } from "lucide-react";
import { CustomButton } from "./CustomButton";

interface ConfirmActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  isSubmitting?: boolean;
  children: React.ReactNode;
  descripcion?: string;
  textoConfirmar?: string;
  textoCargandoConfirmar?: string;
  varianteConfirmar?: "primary" | "secondary" | "danger" | "wine" | "ghost";
  anchoMaximoClassName?: string;
}

export function ConfirmActionModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  isSubmitting = false,
  children,
  descripcion = "¿Estás seguro de que deseas continuar? Esta acción no se puede deshacer.",
  textoConfirmar = "Confirmar",
  textoCargandoConfirmar = "Confirmando...",
  varianteConfirmar = "danger",
  anchoMaximoClassName = "max-w-md",
}: ConfirmActionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className={`w-full overflow-hidden rounded-3xl bg-brand-white shadow-2xl animate-in zoom-in-95 duration-300 ${anchoMaximoClassName}`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-8 py-6">
          <h2 className="text-xl font-bold text-brand-black">{title}</h2>
          <CustomButton variant="ghost" size="icon" onClick={onClose} disabled={isSubmitting}>
            <X size={20} className="text-gray-400" />
          </CustomButton>
        </div>

        <div className="space-y-4 px-8 py-6">
          <p className="text-sm text-gray-600">{descripcion}</p>
          <div className="space-y-1 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
            {children}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 px-8 py-6">
          <CustomButton
            variant="secondary"
            size="compact"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </CustomButton>
          <CustomButton
            variant={varianteConfirmar}
            size="compact"
            onClick={onConfirm}
            loading={isSubmitting}
            loadingText={textoCargandoConfirmar}
          >
            {textoConfirmar}
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
