import { CustomModalDetalleCuentasAnalista } from "@maximilian/components/investigacion/CustomModalDetalleCuentasInforme";
import type { CompaniaNoticiaBalanceListaItem } from "@maximilian/shared/types/compania-noticia-balance.type";

interface PropsCustomModalDetalleCredito {
  reporte: CompaniaNoticiaBalanceListaItem | null;
  onCerrar: () => void;
}

export function CustomModalDetalleCredito({
  reporte,
  onCerrar,
}: PropsCustomModalDetalleCredito) {
  if (!reporte) return null;

  return (
    <CustomModalDetalleCuentasAnalista
      estaAbierto={Boolean(reporte)}
      onCerrar={onCerrar}
      onGuardar={() => {}}
      detalleInicial={reporte.detalleCuentas}
      tipoEstadoFinanciero={reporte.tipo}
      soloLectura
    />
  );
}
