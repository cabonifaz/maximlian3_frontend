import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
import type { EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";

function crearOpcionTablaMaestra(num1: number, string1: string): EntradaTablaMaestra {
  return {
    idEmpresa: 0,
    idTablaMaestra: null,
    idMaestro: 0,
    descripcion: "",
    num1,
    num2: null,
    num3: null,
    string1,
    string2: null,
    string3: null,
    date1: null,
    date2: null,
    date3: null,
  };
}

export interface RegistroPersonaAnalista {
  id: number;
  tipoPersona: string;
  nombres: string;
  tipoDocumento: string;
  pais: string;
  telefono: string;
  existeInformacion: boolean;
}

interface PropsCustomModalRegistroEmpresaRelacionadaAnalista {
  estaAbierto: boolean;
  opcionesTipoPersona?: EntradaTablaMaestra[];
  opcionesPais?: EntradaTablaMaestra[];
  registroInicial?: RegistroPersonaAnalista | null;
  onCerrar: () => void;
  onGuardar: (registro: RegistroPersonaAnalista) => void;
}

const opcionesTipoDocumento: EntradaTablaMaestra[] = [
  crearOpcionTablaMaestra(1, "RUC"),
  crearOpcionTablaMaestra(2, "NIT"),
  crearOpcionTablaMaestra(3, "RFC"),
];

export function CustomModalRegistroEmpresaRelacionadaAnalista({
  estaAbierto,
  opcionesTipoPersona,
  opcionesPais,
  registroInicial,
  onCerrar,
  onGuardar,
}: PropsCustomModalRegistroEmpresaRelacionadaAnalista) {
  const [idTipoPersona, setIdTipoPersona] = useState<number | undefined>(undefined);
  const [idPais, setIdPais] = useState<number | undefined>(undefined);
  const [idTipoDocumento, setIdTipoDocumento] = useState<number | undefined>(undefined);
  const [nombreEmpresa, setNombreEmpresa] = useState(registroInicial?.nombres ?? "");
  const [numeroIdentificacion, setNumeroIdentificacion] = useState(
    registroInicial?.tipoDocumento.split(" - ")[1] ?? "",
  );
  const [telefono, setTelefono] = useState(registroInicial?.telefono ?? "");
  const [existeInformacion, setExisteInformacion] = useState(registroInicial?.existeInformacion ?? true);

  const tipoPersonaActual = useMemo(() => {
    if (registroInicial && idTipoPersona == null) {
      return registroInicial.tipoPersona;
    }
    return opcionesTipoPersona?.find((opcion) => opcion.num1 === idTipoPersona)?.string1 ?? "";
  }, [registroInicial, opcionesTipoPersona, idTipoPersona]);

  const paisActual = useMemo(() => {
    if (registroInicial && idPais == null) {
      return registroInicial.pais;
    }
    return opcionesPais?.find((opcion) => opcion.num1 === idPais)?.string1 ?? "";
  }, [registroInicial, opcionesPais, idPais]);

  const tipoDocumentoActual = useMemo(() => {
    if (registroInicial && idTipoDocumento == null) {
      return registroInicial.tipoDocumento.split(" - ")[0] ?? "";
    }
    return opcionesTipoDocumento.find((opcion) => opcion.num1 === idTipoDocumento)?.string1 ?? "";
  }, [registroInicial, idTipoDocumento]);
  if (!estaAbierto) return null;

  const manejarGuardar = () => {
    const nombreNormalizado = nombreEmpresa.trim();
    const documentoTipo = tipoDocumentoActual.trim();
    const documentoNumero = numeroIdentificacion.trim();

    if (!nombreNormalizado || !tipoPersonaActual || !paisActual || !documentoTipo || !documentoNumero) {
      return;
    }

    onGuardar({
      id: registroInicial?.id ?? Date.now(),
      tipoPersona: tipoPersonaActual,
      nombres: nombreNormalizado,
      tipoDocumento: `${documentoTipo} - ${documentoNumero}`,
      pais: paisActual,
      telefono: telefono.trim(),
      existeInformacion,
    });
    setIdTipoPersona(undefined);
    setIdPais(undefined);
    setIdTipoDocumento(undefined);
    setNombreEmpresa("");
    setNumeroIdentificacion("");
    setTelefono("");
    setExisteInformacion(true);
  };

  const manejarCerrar = () => {
    setIdTipoPersona(undefined);
    setIdPais(undefined);
    setIdTipoDocumento(undefined);
    setNombreEmpresa("");
    setNumeroIdentificacion("");
    setTelefono("");
    setExisteInformacion(true);
    onCerrar();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm">
      <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-[22px] bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5 md:px-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8ea0c0]">
              Registro de terceros
            </p>
            <h2 className="mt-1 text-[18px] font-bold text-slate-800">Empresas relacionadas</h2>
          </div>
          <CustomButton variant="ghost" size="icon" onClick={manejarCerrar}>
            <X size={18} className="text-[#c2cad8]" />
          </CustomButton>
        </div>

        <div className="grid gap-5 overflow-y-auto px-6 py-5 md:grid-cols-2 md:px-8 md:py-7">
          <div className="md:col-span-2">
            <div className="grid gap-5 md:grid-cols-2">
            <CustomSelectorBuscable
              label="Tipo de Persona"
              options={opcionesTipoPersona}
              value={idTipoPersona}
              displayValue={tipoPersonaActual}
              onChange={setIdTipoPersona}
              placeholder="Seleccione tipo persona"
            />
            <CustomSelectorBuscable
              label="País"
              options={opcionesPais}
              value={idPais}
              displayValue={paisActual}
              onChange={setIdPais}
              placeholder="Seleccione un país"
            />
          </div>
          </div>

          <div className="space-y-2">
            <CustomLabel>Nombre de la Empresa</CustomLabel>
            <input
              value={nombreEmpresa}
              onChange={(event) => setNombreEmpresa(event.target.value)}
              placeholder="Razón Social completa"
              className="h-11 w-full rounded-xl border border-[#dbe4f0] px-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-300 focus:border-brand-black focus:ring-2 focus:ring-brand-black/5"
            />
          </div>

          <div className="space-y-3">
            <CustomLabel>Identificación Fiscal</CustomLabel>
            <div className="grid gap-3 md:grid-cols-[120px_minmax(0,1fr)]">
              <CustomSelectorBuscable
                options={opcionesTipoDocumento}
                value={idTipoDocumento}
                displayValue={tipoDocumentoActual}
                onChange={setIdTipoDocumento}
                placeholder="Seleccione tipo documento"
              />
              <input
                value={numeroIdentificacion}
                onChange={(event) => setNumeroIdentificacion(event.target.value)}
                placeholder="Número de identificación"
                className="h-11 w-full rounded-xl border border-[#dbe4f0] px-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-300 focus:border-brand-black focus:ring-2 focus:ring-brand-black/5"
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <CustomLabel>Teléfono</CustomLabel>
              <input
                value={telefono}
                onChange={(event) => setTelefono(event.target.value)}
                placeholder="Número de teléfono"
                className="h-11 w-full rounded-xl border border-[#dbe4f0] px-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-300 focus:border-brand-black focus:ring-2 focus:ring-brand-black/5"
              />
            </div>

            <label className="flex h-11 items-center gap-3 self-end rounded-xl border border-[#dbe4f0] px-4 text-sm font-semibold text-slate-600">
              <input
                type="checkbox"
                checked={existeInformacion}
                onChange={(event) => setExisteInformacion(event.target.checked)}
                className="h-4 w-4 accent-brand-wine"
              />
              Existe información
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-5 md:px-8">
          <CustomButton variant="secondary" size="sm" onClick={manejarCerrar}>
            Cancelar
          </CustomButton>
          <CustomButton size="sm" onClick={manejarGuardar}>
            Guardar
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
