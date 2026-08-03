import { opcionesCriterio } from "@maximilian/shared/constants/components/investigacion/custom-modal-lista-personas.constants";
import { Loader2, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { CustomModalConfirmacionAccion } from "@maximilian/components/common/CustomModalConfirmacionAccion";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
import { useModalListaPersonasInforme } from "@maximilian/hooks/useModalListaPersonasInforme";
import type { EmpresaRelacionadaAnalista } from "@maximilian/shared/types/investigacion.type";
import type { EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";
import { CustomModalRegistroEmpresaRelacionadaAnalista } from "./CustomModalRegistroEmpresaRelacionada";

interface PropsCustomModalListaPersonasAnalista {
  estaAbierto: boolean;
  opcionesTipoPersona?: EntradaTablaMaestra[];
  opcionesPais?: EntradaTablaMaestra[];
  idIdioma?: number;
  onCerrar: () => void;
  onGuardar: (empresa: EmpresaRelacionadaAnalista) => void;
}

export function CustomModalListaPersonasAnalista({
  estaAbierto,
  opcionesTipoPersona,
  opcionesPais,
  idIdioma,
  onCerrar,
  onGuardar,
}: PropsCustomModalListaPersonasAnalista) {
  const {
    abrirNuevoRegistro,
    cerrarModalRegistro,
    descripcion,
    eliminarCompaniaMutation,
    estaAbiertoModalRegistro,
    idCriterio,
    idPais,
    idRegistroSeleccionado,
    idTipoPersona,
    isError,
    isLoading,
    manejarGuardarCompania,
    manejarGuardarRegistro,
    paginaActual,
    prepararEdicionRegistro,
    refetch,
    registroAEliminar,
    registroEdicion,
    registrosFiltrados,
    respuestaCompanias,
    setDescripcion,
    setIdCriterio,
    setIdPais,
    setIdRegistroSeleccionado,
    setIdTipoPersona,
    setPaginaActual,
    setRegistroAEliminar,
  } = useModalListaPersonasInforme({
    estaAbierto,
    onCerrar,
    onGuardar,
    opcionesPais,
    opcionesTipoPersona,
  });

  if (!estaAbierto) return null;

  return (
    <>
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
        <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-6xl flex-col overflow-hidden rounded-[30px] bg-white shadow-[0_40px_100px_rgba(15,23,42,0.28)]">
          <div className="border-b border-slate-100 bg-[radial-gradient(circle_at_top_left,#f8fafc,white_55%)] px-8 py-7">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8ea0c0]">
                    Compañías relacionadas
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">
                    Empresas y Personas Registradas
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Busque, seleccione o administre compañías relacionadas
                    directamente desde la base de datos.
                  </p>
                </div>
              </div>
              <CustomButton variant="ghost" size="icon" onClick={onCerrar}>
                <X size={20} className="text-[#8ea0c0]" />
              </CustomButton>
            </div>
          </div>

          <div className="space-y-6 overflow-y-auto px-8 py-6">
            <div className="grid gap-5 rounded-3xl border border-slate-100 bg-slate-50/70 p-5 md:grid-cols-4">
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
                label="País"
                options={opcionesPais}
                value={idPais}
                onChange={setIdPais}
                onClear={() => setIdPais(undefined)}
                optional
                mostrarTextoOpcionalEnLabel={false}
                placeholder="Todos"
              />
              <CustomSelectorBuscable
                label="Criterio"
                options={opcionesCriterio}
                value={idCriterio}
                onChange={setIdCriterio}
                onClear={() => setIdCriterio(undefined)}
                optional
                mostrarTextoOpcionalEnLabel={false}
                placeholder="Seleccione criterio"
              />
              <div className="space-y-2">
                <CustomLabel>Búsqueda</CustomLabel>
                <div className="relative">
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                  />
                  <input
                    value={descripcion}
                    onChange={(event) => setDescripcion(event.target.value)}
                    placeholder="Ingrese el valor a buscar"
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm text-slate-600 outline-none transition-all focus:border-brand-black focus:ring-2 focus:ring-brand-black/5"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={abrirNuevoRegistro}
                className="inline-flex items-center gap-2 rounded-full bg-brand-wine px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-wine/90"
              >
                <Plus size={14} />
                Agregar Empresa o Persona
              </button>
              <p className="text-xs text-slate-400">
                {respuestaCompanias?.totalRegistros ?? 0} registro(s)
                encontrados
              </p>
            </div>

            <div className="max-w-full overflow-x-auto rounded-3xl border border-slate-100">
              <table className="w-full min-w-[700px] text-left">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.16em] text-[#9aa9c2]">
                  <tr>
                    <th className="px-5 py-4">Nombre / Razón social</th>
                    <th className="px-5 py-4">Documento</th>
                    <th className="px-5 py-4">País</th>
                    <th className="px-5 py-4">Teléfono</th>
                    <th className="px-5 py-4">Existe Inf.</th>
                    <th className="px-5 py-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center">
                        <div className="inline-flex items-center gap-2 text-sm text-slate-400">
                          <Loader2 size={16} className="animate-spin" />
                          Cargando registros...
                        </div>
                      </td>
                    </tr>
                  ) : isError ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center">
                        <div className="space-y-3">
                          <p className="text-sm text-red-500">
                            No se pudo cargar la lista de compañías.
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
                  ) : registrosFiltrados.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-10 text-center text-sm text-slate-400"
                      >
                        No se encontraron registros.
                      </td>
                    </tr>
                  ) : (
                    registrosFiltrados.map((registro) => {
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
                              {registro.tipoDocumento}
                            </span>
                          </td>
                          <td className="px-5 py-5 text-sm text-slate-600">
                            {registro.pais}
                          </td>
                          <td className="px-5 py-5 text-sm text-slate-600">
                            {registro.telefono}
                          </td>
                          <td className="px-5 py-5">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${
                                registro.textoExisteInformacion === "Si"
                                  ? "bg-green-50 text-green-600"
                                  : "bg-slate-100 text-slate-400"
                              }`}
                            >
                              {registro.textoExisteInformacion}
                            </span>
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
                variant="secondary"
                size="sm"
                onClick={() => setPaginaActual((pagina) => Math.max(1, pagina - 1))}
                disabled={paginaActual <= 1 || isLoading}
              >
                Anterior
              </CustomButton>
              <span className="text-sm font-medium text-slate-500">
                Página {paginaActual} de {respuestaCompanias?.totalPaginas ?? 1}
              </span>
              <CustomButton
                variant="secondary"
                size="sm"
                onClick={() => setPaginaActual((pagina) => pagina + 1)}
                disabled={
                  isLoading ||
                  paginaActual >= (respuestaCompanias?.totalPaginas ?? 1)
                }
              >
                Siguiente
              </CustomButton>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-8 py-5">
            <CustomButton variant="secondary" size="sm" onClick={onCerrar}>
              Cancelar
            </CustomButton>
            <CustomButton
              size="sm"
              onClick={manejarGuardarCompania}
              disabled={idRegistroSeleccionado == null}
            >
              Seleccionar
            </CustomButton>
          </div>
        </div>
      </div>

      <CustomModalRegistroEmpresaRelacionadaAnalista
        key={`${registroEdicion?.id ?? "nuevo"}-${estaAbiertoModalRegistro ? "abierto" : "cerrado"}`}
        estaAbierto={estaAbiertoModalRegistro}
        opcionesTipoPersona={opcionesTipoPersona}
        opcionesPais={opcionesPais}
        idIdioma={idIdioma}
        registroInicial={registroEdicion}
        onCerrar={cerrarModalRegistro}
        onGuardar={manejarGuardarRegistro}
      />

      <CustomModalConfirmacionAccion
        isOpen={registroAEliminar != null}
        onClose={() => setRegistroAEliminar(null)}
        onConfirm={() => eliminarCompaniaMutation.mutate()}
        title="Eliminar Empresa o Persona"
        descripcion="Se eliminará el registro seleccionado de la base de datos."
        isSubmitting={eliminarCompaniaMutation.isPending}
        textoConfirmar="Eliminar"
        textoCargandoConfirmar="Eliminando..."
        varianteConfirmar="danger"
      >
        <p>
          <span className="font-bold">Registro:</span>{" "}
          {registroAEliminar?.nombres ?? "-"}
        </p>
        <p>
          <span className="font-bold">Documento:</span>{" "}
          {registroAEliminar?.tipoDocumento ?? "-"}
        </p>
      </CustomModalConfirmacionAccion>
    </>
  );
}
