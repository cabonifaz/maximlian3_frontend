import { CustomModalConfirmacionAccion } from "./CustomModalConfirmacionAccion";

interface CustomModalConfirmacionEliminacionProps {
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

export function CustomModalConfirmacionEliminacion({
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
}: CustomModalConfirmacionEliminacionProps) {
  return (
    <CustomModalConfirmacionAccion
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
    </CustomModalConfirmacionAccion>
  );
}
