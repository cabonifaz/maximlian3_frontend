import { Building2, Phone, UserRound, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
import { useModalRegistroEmpresaRelacionada } from "@maximilian/hooks/useModalRegistroEmpresaRelacionada";
import type { EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";
import { seleccionarTextoEditableEnContenedor } from "@maximilian/shared/utils/formato-monto.util";

export interface RegistroPersonaAnalista {
  id: number;
  tipoPersona: string;
  nombres: string;
  tipoDocumento: string;
  pais: string;
  telefono: string;
  existeInformacion: boolean;
  textoExisteInformacion?: string;
  idCompania?: number;
  idTipoPersona?: number;
  idTipoDocumento?: number;
  idPais?: number;
  direccion?: string;
  ubigeo?: string;
  codigoPostal?: string;
  numeroDocumento?: string;
}

interface PropsCustomModalRegistroEmpresaRelacionadaAnalista {
  estaAbierto: boolean;
  opcionesTipoPersona?: EntradaTablaMaestra[];
  opcionesPais?: EntradaTablaMaestra[];
  idIdioma?: number;
  registroInicial?: RegistroPersonaAnalista | null;
  tipoCreacion?: "compania" | "directorioEjecutivo";
  soloEdicionLocal?: boolean;
  onCerrar: () => void;
  onGuardar: (registro: RegistroPersonaAnalista) => void;
}

export function CustomModalRegistroEmpresaRelacionadaAnalista({
  estaAbierto,
  opcionesTipoPersona,
  opcionesPais,
  idIdioma,
  registroInicial,
  tipoCreacion = "directorioEjecutivo",
  soloEdicionLocal = false,
  onCerrar,
  onGuardar,
}: PropsCustomModalRegistroEmpresaRelacionadaAnalista) {
  const {
    ciudadProvinciaEstado,
    codigoPostal,
    direccion,
    existeInformacion,
    guardarCompaniaMutation,
    idPais,
    idTipoDocumento,
    idTipoPersona,
    nombreCompleto,
    numeroDocumento,
    opcionesTipoDocumento,
    setCiudadProvinciaEstado,
    setCodigoPostal,
    setDireccion,
    setExisteInformacion,
    setIdPais,
    setIdTipoDocumento,
    setIdTipoPersona,
    setNombreCompleto,
    setNumeroDocumento,
    setTelefono,
    telefono,
  } = useModalRegistroEmpresaRelacionada({
    estaAbierto,
    idIdioma,
    onCerrar,
    onGuardar,
    opcionesPais,
    opcionesTipoPersona,
    registroInicial,
    soloEdicionLocal,
    tipoCreacion,
  });

  if (!estaAbierto) return null;

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onFocusCapture={seleccionarTextoEditableEnContenedor}
    >
      <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.25)]">
        <div className="border-b border-slate-100 bg-[linear-gradient(135deg,#fff_0%,#f8fafc_100%)] px-6 py-6 md:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8ea0c0]">
                Base de datos de compañías
              </p>
              <h2 className="mt-2 text-[22px] font-bold text-slate-900">
                {registroInicial
                  ? "Editar Empresa o Persona"
                  : "Nueva Empresa o Persona"}
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Registre la empresa relacionada para reutilizarla en futuras
                investigaciones y mantener consistencia en la base de datos.
              </p>
            </div>
            <CustomButton
              variant="ghost"
              size="icon"
              onClick={onCerrar}
              disabled={guardarCompaniaMutation.isPending}
            >
              <X size={18} className="text-[#c2cad8]" />
            </CustomButton>
          </div>
        </div>

        <div className="grid gap-5 overflow-y-auto bg-slate-50/35 px-6 py-6 md:grid-cols-2 md:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                <UserRound size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Identificacion
                </p>
                <p className="text-xs text-slate-400">
                  Datos base de la entidad
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <CustomSelectorBuscable
                label="Tipo de Persona"
                options={opcionesTipoPersona}
                value={idTipoPersona}
                onChange={setIdTipoPersona}
                onClear={() => setIdTipoPersona(undefined)}
                placeholder="Seleccione tipo persona"
              />
              <CustomSelectorBuscable
                label="Tipo de Documento"
                options={opcionesTipoDocumento}
                value={idTipoDocumento}
                displayValue={registroInicial?.tipoDocumento.split(" - ")[0]}
                onChange={setIdTipoDocumento}
                onClear={() => setIdTipoDocumento(undefined)}
                placeholder="Seleccione tipo documento"
              />
              <div className="space-y-2">
                <CustomLabel>Numero de Documento</CustomLabel>
                <input
                  value={numeroDocumento}
                  onChange={(event) => setNumeroDocumento(event.target.value)}
                  placeholder="Ingrese el numero de documento"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-brand-black focus:ring-2 focus:ring-brand-black/5"
                />
              </div>
              <div className="space-y-2">
                <CustomLabel>Nombre Completo / Razon Social</CustomLabel>
                <input
                  value={nombreCompleto}
                  onChange={(event) => setNombreCompleto(event.target.value)}
                  placeholder="Ingrese el nombre completo o razon social"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-brand-black focus:ring-2 focus:ring-brand-black/5"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                <Building2 size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Ubicacion y contacto
                </p>
                <p className="text-xs text-slate-400">
                  Informacion complementaria para busqueda
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <CustomSelectorBuscable
                label="Pais"
                options={opcionesPais}
                value={idPais}
                onChange={setIdPais}
                onClear={() => setIdPais(undefined)}
                placeholder="Seleccione un pais"
              />
              <div className="space-y-2">
                <CustomLabel>Direccion</CustomLabel>
                <input
                  value={direccion}
                  onChange={(event) => setDireccion(event.target.value)}
                  placeholder="Ingrese la direccion"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-brand-black focus:ring-2 focus:ring-brand-black/5"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-[1fr_0.75fr]">
                <div className="space-y-2">
                  <CustomLabel>Ciudad / Provincia / Estado</CustomLabel>
                  <input
                    value={ciudadProvinciaEstado}
                    onChange={(event) =>
                      setCiudadProvinciaEstado(event.target.value)
                    }
                    placeholder="Ingrese ciudad, provincia o estado"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-brand-black focus:ring-2 focus:ring-brand-black/5"
                  />
                </div>
                <div className="space-y-2">
                  <CustomLabel>Codigo Postal</CustomLabel>
                  <input
                    value={codigoPostal}
                    onChange={(event) => setCodigoPostal(event.target.value)}
                    placeholder="Ingrese codigo postal"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-all focus:border-brand-black focus:ring-2 focus:ring-brand-black/5"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <CustomLabel>Telefono</CustomLabel>
                <div className="relative">
                  <Phone
                    size={15}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                  />
                  <input
                    value={telefono}
                    onChange={(event) => setTelefono(event.target.value)}
                    placeholder="Ingrese el telefono"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-brand-black focus:ring-2 focus:ring-brand-black/5"
                  />
                </div>
              </div>
              <label className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-600">
                <input
                  type="checkbox"
                  checked={existeInformacion}
                  onChange={(event) => setExisteInformacion(event.target.checked)}
                  className="h-4 w-4 accent-brand-wine"
                />
                Existe informacion disponible
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 bg-white px-6 py-5 md:px-8">
          <CustomButton
            variant="secondary"
            size="sm"
            onClick={onCerrar}
            disabled={guardarCompaniaMutation.isPending}
          >
            Cancelar
          </CustomButton>
          <CustomButton
            size="sm"
            onClick={() => guardarCompaniaMutation.mutate()}
            loading={guardarCompaniaMutation.isPending}
            loadingText="Guardando..."
          >
            Guardar
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
