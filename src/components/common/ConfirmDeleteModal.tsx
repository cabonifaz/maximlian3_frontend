import { ConfirmActionModal } from "./ConfirmActionModal";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  isSubmitting?: boolean;
  confirmDisabled?: boolean;
  children: React.ReactNode;
  descripcion?: string;
  textoConfirmar?: string;
  textoCargandoConfirmar?: string;
  anchoMaximoClassName?: string;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  isSubmitting = false,
  confirmDisabled = false,
  children,
  descripcion,
  textoConfirmar,
  textoCargandoConfirmar,
  anchoMaximoClassName,
}: ConfirmDeleteModalProps) {
  return (
    <ConfirmActionModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={title}
      isSubmitting={isSubmitting}
      confirmDisabled={confirmDisabled}
      descripcion={descripcion}
      textoConfirmar={textoConfirmar}
      textoCargandoConfirmar={textoCargandoConfirmar}
      anchoMaximoClassName={anchoMaximoClassName}
      varianteConfirmar="danger"
    >
      {children}
    </ConfirmActionModal>
  );
}
