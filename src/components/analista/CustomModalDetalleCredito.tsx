import { CustomModalDetalleCuentasAnalista } from "@maximilian/components/investigacion/CustomModalDetalleCuentasInforme";
import type { CompaniaNoticiaBalanceListaItem } from "@maximilian/shared/types/compania-noticia-balance.type";

interface PropsCustomModalDetalleCredito {
  reporte: CompaniaNoticiaBalanceListaItem | null;
  onCerrar: () => void;
}

function crearDetalleCuentasVacio() {
  return {
    balanceGeneral: {
      totalCorrientes: "",
      totalNoCorrientes: "",
      otrosActivos: "",
      totalActivos: "",
      totalPasivosCorrientes: "",
      totalPasivosNoCorrientes: "",
      otrosPasivos: "",
      totalPasivos: "",
      patrimonio: "",
      totalPasivoPatrimonio: "",
    },
    estadoGananciasPerdidas: {
      ventasNetas: "",
      utilidadGanancia: "",
    },
    ratios: {
      liquidez: "",
      capitalTrabajo: "",
      endeudamiento: "",
      rentabilidad: "",
    },
    registrosHabilitados: true,
    totalesHabilitados: true,
    registrosEstadoFinanciero: {},
  };
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
      detalleInicial={reporte.detalleCuentas ?? crearDetalleCuentasVacio()}
      tipoEstadoFinanciero={reporte.tipo}
      soloLectura
    />
  );
}
