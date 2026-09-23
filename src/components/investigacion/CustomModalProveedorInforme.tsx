import { X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";

import { SelectorMaestroConAltaInvestigacionAnalista } from "@maximilian/components/investigacion/ControlesInforme";
import { useModalProveedorInforme } from "@maximilian/hooks/useModalProveedorInforme";
import type { RegistroProveedorAnalista } from "@maximilian/shared/types/investigacion.type";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import {
  normalizarMontoDosDecimales,
  normalizarMontoDecimales,
  sanitizarMontoDosDecimales,
  sanitizarMontoDecimales,
  seleccionarTextoEditableEnContenedor,
  seleccionarTextoCampoEditable,
} from "@maximilian/shared/utils/formato-monto.util";

interface PropsCustomModalProveedorAnalista {
  estaAbierto: boolean;
  registroInicial?: RegistroProveedorAnalista | null;
  idIdioma?: number;
  onCerrar: () => void;
  onGuardar: (registro: RegistroProveedorAnalista) => void;
}

export function CustomModalProveedorAnalista({
  estaAbierto,
  registroInicial,
  idIdioma,
  onCerrar,
  onGuardar,
}: PropsCustomModalProveedorAnalista) {
  const {
    tipoProveedor,
    setTipoProveedor,
    nombreEmpresa,
    setNombreEmpresa,
    pais,
    setPais,
    taxIdType,
    setTaxIdType,
    taxIdNumber,
    setTaxIdNumber,
    contacto,
    setContacto,
    telefono,
    setTelefono,
    tieneReferenciaComercial,
    setTieneReferenciaComercial,
    comienzoNegociaciones,
    setComienzoNegociaciones,
    operacionCambioMoneda,
    setOperacionCambioMoneda,
    tipoCambio,
    setTipoCambio,
    limiteCredito,
    setLimiteCredito,
    promedioMensual,
    setPromedioMensual,
    plazoCredito,
    setPlazoCredito,
    setIdTiempoCreditoSeleccionado,
    idCalificacion,
    setIdCalificacion,
    comentarios,
    setComentarios,
    opcionesTipoProveedor,
    opcionesPais,
    opcionesTaxId,
    opcionesMoneda,
    opcionesLimiteCredito,
    promedioMensualHabilitado,
    opcionesPlazoCredito,
    opcionesCalificacion,
    manejarGuardar,
  } = useModalProveedorInforme({ registroInicial, idIdioma, onGuardar });

  if (!estaAbierto) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm" onFocusCapture={seleccionarTextoEditableEnContenedor}>
      <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5 md:px-8">
          <div>
            <h2 className="text-[18px] font-bold text-slate-800">{registroInicial ? "Editar Proveedor" : "Agregar Nuevo Proveedor"}</h2>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8ea0c0]">Registro de terceros</p>
          </div>
          <CustomButton variant="ghost" size="icon" onClick={onCerrar}>
            <X size={18} className="text-[#8ea0c0]" />
          </CustomButton>
        </div>

        <div className="grid gap-5 overflow-y-auto px-6 py-5 md:grid-cols-2 md:px-8 md:py-7">
          <div className="md:col-span-2 md:max-w-[calc(50%-0.625rem)]">
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
          </div>

          <div className="space-y-2">
            <CustomLabel>Nombre de la Empresa / Compañía</CustomLabel>
            <input value={nombreEmpresa} onChange={(event) => setNombreEmpresa(event.target.value)} onFocus={seleccionarTextoCampoEditable} placeholder="Ej. Schneider Electric SA de CV" className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none" />
          </div>

          <div className="contents">
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
              <CustomLabel>Tipo de ID Fiscal</CustomLabel>
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
            <CustomLabel>Número de ID Fiscal</CustomLabel>
            <input value={taxIdNumber} onChange={(event) => setTaxIdNumber(event.target.value)} onFocus={seleccionarTextoCampoEditable} placeholder="Ingrese número de identificación fiscal..." className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none" />
          </div>

          <div className="space-y-2">
            <CustomLabel>Nombre de Contacto</CustomLabel>
            <input value={contacto} onChange={(event) => setContacto(event.target.value)} onFocus={seleccionarTextoCampoEditable} placeholder="Ingrese el nombre de contacto" className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none" />
          </div>

          <div className="space-y-2">
            <CustomLabel>Teléfono</CustomLabel>
            <input value={telefono} onChange={(event) => setTelefono(event.target.value)} onFocus={seleccionarTextoCampoEditable} placeholder="Ingrese el teléfono" className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none" />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-medium text-slate-600 md:col-span-2">
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
              <div className="border-t border-slate-100 pt-5 md:col-span-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8ea0c0]">Condiciones comerciales</p>
                <p className="mt-1 text-sm text-slate-500">Informacion de la relacion y condiciones de credito.</p>
              </div>
              <div className="space-y-2">
                <CustomLabel>Comienzo de las Negociaciones</CustomLabel>
                <input value={comienzoNegociaciones} onChange={(event) => setComienzoNegociaciones(event.target.value)} onFocus={seleccionarTextoCampoEditable} placeholder="Ingrese el comienzo de las negociaciones" className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none" />
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
                  <input value={tipoCambio} onChange={(event) => setTipoCambio(sanitizarMontoDecimales(event.target.value, 6))} onBlur={(event) => setTipoCambio(normalizarMontoDecimales(event.target.value, 6))} onFocus={seleccionarTextoCampoEditable} placeholder="0.000000" className="h-11 rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none" />
                </div>
              </div>

              <SelectorMaestroConAltaInvestigacionAnalista
                etiqueta="Límite de Crédito"
                valor={limiteCredito}
                soloLectura={false}
                opcionesTablaMaestra={opcionesLimiteCredito}
                idMaestro={TablaMaestraId.LIMITE_CREDITO_PROVEEDOR}
                permiteAltaNueva
                marcador="Seleccione o agregue límite de crédito"
                onChange={setLimiteCredito}
              />

              <div className="space-y-2">
                <CustomLabel>Promedio Mensual</CustomLabel>
                <input value={promedioMensual} onChange={(event) => setPromedioMensual(sanitizarMontoDosDecimales(event.target.value))} onBlur={(event) => setPromedioMensual(normalizarMontoDosDecimales(event.target.value))} onFocus={seleccionarTextoCampoEditable} disabled={!promedioMensualHabilitado} placeholder="Ingrese el promedio mensual" className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400" />
              </div>

              <SelectorMaestroConAltaInvestigacionAnalista
                etiqueta="Plazo"
                valor={plazoCredito}
                soloLectura={false}
                opcionesTablaMaestra={opcionesPlazoCredito}
                idMaestro={TablaMaestraId.PLAZO_CREDITO_PROVEEDOR}
                permiteAltaNueva
                marcador="Seleccione o agregue plazo"
                onChange={setPlazoCredito}
                onSeleccionar={setIdTiempoCreditoSeleccionado}
              />
              <div className="space-y-2">
                <CustomLabel optional>Calificación</CustomLabel>
                <CustomSelectorBuscable
                  options={opcionesCalificacion}
                  value={idCalificacion}
                  onChange={setIdCalificacion}
                  onClear={() => setIdCalificacion(undefined)}
                  optional
                  mostrarTextoOpcionalEnLabel={false}
                  placeholder="Seleccionar calificación..."
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <CustomLabel optional>Comentarios</CustomLabel>
                <textarea value={comentarios} onChange={(event) => setComentarios(event.target.value)} onFocus={seleccionarTextoCampoEditable} placeholder="Ingrese comentarios" className="min-h-24 w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm text-slate-600 outline-none" />
              </div>
            </>
          ) : null}
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-5 md:px-8">
          <CustomButton variant="secondary" size="sm" onClick={onCerrar}>Cancelar</CustomButton>
          <CustomButton size="sm" onClick={manejarGuardar}>Guardar</CustomButton>
        </div>
      </div>
    </div>
  );
}
