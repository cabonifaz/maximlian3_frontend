import type { ReactNode } from "react";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import {
  CampoInvestigacionAnalista,
  SelectorMaestroConAltaInvestigacionAnalista,
} from "@maximilian/components/investigacion/ControlesInforme";
import { TablaMaestraId, type EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";
import { obtenerSimboloMonedaSeleccionada } from "@maximilian/shared/utils/tabla-maestra.util";

interface PropsCustomCampoMontoConMoneda {
  etiqueta: string;
  monto: string;
  moneda: string;
  opcionesMoneda: EntradaTablaMaestra[] | undefined;
  soloLectura: boolean;
  adicionalEtiqueta?: ReactNode;
  className?: string;
  onCambioMonto: (monto: string) => void;
  onCambioMoneda: (moneda: string) => void;
}

export function CustomCampoMontoConMoneda({
  etiqueta,
  monto,
  moneda,
  opcionesMoneda,
  soloLectura,
  adicionalEtiqueta,
  className,
  onCambioMonto,
  onCambioMoneda,
}: PropsCustomCampoMontoConMoneda) {
  const simbolo = obtenerSimboloMonedaSeleccionada(opcionesMoneda, moneda);

  return (
    <div className={`@container space-y-2 ${className ?? ""}`}>
      <CustomLabel as="p" className="text-sm font-bold text-gray-700">
        <span className="inline-flex items-center gap-2">
          <span>{etiqueta}</span>
          {adicionalEtiqueta}
        </span>
      </CustomLabel>
      <div className="grid grid-cols-1 gap-2 @md:grid-cols-[minmax(0,1fr)_minmax(12rem,1fr)]">
        <CampoInvestigacionAnalista
          etiqueta={etiqueta}
          valor={monto}
          soloLectura={soloLectura}
          tipoEntrada="decimal"
          adornoInicial={simbolo}
          ocultarEtiqueta
          className="min-w-0"
          onChange={onCambioMonto}
        />
        <SelectorMaestroConAltaInvestigacionAnalista
          etiqueta={`Moneda de ${etiqueta.toLowerCase()}`}
          valor={moneda === "0" ? "" : moneda}
          soloLectura={soloLectura}
          opcionesTablaMaestra={opcionesMoneda}
          usarPaginacion={false}
          buscarEnEndpoint
          idMaestro={TablaMaestraId.MONEDA}
          marcador="Moneda"
          obtenerValorOpcion={(opcion) => String(opcion.num1 ?? "")}
          ocultarEtiqueta
          onChange={onCambioMoneda}
        />
      </div>
    </div>
  );
}
