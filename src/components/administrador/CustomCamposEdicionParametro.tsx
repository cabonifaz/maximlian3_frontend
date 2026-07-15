import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
import type {
  ColumnasVisiblesParametro,
  ConfiguracionCamposParametro,
  FormularioParametro,
} from "@maximilian/shared/types/configuracion-parametros.type";
import type { EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";
import { obtenerEtiquetaCodigoDescripcionParametro } from "@maximilian/shared/utils/configuracion-parametros.util";

interface PropsCustomCamposEdicionParametro {
  valores: FormularioParametro;
  onCambiar: (valores: FormularioParametro) => void;
  numero?: number | null;
  configuracion: ConfiguracionCamposParametro;
  columnasVisibles: ColumnasVisiblesParametro;
  opcionesReferencia?: EntradaTablaMaestra[];
}

export function CustomCamposEdicionParametro({
  valores,
  onCambiar,
  numero,
  configuracion,
  columnasVisibles,
  opcionesReferencia,
}: PropsCustomCamposEdicionParametro) {
  return (
    <>
      <td className="px-5 py-3">
        <span className="inline-flex h-9 min-w-16 items-center rounded-md bg-slate-100 px-3 text-xs font-bold text-slate-500">
          {numero ?? "Automatico"}
        </span>
      </td>
      {columnasVisibles.codigo && !configuracion.codigoDespuesDescripcion ? (
        <td className="px-5 py-3">
          {configuracion.etiquetaCodigo ? (
            <input
              value={valores.codigo}
              onChange={(event) =>
                onCambiar({ ...valores, codigo: event.target.value })
              }
              placeholder={configuracion.etiquetaCodigo}
              className="h-9 w-full rounded-md border border-blue-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          ) : (
            <span className="text-xs text-slate-300">
              {valores.codigo || "-"}
            </span>
          )}
        </td>
      ) : null}
      {columnasVisibles.referencia ? (
        <td className="px-5 py-3">
          {configuracion.idMaestroReferencia ? (
            <CustomSelectorBuscable
              options={opcionesReferencia ?? []}
              value={
                valores.referencia ? Number.parseInt(valores.referencia, 10) : undefined
              }
              onChange={(valor) =>
                onCambiar({ ...valores, referencia: String(valor) })
              }
              placeholder={`Seleccione ${configuracion.etiquetaReferencia?.toLowerCase()}`}
              obtenerEtiquetaOpcion={(opcion) =>
                configuracion.mostrarReferenciaConCodigo
                  ? obtenerEtiquetaCodigoDescripcionParametro(opcion)
                  : opcion.string1 ?? ""
              }
            />
          ) : configuracion.etiquetaReferencia ? (
            <input
              value={valores.referencia}
              onChange={(event) =>
                onCambiar({
                  ...valores,
                  referencia: event.target.value.replace(/\D/g, ""),
                })
              }
              placeholder={configuracion.etiquetaReferencia}
              className="h-9 w-28 rounded-md border border-blue-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          ) : (
            <span className="text-xs text-slate-300">
              {valores.referencia || "-"}
            </span>
          )}
        </td>
      ) : null}
      <td className="px-5 py-3">
        <input
          value={valores.descripcion}
          onChange={(event) =>
            onCambiar({ ...valores, descripcion: event.target.value })
          }
          placeholder={configuracion.etiquetaDescripcion ?? "Descripcion"}
          className="h-9 w-full rounded-md border border-blue-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </td>
      {columnasVisibles.codigo && configuracion.codigoDespuesDescripcion ? (
        <td className="px-5 py-3">
          <input
            value={valores.codigo}
            onChange={(event) =>
              onCambiar({ ...valores, codigo: event.target.value })
            }
            placeholder={configuracion.etiquetaCodigo}
            className="h-9 w-full rounded-md border border-blue-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </td>
      ) : null}
      {columnasVisibles.detalle ? (
        <td className="px-5 py-3">
          {configuracion.etiquetaDetalle ? (
            <input
              value={valores.detalle}
              onChange={(event) =>
                onCambiar({ ...valores, detalle: event.target.value })
              }
              placeholder={configuracion.etiquetaDetalle}
              className="h-9 w-full rounded-md border border-blue-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          ) : (
            <span className="text-xs text-slate-300">
              {valores.detalle || "-"}
            </span>
          )}
        </td>
      ) : null}
      {columnasVisibles.ingles ? (
        <td className="px-5 py-3">
          <div className="space-y-2">
            <input
              value={valores.traduccionIngles1}
              onChange={(event) =>
                onCambiar({
                  ...valores,
                  traduccionIngles1: event.target.value,
                })
              }
              placeholder="Traduccion"
              className="h-9 w-full rounded-md border border-blue-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
            <input
              value={valores.traduccionIngles2}
              onChange={(event) =>
                onCambiar({
                  ...valores,
                  traduccionIngles2: event.target.value,
                })
              }
              placeholder="Detalle"
              className="h-9 w-full rounded-md border border-blue-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </td>
      ) : null}
      {columnasVisibles.portugues ? (
        <td className="px-5 py-3">
          <div className="space-y-2">
            <input
              value={valores.traduccionPortugues1}
              onChange={(event) =>
                onCambiar({
                  ...valores,
                  traduccionPortugues1: event.target.value,
                })
              }
              placeholder="Traducao"
              className="h-9 w-full rounded-md border border-blue-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
            <input
              value={valores.traduccionPortugues2}
              onChange={(event) =>
                onCambiar({
                  ...valores,
                  traduccionPortugues2: event.target.value,
                })
              }
              placeholder="Detalhe"
              className="h-9 w-full rounded-md border border-blue-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </td>
      ) : null}
    </>
  );
}
