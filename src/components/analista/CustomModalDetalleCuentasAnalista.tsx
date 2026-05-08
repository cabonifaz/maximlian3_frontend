import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { CustomModalPestanas } from "@maximilian/components/common/CustomModalPestanas";
import type {
  DetalleBalanceGeneralAnalista,
  DetalleCuentasBalanceAnalista,
  DetalleEstadoGananciaAnalista,
  DetalleRatiosBalanceAnalista,
} from "@maximilian/shared/types/analista.type";

interface PropsCustomModalDetalleCuentasAnalista {
  estaAbierto: boolean;
  onCerrar: () => void;
  onGuardar: (detalle: DetalleCuentasBalanceAnalista) => void;
  detalleInicial?: DetalleCuentasBalanceAnalista;
  tipoEstadoFinanciero?: string;
}

function crearDetalleVacio(): DetalleCuentasBalanceAnalista {
  return {
    balanceGeneral: {
      totalCorrientes: "0.00",
      totalNoCorrientes: "0.00",
      otrosActivos: "0.00",
      totalActivos: "0.00",
      totalPasivosCorrientes: "0.00",
      totalPasivosNoCorrientes: "0.00",
      otrosPasivos: "0.00",
      totalPasivos: "0.00",
      patrimonio: "0.00",
      totalPasivoPatrimonio: "0.00",
    },
    estadoGananciasPerdidas: {
      ventasNetas: "0.00",
      utilidadGanancia: "0.00",
    },
    ratios: {
      liquidez: "0.00",
      capitalTrabajo: "0.00",
      endeudamiento: "0.00",
      rentabilidad: "0.00",
    },
  };
}

function CampoDetalle({
  etiqueta,
  valor,
  onChange,
  negrita = false,
}: {
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
  negrita?: boolean;
}) {
  return (
    <div className="space-y-2">
      <CustomLabel as="p" className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
        {etiqueta}
      </CustomLabel>
      <input
        value={valor}
        onChange={(event) => onChange(event.target.value)}
        placeholder="0.00"
        className={`h-10 w-full rounded-md border border-gray-200 bg-slate-50 px-3 text-sm text-slate-600 outline-none transition-all focus:border-brand-black focus:ring-2 focus:ring-brand-black/5 ${negrita ? "font-bold text-brand-black" : ""}`}
      />
    </div>
  );
}

export function CustomModalDetalleCuentasAnalista({
  estaAbierto,
  onCerrar,
  onGuardar,
  detalleInicial,
  tipoEstadoFinanciero,
}: PropsCustomModalDetalleCuentasAnalista) {
  const detalleBase = useMemo(() => detalleInicial ?? crearDetalleVacio(), [detalleInicial]);
  const [detalle, setDetalle] = useState<DetalleCuentasBalanceAnalista>(detalleBase);
  const [pestanaActiva, setPestanaActiva] = useState("balance-general");

  useEffect(() => {
    setDetalle(detalleBase);
  }, [detalleBase]);

  const mostrarRatios = ["Desagregado", "Totalizado", "Turquía"].includes(tipoEstadoFinanciero ?? "");

  useEffect(() => {
    if (!mostrarRatios && pestanaActiva === "ratios") {
      setPestanaActiva("balance-general");
    }
  }, [mostrarRatios, pestanaActiva]);

  if (!estaAbierto) return null;

  const actualizarBalanceGeneral = (campo: keyof DetalleBalanceGeneralAnalista, valor: string) => {
    setDetalle((anterior) => ({
      ...anterior,
      balanceGeneral: {
        ...anterior.balanceGeneral,
        [campo]: valor,
      },
    }));
  };

  const actualizarEstadoGanancias = (campo: keyof DetalleEstadoGananciaAnalista, valor: string) => {
    setDetalle((anterior) => ({
      ...anterior,
      estadoGananciasPerdidas: {
        ...anterior.estadoGananciasPerdidas,
        [campo]: valor,
      },
    }));
  };

  const actualizarRatios = (campo: keyof DetalleRatiosBalanceAnalista, valor: string) => {
    setDetalle((anterior) => ({
      ...anterior,
      ratios: {
        ...anterior.ratios,
        [campo]: valor,
      },
    }));
  };

  const tabs = [
    {
      id: "balance-general",
      label: "Balance General",
      content: (
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-5">
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-brand-black">• Activos</p>
            <CampoDetalle etiqueta="Total Corrientes" valor={detalle.balanceGeneral.totalCorrientes} onChange={(valor) => actualizarBalanceGeneral("totalCorrientes", valor)} />
            <CampoDetalle etiqueta="Total No Corrientes" valor={detalle.balanceGeneral.totalNoCorrientes} onChange={(valor) => actualizarBalanceGeneral("totalNoCorrientes", valor)} />
            <CampoDetalle etiqueta="Otros Activos" valor={detalle.balanceGeneral.otrosActivos} onChange={(valor) => actualizarBalanceGeneral("otrosActivos", valor)} />
            <CampoDetalle etiqueta="Total Activos" valor={detalle.balanceGeneral.totalActivos} onChange={(valor) => actualizarBalanceGeneral("totalActivos", valor)} negrita />
          </div>

          <div className="space-y-5">
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-brand-black">• Pasivos y Patrimonio</p>
            <CampoDetalle etiqueta="Total Pasivos Corrientes" valor={detalle.balanceGeneral.totalPasivosCorrientes} onChange={(valor) => actualizarBalanceGeneral("totalPasivosCorrientes", valor)} />
            <CampoDetalle etiqueta="Total Pasivos No Corrientes" valor={detalle.balanceGeneral.totalPasivosNoCorrientes} onChange={(valor) => actualizarBalanceGeneral("totalPasivosNoCorrientes", valor)} />
            <CampoDetalle etiqueta="Otros Pasivos" valor={detalle.balanceGeneral.otrosPasivos} onChange={(valor) => actualizarBalanceGeneral("otrosPasivos", valor)} />
            <CampoDetalle etiqueta="Total Pasivos" valor={detalle.balanceGeneral.totalPasivos} onChange={(valor) => actualizarBalanceGeneral("totalPasivos", valor)} negrita />
            <CampoDetalle etiqueta="Patrimonio" valor={detalle.balanceGeneral.patrimonio} onChange={(valor) => actualizarBalanceGeneral("patrimonio", valor)} />
            <CampoDetalle etiqueta="Total Pasivo y Patrimonio" valor={detalle.balanceGeneral.totalPasivoPatrimonio} onChange={(valor) => actualizarBalanceGeneral("totalPasivoPatrimonio", valor)} negrita />
          </div>
        </div>
      ),
    },
    {
      id: "estado-ganancias",
      label: "Estado de Ganancias y Pérdidas",
      content: (
        <div className="grid gap-8 md:grid-cols-2">
          <CampoDetalle etiqueta="Ventas Netas" valor={detalle.estadoGananciasPerdidas.ventasNetas} onChange={(valor) => actualizarEstadoGanancias("ventasNetas", valor)} />
          <CampoDetalle etiqueta="Utilidad / Ganancia" valor={detalle.estadoGananciasPerdidas.utilidadGanancia} onChange={(valor) => actualizarEstadoGanancias("utilidadGanancia", valor)} />
        </div>
      ),
    },
    {
      id: "ratios",
      label: "Ratios",
      disabled: !mostrarRatios,
      tooltip: "Los ratios se habilitan para estados financieros Desagregado, Totalizado o Turquía.",
      content: (
        <div className="grid gap-8 md:grid-cols-2">
          <CampoDetalle etiqueta="Índice de Liquidez" valor={detalle.ratios.liquidez} onChange={(valor) => actualizarRatios("liquidez", valor)} />
          <CampoDetalle etiqueta="Capital de Trabajo" valor={detalle.ratios.capitalTrabajo} onChange={(valor) => actualizarRatios("capitalTrabajo", valor)} />
          <CampoDetalle etiqueta="Ratio de Endeudamiento" valor={detalle.ratios.endeudamiento} onChange={(valor) => actualizarRatios("endeudamiento", valor)} />
          <CampoDetalle etiqueta="Ratio de Rentabilidad" valor={detalle.ratios.rentabilidad} onChange={(valor) => actualizarRatios("rentabilidad", valor)} />
        </div>
      ),
    },
  ];

  const validarTotalesBalance = () => {
    const totalActivos = Number.parseFloat(detalle.balanceGeneral.totalActivos.replace(",", "."));
    const totalPasivoPatrimonio = Number.parseFloat(detalle.balanceGeneral.totalPasivoPatrimonio.replace(",", "."));

    if (Number.isNaN(totalActivos) || Number.isNaN(totalPasivoPatrimonio)) {
      toast.error("Ingrese valores numéricos válidos para Total Activos y Total Pasivo y Patrimonio.");
      return false;
    }

    if (Math.abs(totalActivos - totalPasivoPatrimonio) > 0.000001) {
      toast.error("Total Activos debe ser igual a Total Pasivo y Patrimonio, incluyendo decimales.");
      return false;
    }

    return true;
  };

  return (
    <CustomModalPestanas
      isOpen={estaAbierto}
      onClose={onCerrar}
      title="Detalle de Cuentas"
      subtitle={<p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8ea0c0]">Gestión de cuentas contables</p>}
      tabs={tabs}
      activeTab={pestanaActiva}
      onTabChange={setPestanaActiva}
      tabVariant="underline"
      maxWidth="max-w-5xl"
      footer={(
        <div className="flex justify-end gap-3">
          <CustomButton variant="secondary" size="sm" onClick={onCerrar}>
            Cancelar
          </CustomButton>
          <CustomButton
            size="sm"
            onClick={() => {
              if (!validarTotalesBalance()) return;
              onGuardar(detalle);
            }}
          >
            Guardar Cambios
          </CustomButton>
        </div>
      )}
    />
  );
}
