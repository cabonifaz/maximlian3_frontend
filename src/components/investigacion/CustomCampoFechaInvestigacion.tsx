import type { ReactNode } from "react";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { CustomSelectorFecha } from "@maximilian/components/common/CustomSelectorFecha";
import { useFormatoFechaInforme } from "@maximilian/shared/contexts/formato-fecha-informe.context";

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
        onChange={(fecha) => onChange(fecha ? formatearFecha(fecha) : "")}
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

function convertirTextoAFecha(valor: string): Date | undefined {
  const texto = valor.trim();
  if (!texto) return undefined;

  const coincidenciaIso = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);
  const partes = coincidenciaIso
    ? [Number(coincidenciaIso[3]), Number(coincidenciaIso[2]), Number(coincidenciaIso[1])]
    : texto.split("/").map(Number);
  const [dia, mes, ano] = partes;
  if (!dia || !mes || !ano) return undefined;

  const fecha = new Date(ano, mes - 1, dia);
  return Number.isNaN(fecha.getTime()) ? undefined : fecha;
}

function formatearFecha(fecha: Date): string {
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  return `${dia}/${mes}/${fecha.getFullYear()}`;
}
