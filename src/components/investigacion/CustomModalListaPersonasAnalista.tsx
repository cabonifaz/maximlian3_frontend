import { useMemo, useState } from "react";
import { Pencil, Plus, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
import type { EmpresaRelacionadaAnalista } from "@maximilian/shared/types/investigacion.type";
import type { EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";
import {
  CustomModalRegistroEmpresaRelacionadaAnalista,
  type RegistroPersonaAnalista,
} from "./CustomModalRegistroEmpresaRelacionadaAnalista";

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

interface PropsCustomModalListaPersonasAnalista {
  estaAbierto: boolean;
  opcionesTipoPersona?: EntradaTablaMaestra[];
  opcionesPais?: EntradaTablaMaestra[];
  onCerrar: () => void;
  onGuardar: (empresa: EmpresaRelacionadaAnalista) => void;
}

const registrosIniciales: RegistroPersonaAnalista[] = [
  {
    id: 1,
    tipoPersona: "Jurídica",
    nombres: "ALICORP SAA",
    tipoDocumento: "RUC - 20100055237",
    pais: "Perú",
    telefono: "(511) 315-0800",
    existeInformacion: true,
  },
];

const opcionesCriterio: EntradaTablaMaestra[] = [
  crearOpcionTablaMaestra(1, "Nombre / Razón Social"),
  crearOpcionTablaMaestra(2, "Teléfono"),
];

export function CustomModalListaPersonasAnalista({
  estaAbierto,
  opcionesTipoPersona,
  opcionesPais,
  onCerrar,
  onGuardar,
}: PropsCustomModalListaPersonasAnalista) {
  const [registros, setRegistros] = useState<RegistroPersonaAnalista[]>(registrosIniciales);
  const [registroEdicion, setRegistroEdicion] = useState<RegistroPersonaAnalista | null>(null);
  const [estaAbiertoModalRegistro, setEstaAbiertoModalRegistro] = useState(false);
  const [idTipoPersona, setIdTipoPersona] = useState<number | undefined>(undefined);
  const [idPais, setIdPais] = useState<number | undefined>(undefined);
  const [idCriterio, setIdCriterio] = useState<number>(1);
  const [descripcion, setDescripcion] = useState("");
  const [idRegistroSeleccionado, setIdRegistroSeleccionado] = useState<number | null>(registrosIniciales[0]?.id ?? null);
  const [busquedaAplicada, setBusquedaAplicada] = useState("");

  const tipoPersonaFiltro = opcionesTipoPersona?.find((opcion) => opcion.num1 === idTipoPersona)?.string1;
  const paisFiltro = opcionesPais?.find((opcion) => opcion.num1 === idPais)?.string1;
  const criterioFiltro = opcionesCriterio.find((opcion) => opcion.num1 === idCriterio)?.string1 ?? "";

  const registrosFiltrados = useMemo(() => {
    return registros.filter((registro) => {
      const coincideTipoPersona = !tipoPersonaFiltro || registro.tipoPersona === tipoPersonaFiltro;
      const coincidePais = !paisFiltro || registro.pais === paisFiltro;
      const termino = busquedaAplicada.trim().toLowerCase();

      if (!termino) {
        return coincideTipoPersona && coincidePais;
      }

      const campoBusqueda =
        criterioFiltro === "Teléfono" ? registro.telefono.toLowerCase() : registro.nombres.toLowerCase();

      return coincideTipoPersona && coincidePais && campoBusqueda.includes(termino);
    });
  }, [busquedaAplicada, criterioFiltro, paisFiltro, registros, tipoPersonaFiltro]);

  if (!estaAbierto) return null;

  const manejarGuardarRegistro = (registro: RegistroPersonaAnalista) => {
    setRegistros((anteriores) => {
      const existe = anteriores.some((item) => item.id === registro.id);
      if (existe) {
        return anteriores.map((item) => (item.id === registro.id ? registro : item));
      }
      return [registro, ...anteriores];
    });
    setIdRegistroSeleccionado(registro.id);
    setRegistroEdicion(null);
    setEstaAbiertoModalRegistro(false);
  };

  const manejarGuardarCompania = () => {
    const registroSeleccionado = registros.find((registro) => registro.id === idRegistroSeleccionado);
    if (!registroSeleccionado) return;

    onGuardar({
      empresa: registroSeleccionado.nombres,
      idFiscal: registroSeleccionado.tipoDocumento,
      pais: registroSeleccionado.pais,
    });
    onCerrar();
  };

  return (
    <>
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
        <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-8 py-6">
            <h2 className="text-xl font-bold text-brand-black">Lista de Personas</h2>
            <CustomButton variant="ghost" size="icon" onClick={onCerrar}>
              <X size={20} className="text-[#8ea0c0]" />
            </CustomButton>
          </div>

          <div className="space-y-7 px-8 py-7">
            <div className="grid gap-5 md:grid-cols-3">
              <CustomSelectorBuscable
                label="Tipo Persona"
                options={opcionesTipoPersona}
                value={idTipoPersona}
                onChange={setIdTipoPersona}
                placeholder="Seleccione tipo persona"
              />
              <CustomSelectorBuscable
                label="País"
                options={opcionesPais}
                value={idPais}
                onChange={setIdPais}
                placeholder="Seleccione un país"
              />
              <CustomSelectorBuscable
                label="Criterio"
                options={opcionesCriterio}
                value={idCriterio}
                onChange={setIdCriterio}
                displayValue="Nombre / Razón Social"
                placeholder="Seleccione criterio"
              />
            </div>

            <div className="space-y-3">
              <CustomLabel>Descripción</CustomLabel>
              <div className="flex flex-col gap-3 md:flex-row">
                <input
                  value={descripcion}
                  onChange={(event) => setDescripcion(event.target.value)}
                  className="h-12 flex-1 rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none transition-all focus:border-brand-black focus:ring-2 focus:ring-brand-black/5"
                />
                <CustomButton
                  size="sm"
                  className="min-w-32"
                  onClick={() => setBusquedaAplicada(descripcion)}
                >
                  Buscar
                </CustomButton>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRegistroEdicion(null);
                  setEstaAbiertoModalRegistro(true);
                }}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#2764ff] transition-colors hover:text-[#1d4ed8]"
              >
                <Plus size={14} />
                Agregar Empresa o Persona
              </button>
            </div>

            <div className="overflow-hidden rounded-3xl border border-gray-100">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.16em] text-[#9aa9c2]">
                  <tr>
                    <th className="px-5 py-4">Nombres</th>
                    <th className="px-5 py-4">Tipo Doc.</th>
                    <th className="px-5 py-4">País</th>
                    <th className="px-5 py-4">Teléfono</th>
                    <th className="px-5 py-4">Existe Inf.</th>
                    <th className="px-5 py-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {registrosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-400">
                        No se encontraron registros.
                      </td>
                    </tr>
                  ) : (
                    registrosFiltrados.map((registro) => {
                      const estaSeleccionado = idRegistroSeleccionado === registro.id;
                      return (
                        <tr
                          key={registro.id}
                          className={`cursor-pointer transition-colors ${estaSeleccionado ? "bg-brand-wine/5" : "hover:bg-slate-50"}`}
                          onClick={() => setIdRegistroSeleccionado(registro.id)}
                        >
                          <td className="px-5 py-5 text-sm font-bold text-brand-black">{registro.nombres}</td>
                          <td className="px-5 py-5">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                              {registro.tipoDocumento}
                            </span>
                          </td>
                          <td className="px-5 py-5 text-sm text-slate-600">{registro.pais}</td>
                          <td className="px-5 py-5 text-sm text-slate-600">{registro.telefono}</td>
                          <td className="px-5 py-5">
                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${registro.existeInformacion ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-400"}`}>
                              {registro.existeInformacion ? "Sí" : "No"}
                            </span>
                          </td>
                          <td className="px-5 py-5 text-center">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                setRegistroEdicion(registro);
                                setEstaAbiertoModalRegistro(true);
                              }}
                              className="inline-flex text-[#2764ff] transition-colors hover:text-[#1d4ed8]"
                            >
                              <Pencil size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-8 py-5">
            <CustomButton variant="secondary" size="sm" onClick={onCerrar}>
              Cancelar
            </CustomButton>
            <CustomButton size="sm" onClick={manejarGuardarCompania} disabled={idRegistroSeleccionado == null}>
              Guardar
            </CustomButton>
          </div>
        </div>
      </div>

      <CustomModalRegistroEmpresaRelacionadaAnalista
        key={`${registroEdicion?.id ?? "nuevo"}-${estaAbiertoModalRegistro ? "abierto" : "cerrado"}`}
        estaAbierto={estaAbiertoModalRegistro}
        opcionesTipoPersona={opcionesTipoPersona}
        opcionesPais={opcionesPais}
        registroInicial={registroEdicion}
        onCerrar={() => {
          setRegistroEdicion(null);
          setEstaAbiertoModalRegistro(false);
        }}
        onGuardar={manejarGuardarRegistro}
      />
    </>
  );
}
