import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { SelectorMaestroConAltaInvestigacionAnalista } from "@maximilian/components/investigacion/ControlesInforme";
import { servicioTablaMaestra } from "@maximilian/services/tablaMaestra.service";
import type {
  RegistroDirectorioEjecutivoAnalista,
  RegistroPersonaDirectorioAnalista,
} from "@maximilian/shared/types/investigacion.type";
import { seleccionarTextoEditableEnContenedor } from "@maximilian/shared/utils/formato-monto.util";

const ID_MAESTRO_CARGO_DIRECTORIO = 14;

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
  const ejecutivoDefecto = registroInicial?.nombreCompleto ?? personaSeleccionada?.nombres ?? "";
  const tipoPersonaDefecto = registroInicial?.tipoPersona ?? personaSeleccionada?.tipoPersona ?? "Natural";
  const paisDefecto = registroInicial?.pais ?? personaSeleccionada?.pais ?? "";
  const vinculadoDesdeDefecto = convertirFechaParaInput(registroInicial?.vinculadoDesde ?? "");
  const cargoDefecto = registroInicial?.idCargo ? "" : limpiarTextoCargo(registroInicial?.cargo ?? "");
  const [cargo, setCargo] = useState(cargoDefecto);
  const [porcentajeParticipacion, setPorcentajeParticipacion] = useState(
    limpiarPorcentaje(registroInicial?.porcentaje),
  );
  const { data: opcionesCargo } = useQuery({
    queryKey: ["masterTable", ID_MAESTRO_CARGO_DIRECTORIO],
    queryFn: () => servicioTablaMaestra.list(ID_MAESTRO_CARGO_DIRECTORIO),
    enabled: estaAbierto,
    staleTime: Infinity,
  });

  const cargoMaestroRegistro = opcionesCargo?.find((opcion) => opcion.num1 === registroInicial?.idCargo)?.string1?.trim() ?? "";
  const cargoActual = cargo || cargoMaestroRegistro || cargoDefecto;

  if (!estaAbierto) return null;

  const manejarEnvio = (formData: FormData) => {
    const ejecutivo = String(formData.get("ejecutivo") ?? "").trim();
    const idCargo = obtenerIdCargo(opcionesCargo, cargoActual) || registroInicial?.idCargo || 0;

    const porcentaje = formatearPorcentajeParticipacion(porcentajeParticipacion);
    const imprimirListado = formData.get("imprimirListado") === "si";
    const imprimirDetalle = formData.get("imprimirDetalle") === "si";
    const esParteDirectorio = formData.get("esParteDirectorio") === "si";

    onGuardar({
      idDirectorioEjecutivo: registroInicial?.idDirectorioEjecutivo ?? personaSeleccionada?.idDirectorioEjecutivo ?? personaSeleccionada?.id,
      ejecutivo: ejecutivo.length > 13 ? `${ejecutivo.slice(0, 13)}...` : ejecutivo,
      idCargo,
      cargo: cargoActual,
      porcentaje,
      lista: imprimirListado,
      detalleEjecutivo: imprimirDetalle,
      orden: registroInicial?.orden ?? "1",
      vinculadoDesde: formatearFechaParaGuardar(String(formData.get("vinculadoDesde") ?? "").trim()),
      companiaAnterior: String(formData.get("companiaAnterior") ?? "").trim(),
      esParteDirectorio,
      pais: paisDefecto,
      tipoPersona: tipoPersonaDefecto,
      descripcionBusqueda: ejecutivo,
      nombreCompleto: ejecutivo,
    });
  };

  return (
    <div className="fixed inset-0 z-[96] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm" onFocusCapture={seleccionarTextoEditableEnContenedor}>
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
              <SelectorMaestroConAltaInvestigacionAnalista
                etiqueta="Cargo"
                valor={cargoActual}
                soloLectura={false}
                opcionesTablaMaestra={opcionesCargo}
                idMaestro={ID_MAESTRO_CARGO_DIRECTORIO}
                marcador="Seleccione o agregue cargo"
                onChange={setCargo}
                permiteAltaNueva
                conservarOpcionesLocales={false}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <CampoInput nombre="vinculadoDesde" etiqueta="Vinculado Desde" marcador="Seleccionar fecha" valorInicial={vinculadoDesdeDefecto} tipo="date" />
              <CampoInput nombre="companiaAnterior" etiqueta="Compañía Anterior" marcador="Empresa previa" valorInicial={registroInicial?.companiaAnterior} />
            </div>

            <div className="pt-1">
              <CampoInput
                nombre="porcentaje"
                etiqueta="% Participación"
                marcador="0.00000000"
                valor={porcentajeParticipacion}
                onChange={(valor) => setPorcentajeParticipacion(sanitizarPorcentajeParticipacion(valor))}
                onBlur={() => setPorcentajeParticipacion(limpiarPorcentaje(formatearPorcentajeParticipacion(porcentajeParticipacion)))}
              />
            </div>

            <div className="space-y-4 pt-5">
              <GrupoRadio nombre="esParteDirectorio" etiqueta="¿Forma parte del directorio Ejecutivo?" valorDefecto={registroInicial?.esParteDirectorio ? "si" : "no"} />
              <GrupoRadio nombre="imprimirListado" etiqueta="¿Figura en el listado de ejecutivos?" valorDefecto={registroInicial?.lista ? "si" : "no"} />
              <GrupoRadio nombre="imprimirDetalle" etiqueta="¿Se tiene los detalles del Ejecutivo?" valorDefecto={registroInicial?.detalleEjecutivo ? "si" : "no"} />
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

function limpiarTextoCargo(valor: string) {
  return valor.replace("...", "").trim();
}

function obtenerIdCargo(opciones: { num1: number | null; string1: string | null }[] | undefined, valor: string) {
  return opciones?.find((opcion) => opcion.string1?.trim().toLowerCase() === valor.trim().toLowerCase())?.num1 ?? 0;
}

function CampoInput({
  nombre,
  etiqueta,
  marcador,
  valorInicial,
  valor,
  onChange,
  onBlur,
  tipo = "text",
}: {
  nombre: string;
  etiqueta: string;
  marcador: string;
  valorInicial?: string;
  valor?: string;
  onChange?: (valor: string) => void;
  onBlur?: () => void;
  tipo?: "text" | "date";
}) {
  if (valor !== undefined) {
    return (
      <label className="space-y-2">
        <CustomLabel className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8ea0c0]">{etiqueta}</CustomLabel>
        <input
          name={nombre}
          type={tipo}
          value={valor}
          onChange={(event) => onChange?.(event.target.value)}
          onBlur={onBlur}
          placeholder={marcador}
          className="h-11 w-full rounded-lg border border-[#dbe4f0] px-4 text-sm text-slate-700 outline-none"
        />
      </label>
    );
  }

  return (
    <label className="space-y-2">
      <CustomLabel className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8ea0c0]">{etiqueta}</CustomLabel>
      <input
        name={nombre}
        type={tipo}
        defaultValue={valorInicial}
        placeholder={marcador}
        className="h-11 w-full rounded-lg border border-[#dbe4f0] px-4 text-sm text-slate-700 outline-none"
      />
    </label>
  );
}

function limpiarPorcentaje(valor?: string) {
  return (valor ?? "").replace("%", "").trim();
}

function sanitizarPorcentajeParticipacion(valor: string) {
  const valorNormalizado = limpiarPorcentaje(valor).replace(",", ".").replace(/[^0-9.]/g, "");
  const partes = valorNormalizado.split(".");
  const entero = partes[0] ?? "";
  const decimal = partes[1] ?? "";
  const valorCompuesto = partes.length > 1 ? `${entero}.${decimal.slice(0, 8)}` : entero;

  if (!valorCompuesto) return "";

  if (entero && Number.parseInt(entero, 10) > 100) {
    return "100";
  }

  if (valorCompuesto === "100" || valorCompuesto.startsWith("100.")) {
    return "100";
  }

  return valorCompuesto;
}

function formatearPorcentajeParticipacion(valor: string) {
  const valorLimpio = limpiarPorcentaje(valor).replace(",", ".");
  if (!valorLimpio) return "0.00000000%";

  const numero = Number.parseFloat(valorLimpio);
  if (Number.isNaN(numero)) return "0.00000000%";

  return `${numero.toFixed(8)}%`;
}

function convertirFechaParaInput(valor: string) {
  if (!valor) return "";
  if (valor.includes("-")) return valor;
  if (!valor.includes("/")) return "";

  const [dia, mes, ano] = valor.split("/");
  if (!dia || !mes || !ano) return "";

  return `${ano}-${mes}-${dia}`;
}

function formatearFechaParaGuardar(valor: string) {
  if (!valor) return "";
  if (!valor.includes("-")) return valor;

  const [ano, mes, dia] = valor.split("-");
  if (!ano || !mes || !dia) return valor;

  return `${dia}/${mes}/${ano}`;
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
