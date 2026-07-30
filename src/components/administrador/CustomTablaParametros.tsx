import {
  Check,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Loader2,
  X,
} from "lucide-react";
import { CustomCamposEdicionParametro } from "@maximilian/components/administrador/CustomCamposEdicionParametro";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import type { ModeloConfiguracionParametros } from "@maximilian/hooks/useConfiguracionParametros";
import { obtenerSiguienteNumTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";
import {
  obtenerClaveRegistroParametro,
  obtenerCodigoParametro,
  obtenerDescripcionParametro,
  obtenerDetalleInglesParametro,
  obtenerDetallePortuguesParametro,
  obtenerEtiquetaReferenciaParametro,
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
                  numero={obtenerSiguienteNumTablaMaestra(modelo.parametros ?? [])}
                  configuracion={modelo.configuracionCampos}
                  columnasVisibles={modelo.columnasVisibles}
                  opcionesReferencia={modelo.opcionesReferencia}
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

      <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
        <p className="text-xs font-medium text-slate-400">
          Mostrando {modelo.registrosPagina.length} de{" "}
          {modelo.totalRegistros} registros
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => modelo.cambiarPagina(modelo.paginaActual - 1)}
            disabled={modelo.paginaActual === 1 || modelo.isLoading || modelo.isError}
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Página anterior"
          >
            <ChevronLeft size={16} />
          </button>
          {modelo.paginas.map((pagina, indice) =>
            pagina === "puntos" ? (
              <span
                key={`puntos-${indice}`}
                className="flex h-8 w-8 items-center justify-center text-xs font-bold text-slate-300"
              >
                ...
              </span>
            ) : (
              <button
                key={pagina}
                type="button"
                onClick={() => modelo.cambiarPagina(pagina)}
                className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-bold transition-colors ${
                  pagina === modelo.paginaActual
                    ? "bg-brand-black text-white"
                    : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                }`}
              >
                {pagina}
              </button>
            ),
          )}
          <button
            type="button"
            onClick={() => modelo.cambiarPagina(modelo.paginaActual + 1)}
            disabled={
              modelo.paginaActual === modelo.totalPaginas ||
              modelo.isLoading ||
              modelo.isError
            }
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Página siguiente"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
