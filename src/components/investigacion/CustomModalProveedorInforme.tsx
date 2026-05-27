import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
import { SelectorMaestroConAltaInvestigacionAnalista } from "@maximilian/components/investigacion/ControlesInforme";
import { servicioTablaMaestra } from "@maximilian/services/tablaMaestra.service";
import type { RegistroProveedorAnalista } from "@maximilian/shared/types/investigacion.type";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";

interface PropsCustomModalProveedorAnalista {
  estaAbierto: boolean;
  registroInicial?: RegistroProveedorAnalista | null;
  onCerrar: () => void;
  onGuardar: (registro: RegistroProveedorAnalista) => void;
}

const opcionesLimiteCredito = ["Sin límite operativo", "Limitado", "Sujeto a evaluación"];

export function CustomModalProveedorAnalista({
  estaAbierto,
  registroInicial,
  onCerrar,
  onGuardar,
}: PropsCustomModalProveedorAnalista) {
  const [tipoProveedor, setTipoProveedor] = useState(registroInicial?.tipoProveedor ?? "");
  const [nombreEmpresa, setNombreEmpresa] = useState(registroInicial?.nombreEmpresa ?? "");
  const [pais, setPais] = useState(registroInicial?.pais ?? "");
  const [taxIdType, setTaxIdType] = useState(registroInicial?.taxIdType ?? "");
  const [taxIdNumber, setTaxIdNumber] = useState(registroInicial?.taxIdNumber ?? "");
  const [contacto, setContacto] = useState(registroInicial?.contacto ?? "");
  const [telefono, setTelefono] = useState(registroInicial?.telefono ?? "");
  const [tieneReferenciaComercial, setTieneReferenciaComercial] = useState(registroInicial?.tieneReferenciaComercial ?? false);
  const [comienzoNegociaciones, setComienzoNegociaciones] = useState(registroInicial?.comienzoNegociaciones ?? "");
  const [operacionCambioMoneda, setOperacionCambioMoneda] = useState(registroInicial?.operacionCambioMoneda ?? "");
  const [tipoCambio, setTipoCambio] = useState(registroInicial?.tipoCambio ?? "");
  const [limiteCredito, setLimiteCredito] = useState(registroInicial?.limiteCredito ?? "");
  const [promedioMensual, setPromedioMensual] = useState(registroInicial?.promedioMensual ?? "");
  const { data: opcionesTipoProveedor } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.TIPO_PROVEEDOR],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.TIPO_PROVEEDOR),
    staleTime: Infinity,
  });
  const { data: opcionesPais } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.PAIS],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.PAIS),
    staleTime: Infinity,
  });
  const { data: opcionesTaxId } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.TIPO_REG_TRIBUTARIO],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.TIPO_REG_TRIBUTARIO),
    staleTime: Infinity,
  });
  const { data: opcionesMoneda } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.MONEDA],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.MONEDA),
    staleTime: Infinity,
  });

  if (!estaAbierto) return null;

  const manejarGuardar = () => {
    if (!tipoProveedor || !nombreEmpresa.trim() || !pais || !taxIdType || !taxIdNumber.trim()) {
      return;
    }

    onGuardar({
      nombreEmpresa: nombreEmpresa.trim(),
      contacto: contacto.trim(),
      tipoProveedor,
      telefono: telefono.trim(),
      tipoPersona: registroInicial?.tipoPersona ?? "Juridica",
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
          <SelectorMaestroConAltaInvestigacionAnalista
            etiqueta="Tipo de Proveedor"
            valor={tipoProveedor}
            soloLectura={false}
            opcionesTablaMaestra={opcionesTipoProveedor}
            idMaestro={TablaMaestraId.TIPO_PROVEEDOR}
            permiteAltaNueva
            marcador="Seleccione tipo de proveedor"
            onChange={setTipoProveedor}
          />

          <div className="space-y-2">
            <CustomLabel>Nombre de la Empresa / Compañía</CustomLabel>
            <input value={nombreEmpresa} onChange={(event) => setNombreEmpresa(event.target.value)} placeholder="Ej. Schneider Electric SA de CV" className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <CustomLabel>País</CustomLabel>
              <CustomSelectorBuscable
                options={opcionesPais}
                value={opcionesPais?.find((opcion) => opcion.string1 === pais)?.num1 ?? undefined}
                onChange={(valor) => setPais(opcionesPais?.find((opcion) => opcion.num1 === valor)?.string1 ?? "")}
                onClear={() => setPais("")}
                optional
                mostrarTextoOpcionalEnLabel={false}
                placeholder="Seleccionar país..."
              />
            </div>

            <div className="space-y-2">
              <CustomLabel>Tax ID Type</CustomLabel>
              <CustomSelectorBuscable
                options={opcionesTaxId}
                value={opcionesTaxId?.find((opcion) => opcion.string1 === taxIdType)?.num1 ?? undefined}
                onChange={(valor) => setTaxIdType(opcionesTaxId?.find((opcion) => opcion.num1 === valor)?.string1 ?? "")}
                onClear={() => setTaxIdType("")}
                optional
                mostrarTextoOpcionalEnLabel={false}
                placeholder="Seleccionar tipo..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <CustomLabel>Tax ID Number</CustomLabel>
            <input value={taxIdNumber} onChange={(event) => setTaxIdNumber(event.target.value)} placeholder="Ingrese número de identificación fiscal..." className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none" />
          </div>

          <div className="space-y-2">
            <CustomLabel>Nombre de Contacto</CustomLabel>
            <input value={contacto} onChange={(event) => setContacto(event.target.value)} placeholder="Ingrese el nombre de contacto" className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none" />
          </div>

          <div className="space-y-2">
            <CustomLabel>Teléfono</CustomLabel>
            <input value={telefono} onChange={(event) => setTelefono(event.target.value)} placeholder="Ingrese el teléfono" className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none" />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-slate-600">
            <span>Tiene referencia comercial</span>
            <button
              type="button"
              role="switch"
              aria-checked={tieneReferenciaComercial}
              aria-label="Tiene referencia comercial"
              onClick={() => setTieneReferenciaComercial((valorActual) => !valorActual)}
              className={`relative h-6 w-16 rounded-full text-[10px] font-bold uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-brand-black/20 ${
                tieneReferenciaComercial ? "bg-brand-black" : "bg-slate-200"
              }`}
            >
              <span className={`absolute inset-y-0 flex items-center transition-all ${tieneReferenciaComercial ? "left-3 text-white" : "right-3 text-slate-500"}`}>
                {tieneReferenciaComercial ? "Sí" : "No"}
              </span>
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                  tieneReferenciaComercial ? "translate-x-10 left-0.5" : "left-0.5 translate-x-0"
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
                  <CustomSelectorBuscable
                    options={opcionesMoneda}
                    value={opcionesMoneda?.find((opcion) => opcion.string1 === operacionCambioMoneda)?.num1 ?? undefined}
                    onChange={(valor) => setOperacionCambioMoneda(opcionesMoneda?.find((opcion) => opcion.num1 === valor)?.string1 ?? "")}
                    onClear={() => setOperacionCambioMoneda("")}
                    optional
                    mostrarTextoOpcionalEnLabel={false}
                    placeholder="Divisa"
                  />
                  <input value={tipoCambio} onChange={(event) => setTipoCambio(event.target.value)} placeholder="$ 0.00" className="h-11 rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none" />
                </div>
              </div>

              <SelectorMaestroConAltaInvestigacionAnalista
                etiqueta="Límite de Crédito"
                valor={limiteCredito}
                soloLectura={false}
                opcionesIniciales={opcionesLimiteCredito}
                marcador="Seleccione o agregue límite de crédito"
                onChange={setLimiteCredito}
              />

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
