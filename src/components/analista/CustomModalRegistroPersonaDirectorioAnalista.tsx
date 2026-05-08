import { X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import type { RegistroPersonaDirectorioAnalista } from "@maximilian/shared/types/analista.type";

interface PropsCustomModalRegistroPersonaDirectorioAnalista {
  estaAbierto: boolean;
  onCerrar: () => void;
  onGuardar: (registro: Omit<RegistroPersonaDirectorioAnalista, "id">) => void;
}

const opcionesTipoPersona = ["Natural", "Jurídica"];
const opcionesPais = ["México", "Perú", "Colombia", "Estados Unidos", "Chile"];
const opcionesNacionalidad = ["Mexicana", "Peruana", "Colombiana", "Estadounidense", "Chilena"];
const opcionesDocumento = ["DNI", "Pasaporte", "RFC", "NIT"];
const opcionesIdFiscal = ["RUC", "RFC", "NIT", "Tax ID"];
const opcionesEstadoCivil = ["Soltero/a", "Casado/a", "Divorciado/a", "Viudo/a"];
const opcionesProfesion = ["Seleccione profesión", "Administrador", "Abogado", "Contador", "Ingeniero"];

export function CustomModalRegistroPersonaDirectorioAnalista({
  estaAbierto,
  onCerrar,
  onGuardar,
}: PropsCustomModalRegistroPersonaDirectorioAnalista) {
  if (!estaAbierto) return null;

  const manejarEnvio = (formData: FormData) => {
    onGuardar({
      tipoPersona: String(formData.get("tipoPersona") ?? ""),
      nombres: String(formData.get("nombres") ?? ""),
      pais: String(formData.get("pais") ?? ""),
      direccionPrincipal: String(formData.get("direccionPrincipal") ?? ""),
      ciudadProvinciaEstado: String(formData.get("ciudadProvinciaEstado") ?? ""),
      nacionalidad: String(formData.get("nacionalidad") ?? ""),
      tipoDocumentoIdentidad: String(formData.get("tipoDocumentoIdentidad") ?? ""),
      numeroDocumentoIdentidad: String(formData.get("numeroDocumentoIdentidad") ?? ""),
      tipoIdFiscal: String(formData.get("tipoIdFiscal") ?? ""),
      numeroIdFiscal: String(formData.get("numeroIdFiscal") ?? ""),
      fechaNacimiento: String(formData.get("fechaNacimiento") ?? ""),
      estadoCivil: String(formData.get("estadoCivil") ?? ""),
      profesion: String(formData.get("profesion") ?? ""),
      referenciaAdicional: String(formData.get("referenciaAdicional") ?? ""),
    });
  };

  return (
    <div className="fixed inset-0 z-[98] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-5xl flex-col overflow-hidden rounded-[22px] bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-[18px] font-bold text-slate-800">Agregar Empresa o Persona</h2>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#9aa8bd]">
              Registro de terceros
            </p>
          </div>
          <CustomButton variant="ghost" size="icon" onClick={onCerrar}>
            <X size={18} className="text-[#c2cad8]" />
          </CustomButton>
        </div>

        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(event) => {
            event.preventDefault();
            manejarEnvio(new FormData(event.currentTarget));
          }}
        >
          <div className="space-y-4 overflow-y-auto px-6 py-5">
            <div className="grid gap-4 md:grid-cols-[0.9fr_2fr_1fr]">
              <CampoSelect nombre="tipoPersona" etiqueta="Tipo de Persona" opciones={opcionesTipoPersona} valorDefecto="Natural" />
              <CampoInput nombre="nombres" etiqueta="Nombres" marcador="Ingrese nombres completos" />
              <CampoSelect nombre="pais" etiqueta="País" opciones={opcionesPais} marcadorVacio="Seleccione un país" />
            </div>

            <div className="grid gap-4 md:grid-cols-[1.35fr_1fr_1fr]">
              <CampoInput nombre="direccionPrincipal" etiqueta="Dirección Principal" marcador="Ingrese dirección" />
              <CampoInput nombre="ciudadProvinciaEstado" etiqueta="Ciudad / Provincia / Estado" marcador="Ingrese ciudad" />
              <CampoSelect nombre="nacionalidad" etiqueta="Nacionalidad" opciones={opcionesNacionalidad} marcadorVacio="Seleccione nacionalidad" />
            </div>

            <div className="grid gap-4 md:grid-cols-[0.9fr_1fr_1fr_1fr]">
              <CampoSelect nombre="tipoDocumentoIdentidad" etiqueta="Tipo Doc. Identidad" opciones={opcionesDocumento} valorDefecto="DNI" />
              <CampoInput nombre="numeroDocumentoIdentidad" etiqueta="Nro. Doc. Identidad" marcador="Ingrese nro. documento" />
              <CampoSelect nombre="tipoIdFiscal" etiqueta="Tipo de ID Fiscal" opciones={opcionesIdFiscal} valorDefecto="RUC" />
              <CampoInput nombre="numeroIdFiscal" etiqueta="Nro ID Fiscal" marcador="Ingrese id fiscal" />
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_1fr_1fr]">
              <CampoInput nombre="fechaNacimiento" etiqueta="Fecha de Nacimiento" marcador="mm/dd/yyyy" tipo="date" />
              <CampoSelect nombre="estadoCivil" etiqueta="Estado Civil" opciones={opcionesEstadoCivil} valorDefecto="Soltero/a" />
              <CampoSelect nombre="profesion" etiqueta="Profesión" opciones={opcionesProfesion} marcadorVacio="Seleccione profesión" />
            </div>

            <CampoArea
              nombre="referenciaAdicional"
              etiqueta="Referencia Adicional"
              marcador="Ingrese notas o referencias adicionales pertinentes para este registro..."
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
            <CustomButton type="button" variant="secondary" size="sm" onClick={onCerrar}>
              Cancelar
            </CustomButton>
            <CustomButton type="submit" size="sm">
              Guardar
            </CustomButton>
          </div>
        </form>
      </div>
    </div>
  );
}

function CampoInput({
  nombre,
  etiqueta,
  marcador,
  tipo = "text",
}: {
  nombre: string;
  etiqueta: string;
  marcador: string;
  tipo?: "text" | "date";
}) {
  return (
    <label className="space-y-2">
      <CustomLabel className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8ea0c0]">{etiqueta}</CustomLabel>
      <input
        name={nombre}
        type={tipo}
        placeholder={marcador}
        className="h-11 w-full rounded-lg border border-[#dbe4f0] bg-white px-4 text-sm text-slate-700 outline-none"
      />
    </label>
  );
}

function CampoSelect({
  nombre,
  etiqueta,
  opciones,
  valorDefecto,
  marcadorVacio = "Seleccione",
}: {
  nombre: string;
  etiqueta: string;
  opciones: string[];
  valorDefecto?: string;
  marcadorVacio?: string;
}) {
  return (
    <label className="space-y-2">
      <CustomLabel className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8ea0c0]">{etiqueta}</CustomLabel>
      <select
        name={nombre}
        defaultValue={valorDefecto ?? ""}
        className="h-11 w-full rounded-lg border border-[#dbe4f0] bg-white px-4 text-sm text-slate-700 outline-none"
      >
        {!valorDefecto ? <option value="">{marcadorVacio}</option> : null}
        {opciones.map((opcion) => (
          <option key={opcion} value={opcion}>
            {opcion}
          </option>
        ))}
      </select>
    </label>
  );
}

function CampoArea({
  nombre,
  etiqueta,
  marcador,
}: {
  nombre: string;
  etiqueta: string;
  marcador: string;
}) {
  return (
    <label className="space-y-2">
      <CustomLabel className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8ea0c0]">{etiqueta}</CustomLabel>
      <textarea
        name={nombre}
        rows={5}
        placeholder={marcador}
        className="w-full rounded-lg border border-[#dbe4f0] bg-white px-4 py-3 text-sm text-slate-700 outline-none"
      />
    </label>
  );
}
