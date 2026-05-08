import { useState } from "react";
import { X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import type { RegistroProveedorAnalista } from "@maximilian/shared/types/analista.type";

interface PropsCustomModalProveedorAnalista {
  estaAbierto: boolean;
  registroInicial?: RegistroProveedorAnalista | null;
  onCerrar: () => void;
  onGuardar: (registro: RegistroProveedorAnalista) => void;
}

const opcionesTipoPersona = ["Jurídica", "Natural"];
const opcionesPais = ["México", "Perú", "Colombia", "Estados Unidos", "Reino Unido"];
const opcionesTaxId = ["RFC", "NIT", "Tax ID"];
const opcionesMoneda = ["Divisa", "US Dollar", "Euro"];
const opcionesLimiteCredito = ["Sin límite operativo", "Limitado", "Sujeto a evaluación"];

export function CustomModalProveedorAnalista({
  estaAbierto,
  registroInicial,
  onCerrar,
  onGuardar,
}: PropsCustomModalProveedorAnalista) {
  const [tipoPersona, setTipoPersona] = useState(registroInicial?.tipoPersona ?? "");
  const [nombreEmpresa, setNombreEmpresa] = useState(registroInicial?.nombreEmpresa ?? "");
  const [pais, setPais] = useState(registroInicial?.pais ?? "");
  const [taxIdType, setTaxIdType] = useState(registroInicial?.taxIdType ?? "");
  const [taxIdNumber, setTaxIdNumber] = useState(registroInicial?.taxIdNumber ?? "");
  const [tieneReferenciaComercial, setTieneReferenciaComercial] = useState(registroInicial?.tieneReferenciaComercial ?? false);
  const [comienzoNegociaciones, setComienzoNegociaciones] = useState(registroInicial?.comienzoNegociaciones ?? "");
  const [operacionCambioMoneda, setOperacionCambioMoneda] = useState(registroInicial?.operacionCambioMoneda ?? "");
  const [tipoCambio, setTipoCambio] = useState(registroInicial?.tipoCambio ?? "");
  const [limiteCredito, setLimiteCredito] = useState(registroInicial?.limiteCredito ?? "");
  const [promedioMensual, setPromedioMensual] = useState(registroInicial?.promedioMensual ?? "");

  if (!estaAbierto) return null;

  const manejarGuardar = () => {
    if (!tipoPersona || !nombreEmpresa.trim() || !pais || !taxIdType || !taxIdNumber.trim()) {
      return;
    }

    onGuardar({
      nombreEmpresa: nombreEmpresa.trim(),
      contacto: registroInicial?.contacto ?? "",
      tipoProveedor: pais === "México" ? "Nacional" : "Extranjero",
      telefono: registroInicial?.telefono ?? "",
      tipoPersona,
      pais,
      taxIdType,
      taxIdNumber: taxIdNumber.trim(),
      tieneReferenciaComercial,
      comienzoNegociaciones: tieneReferenciaComercial ? comienzoNegociaciones.trim() : "",
      operacionCambioMoneda: tieneReferenciaComercial ? operacionCambioMoneda : "",
      tipoCambio: tieneReferenciaComercial ? tipoCambio.trim() : "",
      limiteCredito: tieneReferenciaComercial ? limiteCredito : "",
      promedioMensual: tieneReferenciaComercial ? promedioMensual.trim() : "",
    });
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-7 py-6">
          <div>
            <h2 className="text-2xl font-bold text-brand-black">{registroInicial ? "Editar Proveedor" : "Agregar Nuevo Proveedor"}</h2>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8ea0c0]">Registro de terceros</p>
          </div>
          <CustomButton variant="ghost" size="icon" onClick={onCerrar}>
            <X size={18} className="text-[#8ea0c0]" />
          </CustomButton>
        </div>

        <div className="space-y-4 overflow-y-auto px-7 py-6">
          <div className="space-y-2">
            <CustomLabel>Tipo de Persona</CustomLabel>
            <select value={tipoPersona} onChange={(event) => setTipoPersona(event.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-slate-600 outline-none">
              <option value="">Seleccionar...</option>
              {opcionesTipoPersona.map((opcion) => <option key={opcion} value={opcion}>{opcion}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <CustomLabel>Nombre de la Empresa / Compañía</CustomLabel>
            <input value={nombreEmpresa} onChange={(event) => setNombreEmpresa(event.target.value)} placeholder="Ej. Schneider Electric SA de CV" className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <CustomLabel>País</CustomLabel>
              <select value={pais} onChange={(event) => setPais(event.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-slate-600 outline-none">
                <option value="">Seleccionar país...</option>
                {opcionesPais.map((opcion) => <option key={opcion} value={opcion}>{opcion}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <CustomLabel>Tax ID Type</CustomLabel>
              <select value={taxIdType} onChange={(event) => setTaxIdType(event.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-slate-600 outline-none">
                <option value="">Seleccionar tipo...</option>
                {opcionesTaxId.map((opcion) => <option key={opcion} value={opcion}>{opcion}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <CustomLabel>Tax ID Number</CustomLabel>
            <input value={taxIdNumber} onChange={(event) => setTaxIdNumber(event.target.value)} placeholder="Ingrese número de identificación fiscal..." className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none" />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-slate-600">
            <span>Tiene referencia comercial</span>
            <button
              type="button"
              role="switch"
              aria-checked={tieneReferenciaComercial}
              aria-label="Tiene referencia comercial"
              onClick={() => setTieneReferenciaComercial((valorActual) => !valorActual)}
              className={`relative h-6 w-11 rounded-full text-[10px] font-bold uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-brand-black/20 ${
                tieneReferenciaComercial ? "bg-brand-black" : "bg-slate-200"
              }`}
            >
              <span className={`absolute inset-y-0 flex items-center transition-all ${tieneReferenciaComercial ? "left-2 text-white" : "right-2 text-slate-500"}`}>
                {tieneReferenciaComercial ? "Sí" : "No"}
              </span>
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                  tieneReferenciaComercial ? "translate-x-5 left-0.5" : "left-0.5 translate-x-0"
                }`}
              />
            </button>
          </div>

          {tieneReferenciaComercial ? (
            <>
              <div className="space-y-2">
                <CustomLabel>Comienzo de las Negociaciones</CustomLabel>
                <input value={comienzoNegociaciones} onChange={(event) => setComienzoNegociaciones(event.target.value)} placeholder="Desde hace varios años" className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none" />
              </div>

              <div className="space-y-2">
                <CustomLabel>Operaciones de Cambio de Moneda</CustomLabel>
                <div className="grid gap-3 md:grid-cols-[140px_minmax(0,1fr)]">
                  <select value={operacionCambioMoneda} onChange={(event) => setOperacionCambioMoneda(event.target.value)} className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm text-slate-600 outline-none">
                    <option value="">Divisa</option>
                    {opcionesMoneda.map((opcion) => <option key={opcion} value={opcion}>{opcion}</option>)}
                  </select>
                  <input value={tipoCambio} onChange={(event) => setTipoCambio(event.target.value)} placeholder="$ 0.00" className="h-11 rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none" />
                </div>
              </div>

              <div className="space-y-2">
                <CustomLabel>Límite de Crédito</CustomLabel>
                <select value={limiteCredito} onChange={(event) => setLimiteCredito(event.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-slate-600 outline-none">
                  <option value="">Seleccione...</option>
                  {opcionesLimiteCredito.map((opcion) => <option key={opcion} value={opcion}>{opcion}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <CustomLabel>Promedio Mensual</CustomLabel>
                <input value={promedioMensual} onChange={(event) => setPromedioMensual(event.target.value)} placeholder="Ingrese el promedio mensual" className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none" />
              </div>
            </>
          ) : null}
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 px-7 py-5">
          <CustomButton variant="secondary" size="sm" onClick={onCerrar}>Cancelar</CustomButton>
          <CustomButton size="sm" onClick={manejarGuardar}>Guardar</CustomButton>
        </div>
      </div>
    </div>
  );
}
