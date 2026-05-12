import { useState } from "react";
import { Search, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import type { RegistroBancoAnalista, ResultadoBusquedaBancoAnalista } from "@maximilian/shared/types/investigacion.type";

interface PropsCustomModalBancoAnalista {
  estaAbierto: boolean;
  registroInicial?: RegistroBancoAnalista | null;
  resultadosBusqueda: ResultadoBusquedaBancoAnalista[];
  onCerrar: () => void;
  onAgregarNuevoBanco: () => void;
  onGuardar: (registro: RegistroBancoAnalista) => void;
}

interface PropsCustomModalBusquedaBancoAnalista {
  estaAbierto: boolean;
  resultados: ResultadoBusquedaBancoAnalista[];
  onCerrar: () => void;
  onSeleccionar: (resultado: ResultadoBusquedaBancoAnalista) => void;
  onAgregarNuevoBanco: () => void;
}

function CustomModalBusquedaBancoAnalista({
  estaAbierto,
  resultados,
  onCerrar,
  onSeleccionar,
  onAgregarNuevoBanco,
}: PropsCustomModalBusquedaBancoAnalista) {
  const [indiceSeleccionado, setIndiceSeleccionado] = useState<number | null>(0);
  const [tipoPersona, setTipoPersona] = useState("Jurídica");
  const [pais, setPais] = useState("México");
  const [criterio, setCriterio] = useState("Razón Social/Nombres");
  const [descripcion, setDescripcion] = useState("BBVA MEXICO SA");

  if (!estaAbierto) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-8 py-6">
          <div>
            <h2 className="text-2xl font-bold text-brand-black">Resultados de Búsqueda de Banco</h2>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8ea0c0]">Registro de bancos</p>
          </div>
          <CustomButton variant="ghost" size="icon" onClick={onCerrar}>
            <X size={18} className="text-[#8ea0c0]" />
          </CustomButton>
        </div>

        <div className="space-y-5 overflow-y-auto px-8 py-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <CustomLabel>Tipo Persona</CustomLabel>
              <select value={tipoPersona} onChange={(event) => setTipoPersona(event.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-slate-50 px-4 text-sm text-slate-600 outline-none">
                <option>Jurídica</option>
                <option>Natural</option>
              </select>
            </div>
            <div className="space-y-2">
              <CustomLabel>País</CustomLabel>
              <select value={pais} onChange={(event) => setPais(event.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-slate-50 px-4 text-sm text-slate-600 outline-none">
                <option>México</option>
                <option>Perú</option>
              </select>
            </div>
            <div className="space-y-2">
              <CustomLabel>Criterio</CustomLabel>
              <select value={criterio} onChange={(event) => setCriterio(event.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-slate-50 px-4 text-sm text-slate-600 outline-none">
                <option>Razón Social/Nombres</option>
              </select>
            </div>
            <div className="space-y-2">
              <CustomLabel>Descripción</CustomLabel>
              <input value={descripcion} onChange={(event) => setDescripcion(event.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-slate-50 px-4 text-sm text-slate-600 outline-none" />
            </div>
          </div>

          <button
            type="button"
            onClick={onAgregarNuevoBanco}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#2764ff] transition-colors hover:text-[#1d4ed8]"
          >
            Agregar nuevo banco
          </button>

          <div className="overflow-hidden rounded-2xl border border-gray-100">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300">
                <tr>
                  <th className="px-4 py-3">Nombres</th>
                  <th className="px-4 py-3">Tipo.Doc.</th>
                  <th className="px-4 py-3">País</th>
                  <th className="px-4 py-3">Teléfono</th>
                  <th className="px-4 py-3">Existe.Inf?</th>
                  <th className="px-4 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {resultados.map((resultado, indice) => (
                  <tr
                    key={`${resultado.nombres}-${indice}`}
                    className={`cursor-pointer ${indiceSeleccionado === indice ? "bg-brand-wine/5" : "hover:bg-slate-50"}`}
                    onClick={() => setIndiceSeleccionado(indice)}
                  >
                    <td className="px-4 py-4 text-sm text-slate-600">{resultado.nombres}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{resultado.tipoDocumento}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{resultado.pais}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{resultado.telefono}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{resultado.existeInforme}</td>
                    <td className="px-4 py-4 text-right text-sm font-semibold text-blue-600">Editar</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 px-8 py-5">
          <CustomButton variant="secondary" size="sm" onClick={onCerrar}>Cancelar</CustomButton>
          <CustomButton size="sm" onClick={() => indiceSeleccionado != null && onSeleccionar(resultados[indiceSeleccionado])}>Guardar</CustomButton>
        </div>
      </div>
    </div>
  );
}

export function CustomModalBancoAnalista({
  estaAbierto,
  registroInicial,
  resultadosBusqueda,
  onCerrar,
  onAgregarNuevoBanco,
  onGuardar,
}: PropsCustomModalBancoAnalista) {
  const [banco, setBanco] = useState(registroInicial?.banco ?? "");
  const [sector, setSector] = useState(registroInicial?.sector ?? "");
  const [telefono, setTelefono] = useState(registroInicial?.telefono ?? "");
  const [numeroCuenta, setNumeroCuenta] = useState(registroInicial?.numeroCuenta ?? "");
  const [sectoristaJefeCuenta, setSectoristaJefeCuenta] = useState(registroInicial?.sectoristaJefeCuenta ?? "");
  const [estaAbiertoModalBusqueda, setEstaAbiertoModalBusqueda] = useState(false);

  if (!estaAbierto) return null;

  const manejarGuardar = () => {
    if (!banco.trim() || !sector.trim() || !telefono.trim() || !numeroCuenta.trim()) {
      return;
    }

    onGuardar({
      banco: banco.trim(),
      sector: sector.trim(),
      telefono: telefono.trim(),
      numeroCuenta: numeroCuenta.trim(),
      sectoristaJefeCuenta: sectoristaJefeCuenta.trim(),
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
        <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-7 py-6">
            <div>
              <h2 className="text-2xl font-bold text-brand-black">{registroInicial ? "Editar Banco" : "Agregar Banco"}</h2>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8ea0c0]">Registro de bancos</p>
            </div>
            <CustomButton variant="ghost" size="icon" onClick={onCerrar}>
              <X size={18} className="text-[#8ea0c0]" />
            </CustomButton>
          </div>

          <div className="space-y-4 overflow-y-auto px-7 py-6">
            <div className="space-y-2">
              <CustomLabel>Bancos</CustomLabel>
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_120px]">
                <input value={banco} onChange={(event) => setBanco(event.target.value)} placeholder="Nombre del banco" className="h-11 rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none" />
                <CustomButton size="sm" className="bg-[#ff6a2b] hover:bg-[#ff6a2b]/90" onClick={() => setEstaAbiertoModalBusqueda(true)}>
                  <Search size={14} />
                  Buscar
                </CustomButton>
              </div>
            </div>

            <div className="space-y-2">
              <CustomLabel>Número de Cuenta</CustomLabel>
              <input value={numeroCuenta} onChange={(event) => setNumeroCuenta(event.target.value)} placeholder="0000 0000 0000" className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none" />
            </div>

            <div className="space-y-2">
              <CustomLabel>Lista de Sectores</CustomLabel>
              <input value={sector} onChange={(event) => setSector(event.target.value)} placeholder="Ingrese el sector" className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none" />
            </div>

            <div className="space-y-2">
              <CustomLabel>Sectorista / Jefe de Cuenta</CustomLabel>
              <input value={sectoristaJefeCuenta} onChange={(event) => setSectoristaJefeCuenta(event.target.value)} placeholder="Nombre del sectorista o jefe de cuenta" className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none" />
            </div>

            <div className="space-y-2">
              <CustomLabel>Numero(s) de Teléfono</CustomLabel>
              <input value={telefono} onChange={(event) => setTelefono(event.target.value)} placeholder="+52 ..." className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none" />
            </div>

            {sector ? (
              <p className="text-xs text-slate-400">{sector}</p>
            ) : null}
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 px-7 py-5">
            <CustomButton variant="secondary" size="sm" onClick={onCerrar}>Cancelar</CustomButton>
            <CustomButton size="sm" onClick={manejarGuardar}>Guardar</CustomButton>
          </div>
        </div>
      </div>

      <CustomModalBusquedaBancoAnalista
        estaAbierto={estaAbiertoModalBusqueda}
        resultados={resultadosBusqueda}
        onCerrar={() => setEstaAbiertoModalBusqueda(false)}
        onAgregarNuevoBanco={() => {
          setEstaAbiertoModalBusqueda(false);
          onAgregarNuevoBanco();
        }}
        onSeleccionar={(resultado) => {
          setBanco(resultado.nombres);
          setTelefono(resultado.telefono);
          setEstaAbiertoModalBusqueda(false);
        }}
      />
    </>
  );
}
