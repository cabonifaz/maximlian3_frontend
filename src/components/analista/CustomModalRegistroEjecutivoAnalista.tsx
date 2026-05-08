import { Search, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import type {
  RegistroDirectorioEjecutivoAnalista,
  RegistroPersonaDirectorioAnalista,
} from "@maximilian/shared/types/analista.type";

interface PropsCustomModalRegistroEjecutivoAnalista {
  estaAbierto: boolean;
  registroInicial?: RegistroDirectorioEjecutivoAnalista | null;
  personaSeleccionada?: RegistroPersonaDirectorioAnalista | null;
  onCerrar: () => void;
  onBuscarEjecutivo: () => void;
  onGuardar: (registro: Omit<RegistroDirectorioEjecutivoAnalista, "id">) => void;
}

export function CustomModalRegistroEjecutivoAnalista({
  estaAbierto,
  registroInicial,
  personaSeleccionada,
  onCerrar,
  onBuscarEjecutivo,
  onGuardar,
}: PropsCustomModalRegistroEjecutivoAnalista) {
  if (!estaAbierto) return null;

  const ejecutivoDefecto = registroInicial?.nombreCompleto ?? personaSeleccionada?.nombres ?? "";
  const tipoPersonaDefecto = registroInicial?.tipoPersona ?? personaSeleccionada?.tipoPersona ?? "Natural";
  const paisDefecto = registroInicial?.pais ?? personaSeleccionada?.pais ?? "";

  const manejarEnvio = (formData: FormData) => {
    const ejecutivo = String(formData.get("ejecutivo") ?? "").trim();
    const cargo = String(formData.get("cargo") ?? "").trim();

    if (!ejecutivo || !cargo) return;

    const porcentaje = String(formData.get("porcentaje") ?? "").trim();
    const imprimirListado = formData.get("imprimirListado") === "si";
    const imprimirDetalle = formData.get("imprimirDetalle") === "si";
    const esParteDirectorio = formData.get("esParteDirectorio") === "si";

    onGuardar({
      ejecutivo: ejecutivo.length > 13 ? `${ejecutivo.slice(0, 13)}...` : ejecutivo,
      cargo: cargo.length > 10 ? `${cargo.slice(0, 10)}...` : cargo,
      porcentaje: porcentaje || "0.00%",
      lista: imprimirListado,
      detalleEjecutivo: imprimirDetalle,
      orden: registroInicial?.orden ?? "1",
      vinculadoDesde: String(formData.get("vinculadoDesde") ?? "").trim(),
      companiaAnterior: String(formData.get("companiaAnterior") ?? "").trim(),
      esParteDirectorio,
      pais: paisDefecto,
      tipoPersona: tipoPersonaDefecto,
      descripcionBusqueda: ejecutivo,
      nombreCompleto: ejecutivo,
    });
  };

  return (
    <div className="fixed inset-0 z-[96] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-[22px] bg-white shadow-2xl">
        <div className="flex items-start justify-between px-6 py-5">
          <div>
            <h2 className="text-[18px] font-bold text-slate-800">Agregar Ejecutivo</h2>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#9aa8bd]">
              Registro de ejecutivos
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
          <div className="space-y-6 overflow-y-auto px-6 py-5">
            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <label className="space-y-2">
                <CustomLabel className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8ea0c0]">Ejecutivo</CustomLabel>
                <input
                  name="ejecutivo"
                  defaultValue={ejecutivoDefecto}
                  placeholder="Nombre completo del ejecutivo"
                  className="h-11 w-full rounded-lg border border-[#dbe4f0] px-4 text-sm text-slate-700 outline-none"
                />
              </label>
              <div className="flex items-end">
                <CustomButton type="button" size="sm" className="h-11 rounded-lg bg-[#eb5b53] px-5 hover:bg-[#dd5249]" onClick={onBuscarEjecutivo}>
                  <Search size={14} />
                  Buscar
                </CustomButton>
              </div>
            </div>

            <div className="pt-1">
              <CampoInput nombre="cargo" etiqueta="Cargo" marcador="Cargo o posición" valorDefecto={registroInicial?.cargo.replace("...", "")} />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <CampoInput nombre="vinculadoDesde" etiqueta="Vinculado Desde" marcador="Fecha o período" valorDefecto={registroInicial?.vinculadoDesde} />
              <CampoInput nombre="companiaAnterior" etiqueta="Compañía Anterior" marcador="Empresa previa" valorDefecto={registroInicial?.companiaAnterior} />
            </div>

            <div className="pt-1">
              <CampoInput nombre="porcentaje" etiqueta="% Participación" marcador="0.00%" valorDefecto={registroInicial?.porcentaje === "-" ? "" : registroInicial?.porcentaje} />
            </div>

            <div className="space-y-4 pt-5">
              <GrupoRadio nombre="esParteDirectorio" etiqueta="¿Es parte del Directorio?" valorDefecto={registroInicial?.esParteDirectorio ? "si" : "no"} />
              <GrupoRadio nombre="imprimirListado" etiqueta="¿Se imprime en el listado de ejecutivos?" valorDefecto={registroInicial?.lista ? "si" : "no"} />
              <GrupoRadio nombre="imprimirDetalle" etiqueta="¿Imprime los detalles del ejecutivo?" valorDefecto={registroInicial?.detalleEjecutivo ? "si" : "no"} />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
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
  valorDefecto,
}: {
  nombre: string;
  etiqueta: string;
  marcador: string;
  valorDefecto?: string;
}) {
  return (
    <label className="space-y-2">
      <CustomLabel className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8ea0c0]">{etiqueta}</CustomLabel>
      <input
        name={nombre}
        defaultValue={valorDefecto}
        placeholder={marcador}
        className="h-11 w-full rounded-lg border border-[#dbe4f0] px-4 text-sm text-slate-700 outline-none"
      />
    </label>
  );
}

function GrupoRadio({
  nombre,
  etiqueta,
  valorDefecto = "si",
}: {
  nombre: string;
  etiqueta: string;
  valorDefecto?: "si" | "no";
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <CustomLabel as="p" className="text-sm font-medium text-slate-700">{etiqueta}</CustomLabel>
      <div className="flex items-center gap-5">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="radio" name={nombre} value="si" defaultChecked={valorDefecto === "si"} className="h-4 w-4 accent-slate-900" />
          Sí
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-500">
          <input type="radio" name={nombre} value="no" defaultChecked={valorDefecto === "no"} className="h-4 w-4 accent-slate-900" />
          No
        </label>
      </div>
    </div>
  );
}
