import {
  Check,
  Edit2,
  Loader2,
  Trash2,
  X,
} from "lucide-react";
import { CustomCamposEdicionParametro } from "@maximilian/components/administrador/CustomCamposEdicionParametro";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomPaginacionTabla } from "@maximilian/components/common/CustomPaginacionTabla";
import type { ModeloConfiguracionParametros } from "@maximilian/hooks/useConfiguracionParametros";
import {
  obtenerClaveRegistroParametro,
  obtenerCodigoParametro,
  obtenerDescripcionParametro,
  obtenerDetalleInglesParametro,
  obtenerDetallePortuguesParametro,
  obtenerEtiquetaReferenciaParametro,
  obtenerEtiquetaReferenciaSecundariaParametro,
  obtenerNumeroParametro,
  obtenerSimboloParametro,
  obtenerTraduccionInglesParametro,
  obtenerTraduccionPortuguesParametro,
} from "@maximilian/shared/utils/configuracion-parametros.util";

interface PropsCustomTablaParametros {
  modelo: ModeloConfiguracionParametros;
}

export function CustomTablaParametros({ modelo }: PropsCustomTablaParametros) {
  return (
    <>
      <div className="overflow-x-auto px-6">
        <table
          className="w-full border-collapse text-left"
          style={{ minWidth: `${modelo.anchoMinimoTabla}px` }}
        >
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-5 py-4 text-[11px] font-bold uppercase text-slate-300">
                Numeración
              </th>
              {modelo.columnasVisibles.codigo &&
              !modelo.configuracionCampos.codigoDespuesDescripcion ? (
                <th className="px-5 py-4 text-[11px] font-bold uppercase text-slate-300">
                  {modelo.configuracionCampos.etiquetaCodigo ?? "Código"}
                </th>
              ) : null}
              {modelo.columnasVisibles.referencia ? (
                <th className="px-5 py-4 text-[11px] font-bold uppercase text-slate-300">
                  {modelo.configuracionCampos.etiquetaReferencia ?? "Referencia"}
                </th>
              ) : null}
              {modelo.columnasVisibles.referenciaSecundaria ? (
                <th className="px-5 py-4 text-[11px] font-bold uppercase text-slate-300">
                  {modelo.configuracionCampos.etiquetaReferenciaSecundaria
                    ?? "Referencia secundaria"}
                </th>
              ) : null}
              <th className="px-5 py-4 text-[11px] font-bold uppercase text-slate-300">
                {modelo.configuracionCampos.etiquetaDescripcion ?? "Descripción"}
              </th>
              {modelo.columnasVisibles.codigo &&
              modelo.configuracionCampos.codigoDespuesDescripcion ? (
                <th className="px-5 py-4 text-[11px] font-bold uppercase text-slate-300">
                  {modelo.configuracionCampos.etiquetaCodigo ?? "Código"}
                </th>
              ) : null}
              {modelo.columnasVisibles.detalle ? (
                <th className="px-5 py-4 text-[11px] font-bold uppercase text-slate-300">
                  {modelo.configuracionCampos.etiquetaDetalle ?? "Detalle"}
                </th>
              ) : null}
              {modelo.columnasVisibles.ingles ? (
                <th className="px-5 py-4 text-[11px] font-bold uppercase text-slate-300">
                  Inglés
                </th>
              ) : null}
              {modelo.columnasVisibles.portugues ? (
                <th className="px-5 py-4 text-[11px] font-bold uppercase text-slate-300">
                  Portugués
                </th>
              ) : null}
              <th className="px-5 py-4 text-right text-[11px] font-bold uppercase text-slate-300">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {modelo.mostrarFilaCreacion && modelo.filaFormulario && (
              <tr className="bg-slate-50/70">
                <CustomCamposEdicionParametro
                  valores={modelo.filaFormulario.valores}
                  numero={modelo.siguienteNumeroCreacion}
                  configuracion={modelo.configuracionCampos}
                  columnasVisibles={modelo.columnasVisibles}
                  opcionesReferencia={modelo.opcionesReferencia}
                  opcionesReferenciaSecundaria={
                    modelo.opcionesReferenciaSecundaria
                  }
                  onCambiar={modelo.cambiarValoresFormulario}
                />
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    <CustomButton
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={modelo.guardarFormulario}
                      disabled={modelo.estaGuardando}
                      className="h-8 w-8 rounded-md text-emerald-500 hover:bg-emerald-50"
                      title="Guardar"
                    >
                      {modelo.estaGuardando ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Check size={16} />
                      )}
                    </CustomButton>
                    <CustomButton
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={modelo.cancelarFormulario}
                      disabled={modelo.estaGuardando}
                      className="h-8 w-8 rounded-md text-slate-300 hover:bg-slate-100 hover:text-slate-500"
                      title="Cancelar"
                    >
                      <X size={16} />
                    </CustomButton>
                  </div>
                </td>
              </tr>
            )}

            {modelo.isLoading ? (
              <tr>
                <td colSpan={modelo.totalColumnas} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="text-sm font-medium">
                      Cargando parametros...
                    </span>
                  </div>
                </td>
              </tr>
            ) : modelo.isError ? (
              <tr>
                <td colSpan={modelo.totalColumnas} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <span className="text-sm font-bold text-slate-700">
                      Error al cargar parametros
                    </span>
                    <CustomButton
                      type="button"
                      variant="wine"
                      size="sm"
                      onClick={() => modelo.refetch()}
                    >
                      Reintentar
                    </CustomButton>
                  </div>
                </td>
              </tr>
            ) : modelo.registrosPagina.length === 0 ? (
              <tr>
                <td
                  colSpan={modelo.totalColumnas}
                  className="px-5 py-16 text-center text-sm text-slate-400"
                >
                  No se encontraron parametros registrados.
                </td>
              </tr>
            ) : (
              modelo.registrosPagina.map((parametro) => {
                const claveRegistro = obtenerClaveRegistroParametro(parametro);
                const estaEditando =
                  modelo.filaFormulario?.modo === "editar" &&
                  modelo.filaFormulario.claveRegistro === claveRegistro;

                return (
                  <tr
                    key={claveRegistro}
                    className={
                      estaEditando ? "bg-blue-50/40" : "hover:bg-slate-50/60"
                    }
                  >
                    {estaEditando && modelo.filaFormulario ? (
                      <CustomCamposEdicionParametro
                        valores={modelo.filaFormulario.valores}
                        numero={parametro.num1}
                        configuracion={modelo.configuracionCampos}
                        columnasVisibles={modelo.columnasVisibles}
                        opcionesReferencia={modelo.opcionesReferencia}
                        opcionesReferenciaSecundaria={
                          modelo.opcionesReferenciaSecundaria
                        }
                        onCambiar={modelo.cambiarValoresFormulario}
                      />
                    ) : (
                      <>
                        <td className="px-5 py-5 text-xs font-bold text-slate-600">
                          {obtenerNumeroParametro(parametro)}
                        </td>
                        {modelo.columnasVisibles.codigo &&
                        !modelo.configuracionCampos.codigoDespuesDescripcion ? (
                          <td className="px-5 py-5 text-xs font-semibold text-slate-600">
                            {obtenerCodigoParametro(parametro) || "-"}
                          </td>
                        ) : null}
                        {modelo.columnasVisibles.referencia ? (
                          <td className="px-5 py-5 text-xs font-semibold text-slate-600">
                            {obtenerEtiquetaReferenciaParametro(
                              parametro,
                              modelo.opcionesReferencia,
                              modelo.configuracionCampos,
                            ) || "-"}
                          </td>
                        ) : null}
                        {modelo.columnasVisibles.referenciaSecundaria ? (
                          <td className="px-5 py-5 text-xs font-semibold text-slate-600">
                            {obtenerEtiquetaReferenciaSecundariaParametro(
                              parametro,
                              modelo.opcionesReferenciaSecundaria,
                              modelo.configuracionCampos,
                            ) || "-"}
                          </td>
                        ) : null}
                        <td className="px-5 py-5 text-xs text-slate-600">
                          {obtenerDescripcionParametro(parametro)}
                        </td>
                        {modelo.columnasVisibles.codigo &&
                        modelo.configuracionCampos.codigoDespuesDescripcion ? (
                          <td className="px-5 py-5 text-xs font-semibold text-slate-600">
                            {obtenerCodigoParametro(parametro) || "-"}
                          </td>
                        ) : null}
                        {modelo.columnasVisibles.detalle ? (
                          <td className="px-5 py-5 text-xs font-semibold text-slate-600">
                            {obtenerSimboloParametro(parametro) || "-"}
                          </td>
                        ) : null}
                        {modelo.columnasVisibles.ingles ? (
                          <td className="px-5 py-5 text-xs text-slate-600">
                            {[
                              obtenerTraduccionInglesParametro(parametro),
                              obtenerDetalleInglesParametro(parametro),
                            ]
                              .filter(Boolean)
                              .join(" / ") || "-"}
                          </td>
                        ) : null}
                        {modelo.columnasVisibles.portugues ? (
                          <td className="px-5 py-5 text-xs text-slate-600">
                            {[
                              obtenerTraduccionPortuguesParametro(parametro),
                              obtenerDetallePortuguesParametro(parametro),
                            ]
                              .filter(Boolean)
                              .join(" / ") || "-"}
                          </td>
                        ) : null}
                      </>
                    )}
                    <td className="px-5 py-5">
                      <div className="flex justify-end gap-2">
                        {estaEditando ? (
                          <>
                            <CustomButton
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={modelo.guardarFormulario}
                              disabled={modelo.estaGuardando}
                              className="h-8 w-8 rounded-md text-emerald-500 hover:bg-emerald-50"
                              title="Guardar"
                            >
                              {modelo.estaGuardando ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Check size={16} />
                              )}
                            </CustomButton>
                            <CustomButton
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={modelo.cancelarFormulario}
                              disabled={modelo.estaGuardando}
                              className="h-8 w-8 rounded-md text-slate-300 hover:bg-slate-100 hover:text-slate-500"
                              title="Cancelar"
                            >
                              <X size={16} />
                            </CustomButton>
                          </>
                        ) : (
                          <>
                            <CustomButton
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => modelo.iniciarEdicion(parametro)}
                              disabled={modelo.estaGuardando}
                              className="h-8 w-8 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                              title="Editar"
                            >
                              <Edit2 size={16} />
                            </CustomButton>
                            <CustomButton
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => modelo.solicitarEliminarParametro(parametro)}
                              disabled={
                                modelo.estaGuardando
                                || parametro.idTablaMaestra === null
                              }
                              className="h-8 w-8 rounded-md text-red-400 hover:bg-red-50 hover:text-red-600"
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </CustomButton>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <CustomPaginacionTabla
        paginaActual={modelo.paginaActual}
        totalPaginas={modelo.totalPaginas}
        totalRegistros={modelo.totalRegistros}
        cantidadPagina={modelo.registrosPagina.length}
        onPaginaChange={modelo.cambiarPagina}
        etiquetaRegistros="registros"
        deshabilitado={modelo.isLoading || modelo.isError}
      />
    </>
  );
}
