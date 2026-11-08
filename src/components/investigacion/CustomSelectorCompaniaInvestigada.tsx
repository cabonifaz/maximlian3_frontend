import { useState } from "react";
import { Building2, Search, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { CustomModalListaPersonasAnalista } from "@maximilian/components/investigacion/CustomModalListaPersonas";
import { useCompaniaVinculada } from "@maximilian/hooks/useCompaniaVinculada";
import type { CompaniaListaItem } from "@maximilian/shared/types/compania.type";
import type { EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";

interface PropsCustomSelectorCompaniaInvestigada {
  idCompania?: number;
  soloLectura?: boolean;
  opcionesTipoPersona?: EntradaTablaMaestra[];
  opcionesPais?: EntradaTablaMaestra[];
  idIdioma?: number;
  onSeleccionar: (compania: CompaniaListaItem) => void;
  onQuitar: () => void;
}

export function CustomSelectorCompaniaInvestigada({
  idCompania,
  soloLectura = false,
  opcionesTipoPersona,
  opcionesPais,
  idIdioma,
  onSeleccionar,
  onQuitar,
}: PropsCustomSelectorCompaniaInvestigada) {
  const [estaAbiertoBuscador, setEstaAbiertoBuscador] = useState(false);
  const { compania, estaCargando, obtenerDetalleCompania } = useCompaniaVinculada(idCompania);

  const textoCompania = !idCompania
    ? "Sin compañía vinculada"
    : estaCargando
      ? "Cargando compañía..."
      : compania
        ? [compania.nombreCompleto, compania.numeroDocumento, compania.pais].filter(Boolean).join(" · ")
        : `Compañía #${idCompania}`;

  return (
    <div className="space-y-2 md:col-span-2">
      <CustomLabel required>Compañía investigada (base de datos)</CustomLabel>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div
          className={`flex h-11 min-w-0 flex-1 items-center gap-2 rounded-2xl border px-4 text-sm ${
            idCompania ? "border-emerald-200 bg-emerald-50/60 text-slate-700" : "border-amber-200 bg-amber-50/60 text-amber-700"
          }`}
        >
          <Building2 size={16} className="shrink-0 opacity-60" />
          <span className="truncate font-semibold">{textoCompania}</span>
        </div>
        {!soloLectura ? (
          <div className="flex shrink-0 gap-2">
            <CustomButton size="sm" className="bg-brand-wine hover:bg-brand-wine/90" onClick={() => setEstaAbiertoBuscador(true)}>
              <Search size={14} />
              {idCompania ? "Cambiar" : "Buscar"}
            </CustomButton>
            {idCompania ? (
              <CustomButton variant="secondary" size="sm" onClick={onQuitar}>
                <X size={14} />
                Quitar
              </CustomButton>
            ) : null}
          </div>
        ) : null}
      </div>

      <CustomModalListaPersonasAnalista
        estaAbierto={estaAbiertoBuscador}
        opcionesTipoPersona={opcionesTipoPersona}
        opcionesPais={opcionesPais}
        idIdioma={idIdioma}
        onCerrar={() => setEstaAbiertoBuscador(false)}
        onGuardar={(_empresa, registro) => {
          setEstaAbiertoBuscador(false);
          void obtenerDetalleCompania(registro).then(onSeleccionar);
        }}
        etiqueta="Identificación"
        titulo="Compañía investigada"
        descripcionModal="Seleccione la compañía que corresponde al investigado o regístrela si no existe."
      />
    </div>
  );
}
