import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
import type { RegistroPersonaDirectorioAnalista } from "@maximilian/shared/types/investigacion.type";

interface PropsCustomModalBuscarEjecutivoAnalista {
  estaAbierto: boolean;
  registros: RegistroPersonaDirectorioAnalista[];
  onCerrar: () => void;
  onSeleccionar: (registro: RegistroPersonaDirectorioAnalista) => void;
  onAgregarEmpresaPersona: () => void;
}

const opcionesTipoPersona = ["Natural", "Jurídica"];
const opcionesPais = ["México", "Perú", "Colombia", "Estados Unidos", "Chile"];

function crearOpcion(num1: number, string1: string) {
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

const opcionesTipoPersonaSelector = opcionesTipoPersona.map((opcion, indice) => crearOpcion(indice + 1, opcion));
const opcionesPaisSelector = opcionesPais.map((opcion, indice) => crearOpcion(indice + 1, opcion));

export function CustomModalBuscarEjecutivoAnalista({
  estaAbierto,
  registros,
  onCerrar,
  onSeleccionar,
  onAgregarEmpresaPersona,
}: PropsCustomModalBuscarEjecutivoAnalista) {
  const [tipoPersona, setTipoPersona] = useState("Natural");
  const [pais, setPais] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [busquedaActiva, setBusquedaActiva] = useState("");

  const resultados = useMemo(() => {
    const termino = busquedaActiva.trim().toLowerCase();

    return registros.filter((registro) => {
      const coincideTipo = !tipoPersona || registro.tipoPersona === tipoPersona;
      const coincidePais = !pais || registro.pais === pais;
      const coincideDescripcion =
        !termino ||
        registro.nombres.toLowerCase().includes(termino) ||
        registro.numeroDocumentoIdentidad.toLowerCase().includes(termino) ||
        registro.numeroIdFiscal.toLowerCase().includes(termino);

      return coincideTipo && coincidePais && coincideDescripcion;
    });
  }, [busquedaActiva, pais, registros, tipoPersona]);

  if (!estaAbierto) return null;

  return (
    <div className="fixed inset-0 z-[97] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-5xl flex-col overflow-hidden rounded-[22px] bg-white shadow-2xl">
        <div className="flex items-start justify-between px-6 py-5">
          <div>
            <h2 className="text-[18px] font-bold text-slate-800">Buscar Ejecutivo</h2>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#9aa8bd]">
              Búsqueda de ejecutivos
            </p>
          </div>
          <CustomButton variant="ghost" size="icon" onClick={onCerrar}>
            <X size={18} className="text-[#c2cad8]" />
          </CustomButton>
        </div>

        <div className="space-y-4 px-6 pb-6">
          <div className="grid gap-4 md:grid-cols-2">
            <CustomSelectorBuscable
              label="Tipo Persona"
              options={opcionesTipoPersonaSelector}
              value={opcionesTipoPersonaSelector.find((opcion) => opcion.string1 === tipoPersona)?.num1 ?? undefined}
              displayValue={tipoPersona}
              onChange={(valor) => setTipoPersona(opcionesTipoPersonaSelector.find((opcion) => opcion.num1 === valor)?.string1 ?? "")}
              onClear={() => setTipoPersona("")}
              optional
              mostrarTextoOpcionalEnLabel={false}
              placeholder="Seleccione tipo persona"
            />
            <CustomSelectorBuscable
              label="País"
              options={opcionesPaisSelector}
              value={opcionesPaisSelector.find((opcion) => opcion.string1 === pais)?.num1 ?? undefined}
              displayValue={pais}
              onChange={(valor) => setPais(opcionesPaisSelector.find((opcion) => opcion.num1 === valor)?.string1 ?? "")}
              onClear={() => setPais("")}
              optional
              mostrarTextoOpcionalEnLabel={false}
              placeholder="Seleccione un país"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <label className="space-y-2">
              <CustomLabel className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8ea0c0]">Descripción</CustomLabel>
              <input
                value={descripcion}
                onChange={(event) => setDescripcion(event.target.value)}
                placeholder="Buscar por Nombre, Documento, ID Fiscal"
                className="h-11 w-full rounded-lg border border-[#dbe4f0] px-4 text-sm text-slate-700 outline-none"
              />
            </label>
            <div className="flex items-end">
              <CustomButton
                type="button"
                size="sm"
                className="h-11 rounded-lg px-5"
                onClick={() => setBusquedaActiva(descripcion)}
              >
                <Search size={14} />
                Buscar
              </CustomButton>
            </div>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#2764ff] transition-colors hover:text-[#1d4ed8]"
            onClick={onAgregarEmpresaPersona}
          >
            Agregar Empresa o Persona
          </button>

          <div className="overflow-hidden rounded-xl border border-[#e6eef7]">
            <div className="max-h-[340px] overflow-y-auto bg-white">
              {resultados.length === 0 ? (
                <div className="flex h-[190px] items-center justify-center text-sm text-[#a3afc2]">
                  TOTAL REGISTROS
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8ea0c0]">
                    <tr>
                      <th className="px-4 py-3">Nombre</th>
                      <th className="px-4 py-3">País</th>
                      <th className="px-4 py-3">Documento</th>
                      <th className="px-4 py-3">ID Fiscal</th>
                      <th className="px-4 py-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {resultados.map((registro) => (
                      <tr key={registro.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm font-semibold text-slate-700">{registro.nombres}</td>
                        <td className="px-4 py-3 text-sm text-slate-500">{registro.pais}</td>
                        <td className="px-4 py-3 text-sm text-slate-500">{registro.numeroDocumentoIdentidad}</td>
                        <td className="px-4 py-3 text-sm text-slate-500">{registro.numeroIdFiscal}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end">
                            <CustomButton type="button" variant="secondary" size="sm" onClick={() => onSeleccionar(registro)}>
                              Seleccionar
                            </CustomButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 px-6 py-4">
          <CustomButton type="button" variant="secondary" size="sm" onClick={onCerrar}>
            Cancelar
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
