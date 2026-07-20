import { Loader2, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { CustomModalConfirmacionAccion } from "@maximilian/components/common/CustomModalConfirmacionAccion";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
import { CustomModalRegistroPersonaDirectorioAnalista } from "@maximilian/components/investigacion/CustomModalRegistroPersonaDirectorio";
import { useModalBuscarEjecutivoInforme } from "@maximilian/hooks/useModalBuscarEjecutivoInforme";
import type { RegistroPersonaDirectorioAnalista } from "@maximilian/shared/types/investigacion.type";

interface PropsCustomModalBuscarEjecutivoAnalista {
  estaAbierto: boolean;
  registros: RegistroPersonaDirectorioAnalista[];
  busquedaInicial?: string;
  idIdioma?: number;
  onCerrar: () => void;
  onSeleccionar: (registro: RegistroPersonaDirectorioAnalista) => void;
  onAgregarEmpresaPersona: () => void;
}

export function CustomModalBuscarEjecutivoAnalista({
  estaAbierto,
  registros,
  busquedaInicial = "",
  idIdioma,
  onCerrar,
  onSeleccionar,
  onAgregarEmpresaPersona,
}: PropsCustomModalBuscarEjecutivoAnalista) {
  const {
    descripcion,
    eliminarDirectorioMutation,
    idPais,
    idRegistroSeleccionado,
    idTipoPersona,
    isError,
    isFetching,
    manejarBuscar,
    manejarGuardarRegistro,
    manejarSeleccionar,
    opcionesPais,
    opcionesTipoPersona,
    paginaActual,
    prepararEdicionRegistro,
    refetch,
    registroAEliminar,
    registroEdicion,
    registroSeleccionado,
    resultados,
    respuestaDirectorio,
    setDescripcion,
    setIdPais,
    setIdRegistroSeleccionado,
    setIdTipoPersona,
    setPaginaActual,
    setRegistroAEliminar,
    setRegistroEdicion,
  } = useModalBuscarEjecutivoInforme({
    busquedaInicial,
    estaAbierto,
    idIdioma,
    onSeleccionar,
    registros,
  });

  if (!estaAbierto) return null;

  return (
    <>
      <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
        <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-6xl flex-col overflow-hidden rounded-[30px] bg-white shadow-[0_40px_100px_rgba(15,23,42,0.28)]">
          <div className="border-b border-slate-100 bg-[radial-gradient(circle_at_top_left,#f8fafc,white_55%)] px-8 py-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8ea0c0]">
                  Directorio ejecutivo
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                  Busqueda de ejecutivos
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Busque, seleccione o administre ejecutivos registrados
                  directamente desde la base de datos.
                </p>
              </div>
              <CustomButton variant="ghost" size="icon" onClick={onCerrar}>
                <X size={20} className="text-[#8ea0c0]" />
              </CustomButton>
            </div>
          </div>

          <div className="space-y-6 overflow-y-auto px-8 py-6">
            <div className="grid gap-5 rounded-3xl border border-slate-100 bg-slate-50/70 p-5 md:grid-cols-3">
              <CustomSelectorBuscable
                label="Tipo Persona"
                options={opcionesTipoPersona}
                value={idTipoPersona}
                onChange={setIdTipoPersona}
                onClear={() => setIdTipoPersona(undefined)}
                optional
                mostrarTextoOpcionalEnLabel={false}
                placeholder="Todos"
              />
              <CustomSelectorBuscable
                label="Pais"
                options={opcionesPais}
                value={idPais}
                onChange={setIdPais}
                onClear={() => setIdPais(undefined)}
                optional
                mostrarTextoOpcionalEnLabel={false}
                placeholder="Todos"
              />
              <div className="space-y-2">
                <CustomLabel>Busqueda</CustomLabel>
                <div className="relative">
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                  />
                  <input
                    value={descripcion}
                    onChange={(event) => setDescripcion(event.target.value)}
                    placeholder="Nombre, documento o ID fiscal"
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm text-slate-600 outline-none transition-all focus:border-brand-black focus:ring-2 focus:ring-brand-black/5"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={onAgregarEmpresaPersona}
                className="inline-flex items-center gap-2 rounded-full bg-brand-wine px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-wine/90"
              >
                <Plus size={14} />
                Agregar Empresa o Persona
              </button>
              <div className="flex items-center gap-3">
                <p className="text-xs text-slate-400">
                  {respuestaDirectorio?.totalRegistros ?? 0} registro(s)
                  encontrados
                </p>
                <CustomButton
                  type="button"
                  size="sm"
                  className="h-10 rounded-lg px-4"
                  loading={isFetching}
                  loadingText="Buscando..."
                  onClick={manejarBuscar}
                >
                  <Search size={14} />
                  Buscar
                </CustomButton>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-100">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.16em] text-[#9aa9c2]">
                  <tr>
                    <th className="px-5 py-4">Nombre / Razon Social</th>
                    <th className="px-5 py-4">Documento</th>
                    <th className="px-5 py-4">Pais</th>
                    <th className="px-5 py-4">ID Fiscal</th>
                    <th className="px-5 py-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {isFetching ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center">
                        <div className="inline-flex items-center gap-2 text-sm text-slate-400">
                          <Loader2 size={16} className="animate-spin" />
                          Cargando registros...
                        </div>
                      </td>
                    </tr>
                  ) : isError ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center">
                        <div className="space-y-3">
                          <p className="text-sm text-red-500">
                            No se pudo cargar el directorio ejecutivo.
                          </p>
                          <CustomButton
                            variant="secondary"
                            size="sm"
                            onClick={() => void refetch()}
                          >
                            Reintentar
                          </CustomButton>
                        </div>
                      </td>
                    </tr>
                  ) : resultados.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-10 text-center text-sm text-slate-400"
                      >
                        No se encontraron registros.
                      </td>
                    </tr>
                  ) : (
                    resultados.map((registro) => {
                      const estaSeleccionado =
                        idRegistroSeleccionado === registro.id;

                      return (
                        <tr
                          key={registro.id}
                          className={`cursor-pointer transition-colors ${
                            estaSeleccionado ? "bg-brand-wine/5" : "hover:bg-slate-50"
                          }`}
                          onClick={() => setIdRegistroSeleccionado(registro.id)}
                        >
                          <td className="relative px-5 py-5">
                            <span
                              className={`pointer-events-none absolute inset-y-0 left-0 w-[3px] rounded-r-full transition-colors ${
                                estaSeleccionado ? "bg-brand-wine" : ""
                              }`}
                            />
                            <span
                              className={`text-sm font-bold ${
                                estaSeleccionado
                                  ? "text-brand-wine"
                                  : "text-brand-black"
                              }`}
                            >
                              {registro.nombres}
                            </span>
                          </td>
                          <td className="px-5 py-5">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                              {registro.tipoDocumentoIdentidad || "-"} -{" "}
                              {registro.numeroDocumentoIdentidad || "-"}
                            </span>
                          </td>
                          <td className="px-5 py-5 text-sm text-slate-600">
                            {registro.pais || "-"}
                          </td>
                          <td className="px-5 py-5 text-sm text-slate-600">
                            {registro.numeroIdFiscal || "-"}
                          </td>
                          <td className="px-5 py-5 text-center">
                            <div className="flex items-center justify-center gap-4">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  void prepararEdicionRegistro(registro);
                                }}
                                className="inline-flex text-[#2764ff] transition-colors hover:text-[#1d4ed8]"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setRegistroAEliminar(registro);
                                }}
                                className="inline-flex text-red-500 transition-colors hover:text-red-600"
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

            <div className="flex items-center justify-end gap-2">
              <CustomButton
                type="button"
                variant="secondary"
                size="sm"
                onClick={() =>
                  setPaginaActual((pagina) => Math.max(1, pagina - 1))
                }
                disabled={paginaActual <= 1 || isFetching}
              >
                Anterior
              </CustomButton>
              <span className="text-sm font-medium text-slate-500">
                Pagina {paginaActual} de {respuestaDirectorio?.totalPaginas ?? 1}
              </span>
              <CustomButton
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setPaginaActual((pagina) => pagina + 1)}
                disabled={
                  isFetching ||
                  paginaActual >= (respuestaDirectorio?.totalPaginas ?? 1)
                }
              >
                Siguiente
              </CustomButton>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-8 py-5">
            <CustomButton
              type="button"
              variant="secondary"
              size="sm"
              onClick={onCerrar}
            >
              Cancelar
            </CustomButton>
            <CustomButton
              type="button"
              size="sm"
              onClick={manejarSeleccionar}
              disabled={!registroSeleccionado}
            >
              Seleccionar
            </CustomButton>
          </div>
        </div>
      </div>

      <CustomModalRegistroPersonaDirectorioAnalista
        key={`${registroEdicion?.id ?? "sin-registro"}-${registroEdicion ? "abierto" : "cerrado"}`}
        estaAbierto={registroEdicion != null}
        registroInicial={registroEdicion}
        idIdioma={idIdioma}
        onCerrar={() => setRegistroEdicion(null)}
        onGuardar={manejarGuardarRegistro}
      />

      <CustomModalConfirmacionAccion
        isOpen={registroAEliminar != null}
        onClose={() => setRegistroAEliminar(null)}
        onConfirm={() => eliminarDirectorioMutation.mutate()}
        title="Eliminar Empresa o Persona"
        descripcion="Se eliminara el registro seleccionado del directorio ejecutivo."
        isSubmitting={eliminarDirectorioMutation.isPending}
        textoConfirmar="Eliminar"
        textoCargandoConfirmar="Eliminando..."
        varianteConfirmar="danger"
        zIndexClassName="z-[160]"
      >
        <p>
          <span className="font-bold">Registro:</span>{" "}
          {registroAEliminar?.nombres ?? "-"}
        </p>
        <p>
          <span className="font-bold">Documento:</span>{" "}
          {registroAEliminar?.numeroDocumentoIdentidad ?? "-"}
        </p>
      </CustomModalConfirmacionAccion>
    </>
  );
}
