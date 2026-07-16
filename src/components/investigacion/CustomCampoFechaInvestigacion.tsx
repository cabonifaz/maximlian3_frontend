import type { ReactNode } from "react";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { CustomSelectorFecha } from "@maximilian/components/common/CustomSelectorFecha";
import { useFormatoFechaInforme } from "@maximilian/shared/contexts/formato-fecha-informe.context";
import { convertirTextoAFecha, formatearFechaDdMmYyyy } from "@maximilian/shared/utils/fecha.util";

interface PropsCustomCampoFechaInvestigacion {
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
  soloLectura?: boolean;
  nombre?: string;
  adicionalEtiqueta?: ReactNode;
  error?: string;
  className?: string;
}

export function CustomCampoFechaInvestigacion({
  etiqueta,
  valor,
  onChange,
  soloLectura = false,
  nombre,
  adicionalEtiqueta,
  error,
  className,
}: PropsCustomCampoFechaInvestigacion) {
  const { formato, locale } = useFormatoFechaInforme();

  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <CustomLabel as="p" className="text-sm font-bold text-gray-700">
        <span className="inline-flex items-center gap-2">
          <span>{etiqueta}</span>
          {adicionalEtiqueta}
        </span>
      </CustomLabel>
      <CustomSelectorFecha
        value={convertirTextoAFecha(valor)}
        onChange={(fecha) => onChange(fecha ? formatearFechaDdMmYyyy(fecha) : "")}
        disabled={soloLectura}
        error={error}
        placeholder="dd/mm/yyyy"
        formatoVisual={formato}
        localeVisual={locale}
      />
      {nombre ? <input type="hidden" name={nombre} value={valor} /> : null}
    </div>
  );
}
