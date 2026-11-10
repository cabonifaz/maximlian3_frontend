import type { ComponentProps } from "react";
import { CustomTabla } from "@maximilian/components/common/CustomTabla";
import { CustomChipVigencia } from "@maximilian/components/common/CustomChipVigencia";
import { CustomChipPrioridad } from "@maximilian/components/coordinador/CustomChipPrioridad";
import { CustomAccionesFilaFlujo } from "@maximilian/components/coordinador/CustomAccionesFilaFlujo";
import { COLUMNAS_FLUJO_ASIGNACION } from "@maximilian/shared/constants/pages/Coordinador/flujo-asignaciones.constants";
import type { FilaFlujoAsignacion } from "@maximilian/shared/types/flujo-informe.type";
import { construirTextoVencimiento, formatearFechaHoraCorta } from "@maximilian/shared/utils/flujo-informe.util";

type PropsAcciones = Omit<ComponentProps<typeof CustomAccionesFilaFlujo>, "pedido">;

interface PropsCustomTablaFlujoAsignaciones extends PropsAcciones {
  pedidos?: FilaFlujoAsignacion[];
  estaCargando: boolean;
  hayError: boolean;
  onReintentar: () => void;
  paginaActual: number;
  totalPaginas: number;
  totalRegistros: number;
  onCambiarPagina: (pagina: number) => void;
  esSeleccionable?: boolean;
  idsSeleccionados?: Set<number>;
  onCambiarSeleccion?: (ids: Set<number>) => void;
}

function CustomCeldaPersona({ nombre, detalle }: { nombre: string | null; detalle?: React.ReactNode }) {
  if (!nombre) {
    return <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">Sin asignar</span>;
  }

  return (
    <div className="min-w-0">
      <span className="block truncate text-sm text-slate-700" title={nombre}>{nombre}</span>
      {detalle}
    </div>
  );
}

export function CustomTablaFlujoAsignaciones({
  pedidos,
  estaCargando,
  hayError,
  onReintentar,
  paginaActual,
  totalPaginas,
  totalRegistros,
  onCambiarPagina,
  esSeleccionable,
  idsSeleccionados,
  onCambiarSeleccion,
  ...propsAcciones
}: PropsCustomTablaFlujoAsignaciones) {
  const renderizarFila = (pedido: FilaFlujoAsignacion) => {
    const vencimiento = construirTextoVencimiento(pedido.fechaVencimiento);

    return (
      <>
        <td className="px-4 py-4"><CustomChipPrioridad prioridad={pedido.prioridad} /></td>
        <td className="px-4 py-4 text-sm font-semibold text-brand-black">
          <span className="block truncate" title={pedido.cliente}>{pedido.cliente}</span>
        </td>
        <td className="px-4 py-4 text-sm text-slate-600">
          <span className="block truncate" title={pedido.investigado}>{pedido.investigado}</span>
          <span className="text-xs text-slate-400">Pedido {formatearFechaHoraCorta(pedido.fechaPedido)}</span>
        </td>
        <td className="px-4 py-4 text-sm text-slate-600">
          <span className="block">{pedido.pais}</span>
          <span className="text-xs text-slate-400">{pedido.idiomaInforme}</span>
        </td>
        <td className="px-4 py-4">
          <CustomCeldaPersona
            nombre={pedido.analista}
            detalle={pedido.fechaFinAnalisis ? (
              <span className="text-xs text-green-700">Finalizó {formatearFechaHoraCorta(pedido.fechaFinAnalisis)}</span>
            ) : null}
          />
        </td>
        <td className="px-4 py-4">
          <CustomCeldaPersona
            nombre={pedido.traductor}
            detalle={(
              <span className="flex flex-wrap gap-1 pt-0.5">
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-500">
                  {pedido.requiereTraduccion ? "Traducción" : "Edición"}
                </span>
                {pedido.rechazado ? (
                  <span className="rounded bg-red-50 px-1.5 py-0.5 text-[11px] font-semibold text-red-700">Rechazado</span>
                ) : null}
              </span>
            )}
          />
        </td>
        <td className="px-4 py-4">
          {pedido.etapa === "finalizado" ? (
            <span className="text-xs text-green-700">Aprobado {formatearFechaHoraCorta(pedido.fechaFinalizacion)}</span>
          ) : (
            <CustomChipVigencia
              texto={vencimiento.texto}
              colorTexto={vencimiento.colorTexto}
              colorFondo={vencimiento.colorFondo}
            />
          )}
        </td>
        <td className="px-4 py-4">
          <CustomAccionesFilaFlujo pedido={pedido} {...propsAcciones} />
        </td>
      </>
    );
  };

  return (
    <CustomTabla
      columns={COLUMNAS_FLUJO_ASIGNACION}
      data={pedidos}
      getId={(pedido) => pedido.idPedido}
      renderRow={renderizarFila}
      isLoading={estaCargando}
      isError={hayError}
      onRetry={onReintentar}
      emptyMessage="No hay pedidos en esta etapa."
      errorMessage="Error al cargar las asignaciones"
      paginaActual={paginaActual}
      totalPages={totalPaginas}
      totalRecords={totalRegistros}
      onPageChange={onCambiarPagina}
      entityLabel="pedidos"
      selectable={esSeleccionable}
      selectedIds={idsSeleccionados}
      onSelectionChange={onCambiarSeleccion}
    />
  );
}
