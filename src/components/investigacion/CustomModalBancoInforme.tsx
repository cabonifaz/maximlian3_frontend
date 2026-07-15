import { Landmark, Loader2, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { CustomModalConfirmacionAccion } from "@maximilian/components/common/CustomModalConfirmacionAccion";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
import { useModalBancoInforme } from "@maximilian/hooks/useModalBancoInforme";
import { useModalBusquedaBancoInforme } from "@maximilian/hooks/useModalBusquedaBancoInforme";
import { useModalCrearBancoInforme } from "@maximilian/hooks/useModalCrearBancoInforme";
import type { BancoListaItem } from "@maximilian/shared/types/banco.type";
import type { RegistroBancoAnalista } from "@maximilian/shared/types/investigacion.type";
import {
  seleccionarTextoCampoEditable,
  seleccionarTextoEditableEnContenedor,
} from "@maximilian/shared/utils/formato-monto.util";

interface PropsCustomModalBancoAnalista {
  estaAbierto: boolean;
  registroInicial?: RegistroBancoAnalista | null;
  idIdioma?: number;
  onCerrar: () => void;
  onGuardar: (registro: RegistroBancoAnalista) => void;
}

interface PropsCustomModalBusquedaBancoAnalista {
  estaAbierto: boolean;
  idIdioma?: number;
  onCerrar: () => void;
  onSeleccionar: (banco: BancoListaItem) => void;
}

interface PropsCustomModalCrearBancoAnalista {
  estaAbierto: boolean;
  bancoInicial?: BancoListaItem | null;
  idIdioma?: number;
  onCerrar: () => void;
  onBancoCreado: (banco: BancoListaItem) => void;
}

export function CustomModalCrearBancoAnalista({
  estaAbierto,
  bancoInicial,
  idIdioma,
  onCerrar,
  onBancoCreado,
}: PropsCustomModalCrearBancoAnalista) {
  const {
    formularioInvalido,
    guardarBancoMutation,
    idPais,
    nombre,
    opcionesPais,
    setIdPais,
    setNombre,
    setTelefono,
    telefono,
  } = useModalCrearBancoInforme({
    bancoInicial,
    estaAbierto,
    idIdioma,
    onBancoCreado,
    onCerrar,
  });

  if (!estaAbierto) return null;

  return (
    <div className="fixed inset-0 z-[115] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onFocusCapture={seleccionarTextoEditableEnContenedor}>
      <div className="flex w-full max-w-3xl flex-col overflow-hidden rounded-[30px] bg-white shadow-[0_40px_100px_rgba(15,23,42,0.22)]">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 bg-[radial-gradient(circle_at_top_left,rgba(130,21,51,0.10),transparent_36%),linear-gradient(180deg,#ffffff,#f8fafc)] px-6 py-6 md:px-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-wine/10 text-brand-wine">
              <Landmark size={22} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8ea0c0]">
                {bancoInicial ? "Actualizacion en base de datos" : "Registro en base de datos"}
              </p>
              <h2 className="mt-1 text-2xl font-bold text-brand-black">{bancoInicial ? "Editar Banco" : "Nuevo Banco"}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {bancoInicial ? "Actualice la informacion del banco seleccionado." : "Complete los datos principales para registrar el banco."}
              </p>
            </div>
          </div>
          <CustomButton variant="ghost" size="icon" onClick={onCerrar} disabled={guardarBancoMutation.isPending}>
            <X size={18} className="text-[#8ea0c0]" />
          </CustomButton>
        </div>

        <div className="bg-slate-50/50 px-6 py-6 md:px-8">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <p className="text-sm font-bold text-brand-black">Datos del banco</p>
              <p className="mt-1 text-xs text-slate-400">Pais, nombre comercial y telefono de contacto.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_1.25fr_1fr]">
              <CustomSelectorBuscable
                label="Pais"
                options={opcionesPais}
                value={idPais}
                onChange={setIdPais}
                onClear={() => setIdPais(undefined)}
                required
                placeholder="Seleccione un pais"
              />

              <div className="space-y-2">
                <CustomLabel required>Nombre del Banco</CustomLabel>
                <input
                  value={nombre}
                  onChange={(event) => setNombre(event.target.value)}
                  onFocus={seleccionarTextoCampoEditable}
                  placeholder="Ingrese el nombre del banco"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-600 outline-none transition-colors focus:border-brand-black focus:ring-2 focus:ring-brand-black/5"
                />
              </div>

              <div className="space-y-2">
                <CustomLabel required>Telefono</CustomLabel>
                <input
                  value={telefono}
                  onChange={(event) => setTelefono(event.target.value)}
                  onFocus={seleccionarTextoCampoEditable}
                  placeholder="Ingrese el telefono"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-600 outline-none transition-colors focus:border-brand-black focus:ring-2 focus:ring-brand-black/5"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 bg-white px-6 py-5 md:px-8">
          <CustomButton variant="secondary" size="sm" onClick={onCerrar} disabled={guardarBancoMutation.isPending}>
            Cancelar
          </CustomButton>
          <CustomButton
            size="sm"
            onClick={() => guardarBancoMutation.mutate()}
            disabled={formularioInvalido}
            loading={guardarBancoMutation.isPending}
            loadingText="Guardando..."
          >
            Guardar
          </CustomButton>
        </div>
      </div>
    </div>
  );
}

function CustomModalBusquedaBancoAnalista({
  estaAbierto,
  idIdioma,
  onCerrar,
  onSeleccionar,
}: PropsCustomModalBusquedaBancoAnalista) {
  const {
    bancoAEliminar,
    bancoEnEdicion,
    bancoSeleccionado,
    bancos,
    busqueda,
    cerrarModalCrearBanco,
    eliminarBancoMutation,
    estaAbiertoModalCrearBanco,
    idBancoSeleccionado,
    isError,
    isLoading,
    manejarBancoCreado,
    paginaActual,
    prepararEdicionBanco,
    prepararNuevoBanco,
    refetch,
    respuestaBancos,
    setBancoAEliminar,
    setBusqueda,
    setIdBancoSeleccionado,
    setPaginaActual,
  } = useModalBusquedaBancoInforme({ estaAbierto });

  if (!estaAbierto) return null;

  return (
    <>
      <div className="fixed inset-0 z-[105] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
        <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-6xl flex-col overflow-hidden rounded-[30px] bg-white shadow-[0_40px_100px_rgba(15,23,42,0.22)]">
          <div className="flex items-start justify-between gap-4 border-b border-gray-100 bg-[radial-gradient(circle_at_top_left,rgba(130,21,51,0.10),transparent_36%),linear-gradient(180deg,#ffffff,#f8fafc)] px-6 py-6 md:px-8 md:py-7">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-wine/10 text-brand-wine">
                <Landmark size={22} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8ea0c0]">Bancos registrados</p>
                <h2 className="mt-1 text-2xl font-bold text-brand-black">Busqueda de Banco</h2>
                <p className="mt-1 text-sm text-slate-500">Seleccione un banco de la base de datos o registre uno nuevo.</p>
              </div>
            </div>
            <CustomButton variant="ghost" size="icon" onClick={onCerrar}>
              <X size={18} className="text-[#8ea0c0]" />
            </CustomButton>
          </div>

          <div className="space-y-5 overflow-y-auto bg-slate-50/40 px-6 py-6 md:px-8">
            <div className="grid gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:grid-cols-[minmax(0,1fr)_auto]">
              <div className="space-y-2">
                <CustomLabel>Busqueda</CustomLabel>
                <div className="relative">
                  <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    value={busqueda}
                    onChange={(event) => setBusqueda(event.target.value)}
                    onFocus={seleccionarTextoCampoEditable}
                    placeholder="Buscar por nombre del banco..."
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-600 outline-none transition-colors focus:border-brand-black focus:ring-2 focus:ring-brand-black/5"
                  />
                </div>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={prepararNuevoBanco}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-wine px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-wine/90"
                >
                  <Plus size={16} />
                  Nuevo Banco
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.14em] text-[#9aa9c2]">
                  <tr>
                    <th className="px-5 py-4">Banco</th>
                    <th className="px-5 py-4">Pais</th>
                    <th className="px-5 py-4">Telefono</th>
                    <th className="px-5 py-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-12 text-center">
                        <div className="inline-flex items-center gap-2 text-sm text-slate-400">
                          <Loader2 size={16} className="animate-spin" />
                          Cargando bancos...
                        </div>
                      </td>
                    </tr>
                  ) : isError ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-12 text-center">
                        <div className="space-y-3">
                          <p className="text-sm text-red-500">No se pudo cargar la lista de bancos.</p>
                          <CustomButton variant="secondary" size="sm" onClick={() => void refetch()}>
                            Reintentar
                          </CustomButton>
                        </div>
                      </td>
                    </tr>
                  ) : bancos.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-12 text-center text-sm text-slate-400">
                        No se encontraron bancos registrados.
                      </td>
                    </tr>
                  ) : (
                    bancos.map((bancoItem) => {
                      const estaSeleccionado = bancoItem.idBanco === idBancoSeleccionado;

                      return (
                        <tr
                          key={bancoItem.idBanco}
                          className={`cursor-pointer transition-colors ${estaSeleccionado ? "bg-brand-wine/5" : "hover:bg-slate-50"}`}
                          onClick={() => setIdBancoSeleccionado(bancoItem.idBanco)}
                        >
                          <td className="relative px-5 py-4">
                            <span className={`pointer-events-none absolute inset-y-0 left-0 w-[3px] rounded-r-full transition-colors ${estaSeleccionado ? "bg-brand-wine" : ""}`} />
                            <div className="flex items-center gap-3">
                              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${estaSeleccionado ? "bg-brand-wine text-white" : "bg-slate-100 text-slate-400"}`}>
                                <Landmark size={16} />
                              </div>
                              <span className={`text-sm font-semibold ${estaSeleccionado ? "text-brand-wine" : "text-slate-700"}`}>{bancoItem.nombre}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-500">{bancoItem.pais}</td>
                          <td className="px-5 py-4 text-sm text-slate-500">{bancoItem.telefono}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-3 text-sm font-semibold">
                              <button
                                type="button"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  prepararEdicionBanco(bancoItem);
                                }}
                                aria-label="Editar banco"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                type="button"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setBancoAEliminar(bancoItem);
                                }}
                                aria-label="Eliminar banco"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-medium text-slate-400">
                {respuestaBancos?.totalRegistros ?? 0} banco(s) encontrado(s)
              </p>

              <div className="flex items-center gap-2">
                <CustomButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setPaginaActual((pagina) => Math.max(1, pagina - 1))}
                  disabled={paginaActual <= 1 || isLoading}
                >
                  Anterior
                </CustomButton>
                <span className="min-w-28 text-center text-sm font-semibold text-slate-500">
                  Pagina {paginaActual} de {respuestaBancos?.totalPaginas ?? 1}
                </span>
                <CustomButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setPaginaActual((pagina) => pagina + 1)}
                  disabled={isLoading || paginaActual >= (respuestaBancos?.totalPaginas ?? 1)}
                >
                  Siguiente
                </CustomButton>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 bg-white px-6 py-5 md:px-8">
            <CustomButton variant="secondary" size="sm" onClick={onCerrar}>
              Cancelar
            </CustomButton>
            <CustomButton size="sm" onClick={() => bancoSeleccionado && onSeleccionar(bancoSeleccionado)} disabled={!bancoSeleccionado}>
              Seleccionar
            </CustomButton>
          </div>
        </div>
      </div>

      <CustomModalCrearBancoAnalista
        estaAbierto={estaAbiertoModalCrearBanco}
        bancoInicial={bancoEnEdicion}
        idIdioma={idIdioma}
        onCerrar={cerrarModalCrearBanco}
        onBancoCreado={manejarBancoCreado}
      />

      <CustomModalConfirmacionAccion
        isOpen={bancoAEliminar != null}
        onClose={() => setBancoAEliminar(null)}
        onConfirm={() => eliminarBancoMutation.mutate()}
        title="Eliminar Banco"
        descripcion="Se eliminara el banco seleccionado de la base de datos."
        isSubmitting={eliminarBancoMutation.isPending}
        textoConfirmar="Eliminar"
        textoCargandoConfirmar="Eliminando..."
        varianteConfirmar="danger"
      >
        <p><span className="font-bold">Banco:</span> {bancoAEliminar?.nombre ?? "-"}</p>
        <p><span className="font-bold">Pais:</span> {bancoAEliminar?.pais ?? "-"}</p>
      </CustomModalConfirmacionAccion>
    </>
  );
}

export function CustomModalBancoAnalista({
  estaAbierto,
  registroInicial,
  idIdioma,
  onCerrar,
  onGuardar,
}: PropsCustomModalBancoAnalista) {
  const {
    banco,
    estaAbiertoModalBusqueda,
    idSectorSeleccionado,
    limpiarSector,
    manejarCambioSector,
    manejarGuardar,
    numeroCuenta,
    opcionesSector,
    pais,
    sectoristaJefeCuenta,
    seleccionarBanco,
    setBanco,
    setEstaAbiertoModalBusqueda,
    setNumeroCuenta,
    setSectoristaJefeCuenta,
    setTelefono,
    telefono,
  } = useModalBancoInforme({
    estaAbierto,
    idIdioma,
    registroInicial,
    onGuardar,
  });

  if (!estaAbierto) return null;

  return (
    <>
      <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm" onFocusCapture={seleccionarTextoEditableEnContenedor}>
        <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-7 py-6">
            <div>
              <h2 className="text-2xl font-bold text-brand-black">{registroInicial ? "Editar Cuenta Bancaria" : "Agregar Cuenta Bancaria"}</h2>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8ea0c0]">Registro de cuentas bancarias</p>
            </div>
            <CustomButton variant="ghost" size="icon" onClick={onCerrar}>
              <X size={18} className="text-[#8ea0c0]" />
            </CustomButton>
          </div>

          <div className="space-y-4 overflow-y-auto px-7 py-6">
            <div className="space-y-2">
              <CustomLabel>Bancos</CustomLabel>
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_120px]">
                <input
                  value={banco}
                  onChange={(event) => setBanco(event.target.value)}
                  onFocus={seleccionarTextoCampoEditable}
                  placeholder="Nombre del banco"
                  className="h-11 rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none"
                />
                <CustomButton size="sm" className="bg-[#ff6a2b] hover:bg-[#ff6a2b]/90" onClick={() => setEstaAbiertoModalBusqueda(true)}>
                  <Search size={14} />
                  Buscar
                </CustomButton>
              </div>
            </div>

            <div className="space-y-2">
              <CustomLabel>Numero de Cuenta</CustomLabel>
              <input
                value={numeroCuenta}
                onChange={(event) => setNumeroCuenta(event.target.value)}
                onFocus={seleccionarTextoCampoEditable}
                placeholder="0000 0000 0000"
                className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none"
              />
            </div>

            <div className="space-y-2">
              <CustomLabel>Lista de Sectores</CustomLabel>
              <CustomSelectorBuscable
                label={null}
                options={opcionesSector}
                value={idSectorSeleccionado}
                onChange={manejarCambioSector}
                onClear={limpiarSector}
                placeholder="Seleccione un sector"
              />
            </div>

            <div className="space-y-2">
              <CustomLabel>Sectorista / Jefe de Cuenta</CustomLabel>
              <input
                value={sectoristaJefeCuenta}
                onChange={(event) => setSectoristaJefeCuenta(event.target.value)}
                onFocus={seleccionarTextoCampoEditable}
                placeholder="Nombre del sectorista o jefe de cuenta"
                className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none"
              />
            </div>

            <div className="space-y-2">
              <CustomLabel>Numero(s) de Telefono</CustomLabel>
              <input
                value={telefono}
                onChange={(event) => setTelefono(event.target.value)}
                onFocus={seleccionarTextoCampoEditable}
                placeholder="+52 ..."
                className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none"
              />
            </div>

            {pais ? (
              <p className="text-xs text-slate-400">Pais del banco: {pais}</p>
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
        idIdioma={idIdioma}
        onCerrar={() => setEstaAbiertoModalBusqueda(false)}
        onSeleccionar={seleccionarBanco}
      />
    </>
  );
}
