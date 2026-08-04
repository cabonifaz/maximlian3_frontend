import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";
import { CustomButton } from "./CustomButton";

export interface TableColumn {
  label: ReactNode;
  className?: string;
  width?: string;
}

interface CustomTablaProps<T> {
  columns: TableColumn[];
  data: T[] | undefined;
  renderRow: (item: T, index: number, isSelected: boolean) => ReactNode;
  getId: (item: T) => number;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  emptyMessage?: string;
  errorMessage?: string;
  paginaActual: number;
  totalPages: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
  entityLabel?: string;
  selectable?: boolean;
  selectedIds?: Set<number>;
  onSelectionChange?: (ids: Set<number>) => void;
  cantidadFilasVisibles?: number;
}

function getPaginationPages(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  for (
    let i = Math.max(2, current - 1);
    i <= Math.min(total - 1, current + 1);
    i++
  ) {
    pages.push(i);
  }
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

export function CustomTabla<T>({
  columns,
  data,
  renderRow,
  getId,
  isLoading,
  isError,
  onRetry,
  emptyMessage = "No se encontraron registros.",
  errorMessage = "Error al cargar los datos.",
  paginaActual,
  totalPages,
  totalRecords,
  onPageChange,
  entityLabel = "registros",
  selectable,
  selectedIds,
  onSelectionChange,
  cantidadFilasVisibles = 5,
}: CustomTablaProps<T>) {
  const selectAllRef = useRef<HTMLInputElement>(null);

  const currentIds = data?.map(getId) ?? [];
  const allSelected =
    currentIds.length > 0 &&
    currentIds.every((id) => selectedIds?.has(id) ?? false);
  const someSelected =
    !allSelected && currentIds.some((id) => selectedIds?.has(id) ?? false);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    const next = new Set(selectedIds);
    if (allSelected) {
      currentIds.forEach((id) => next.delete(id));
    } else {
      currentIds.forEach((id) => next.add(id));
    }
    onSelectionChange(next);
  };

  const handleSelectRow = (id: number) => {
    if (!onSelectionChange || !selectedIds) return;
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onSelectionChange(next);
  };

  const colCount = columns.length + (selectable ? 1 : 0);
  const pages = getPaginationPages(paginaActual, totalPages);
  const navDisabled = !!(isLoading || isError);
  const anchoColumnaDefecto = `${100 / Math.max(columns.length, 1)}%`;

  return (
    <div className="bg-brand-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="max-w-full overflow-x-auto overscroll-x-contain">
        <table
          className="w-full table-fixed border-collapse text-left [&_td]:max-w-0 [&_td]:break-words [&_td]:align-middle"
          style={{
            minWidth: Math.max(
              900,
              columns.length * 160 + (selectable ? 48 : 0),
            ),
          }}
        >
          <colgroup>
            {selectable ? <col className="w-10" /> : null}
            {columns.map((col, i) => (
              <col key={i} style={{ width: col.width ?? anchoColumnaDefecto }} />
            ))}
          </colgroup>
          <thead>
            <tr className="border-b border-gray-100">
              {selectable && (
                <th className="px-6 py-4 w-10">
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 accent-brand-wine cursor-pointer"
                  />
                </th>
              )}
              {columns.map((col, i) => (
                <th
                  key={i}
                  className={`px-6 py-4 text-xs font-semibold text-gray-400 ${col.className ?? ""}`}
                >
                  {typeof col.label === "string" ? (
                    <span className="uppercase tracking-wider">{col.label}</span>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              Array.from({ length: cantidadFilasVisibles }, (_, indiceFila) => (
                <tr key={`esqueleto-${indiceFila}`} className="h-[57px]">
                  {Array.from({ length: colCount }, (_, indiceColumna) => (
                    <td
                      key={`esqueleto-${indiceFila}-${indiceColumna}`}
                      className="px-6 py-4"
                    >
                      <div
                        className={`h-3 animate-pulse rounded-full bg-slate-100 ${
                          indiceColumna % 3 === 0
                            ? "w-3/4"
                            : indiceColumna % 2 === 0
                              ? "mx-auto w-1/2"
                              : "w-2/3"
                        }`}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : isError ? (
              <tr style={{ height: cantidadFilasVisibles * 57 }}>
                <td colSpan={colCount} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                      <AlertCircle className="h-6 w-6 text-red-500" />
                    </div>
                    <p className="text-sm font-bold text-brand-black">
                      {errorMessage}
                    </p>
                    {onRetry ? (
                      <CustomButton variant="wine" size="sm" onClick={onRetry}>
                        <RefreshCw size={14} />
                        <span>REINTENTAR</span>
                      </CustomButton>
                    ) : null}
                  </div>
                </td>
              </tr>
            ) : !data || data.length === 0 ? (
              <tr style={{ height: cantidadFilasVisibles * 57 }}>
                <td
                  colSpan={colCount}
                  className="px-6 py-20 text-center text-sm italic text-gray-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              <>
                {data.map((item, index) => {
                  const id = getId(item);
                  const isSelected = selectedIds?.has(id) ?? false;

                  return (
                    <tr
                      key={`${id}-${index}`}
                      className={`h-[57px] transition-colors hover:bg-gray-50/50 ${
                        isSelected ? "bg-brand-wine/5" : ""
                      }`}
                    >
                      {selectable ? (
                        <td className="w-10 px-6 py-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRow(id)}
                            className="h-4 w-4 cursor-pointer rounded border-gray-300 accent-brand-wine"
                          />
                        </td>
                      ) : null}
                      {renderRow(item, index, isSelected)}
                    </tr>
                  );
                })}
                {Array.from(
                  {
                    length: Math.max(
                      0,
                      cantidadFilasVisibles - data.length,
                    ),
                  },
                  (_, indice) => (
                    <tr
                      key={`espacio-reservado-${indice}`}
                      className="h-[57px]"
                      aria-hidden="true"
                    >
                      <td colSpan={colCount} />
                    </tr>
                  ),
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-xs text-gray-400 font-medium">
          Mostrando {data?.length ?? 0} de {totalRecords} {entityLabel}
        </p>
        <div className="flex max-w-full items-center gap-3 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => onPageChange(paginaActual - 1)}
            disabled={navDisabled || paginaActual === 1}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand-black disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
            <span>Anterior</span>
          </button>
          <div className="flex items-center gap-1">
            {pages.map((page, i) =>
              page === "..." ? (
                <span
                  key={`ellipsis-${i}`}
                  className="w-8 h-8 flex items-center justify-center text-xs text-gray-400 select-none"
                >
                  …
                </span>
              ) : (
                <button
                  key={page}
                  type="button"
                  onClick={() => onPageChange(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer hover:scale-110 ${
                    page === paginaActual
                      ? "bg-brand-black text-brand-white shadow shadow-black/10"
                      : "text-gray-400 hover:bg-gray-100 hover:text-brand-black"
                  }`}
                >
                  {page}
                </button>
              ),
            )}
          </div>
          <button
            type="button"
            onClick={() => onPageChange(paginaActual + 1)}
            disabled={navDisabled || paginaActual === totalPages}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-brand-black disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <span>Siguiente</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
