import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";
import { CustomButton } from "./CustomButton";

export interface TableColumn {
  label: string;
  className?: string;
}

interface CustomTableProps<T> {
  columns: TableColumn[];
  data: T[] | undefined;
  renderRow: (item: T, index: number, isSelected: boolean) => ReactNode;
  getId: (item: T) => number;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  emptyMessage?: string;
  errorMessage?: string;
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
  entityLabel?: string;
  selectable?: boolean;
  selectedIds?: Set<number>;
  onSelectionChange?: (ids: Set<number>) => void;
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

export function CustomTable<T>({
  columns,
  data,
  renderRow,
  getId,
  isLoading,
  isError,
  onRetry,
  emptyMessage = "No se encontraron registros.",
  errorMessage = "Error al cargar los datos.",
  currentPage,
  totalPages,
  totalRecords,
  onPageChange,
  entityLabel = "registros",
  selectable,
  selectedIds,
  onSelectionChange,
}: CustomTableProps<T>) {
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
  const pages = getPaginationPages(currentPage, totalPages);
  const navDisabled = !!(isLoading || isError);

  return (
    <div className="bg-brand-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
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
                  className={`px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider ${col.className ?? ""}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr>
                <td colSpan={colCount} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 text-brand-wine animate-spin" />
                    <p className="text-sm font-medium text-gray-500">
                      Cargando...
                    </p>
                  </div>
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={colCount} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-red-500" />
                    </div>
                    <p className="text-sm font-bold text-brand-black">
                      {errorMessage}
                    </p>
                    {onRetry && (
                      <CustomButton variant="wine" size="sm" onClick={onRetry}>
                        <RefreshCw size={14} />
                        <span>REINTENTAR</span>
                      </CustomButton>
                    )}
                  </div>
                </td>
              </tr>
            ) : !data || data.length === 0 ? (
              <tr>
                <td
                  colSpan={colCount}
                  className="px-6 py-20 text-center text-sm text-gray-400 italic"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, index) => {
                const id = getId(item);
                const isSelected = selectedIds?.has(id) ?? false;
                return (
                  <tr
                    key={id}
                    className={`hover:bg-gray-50/50 transition-colors ${isSelected ? "bg-brand-wine/5" : ""}`}
                  >
                    {selectable && (
                      <td className="px-6 py-4 w-10">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(id)}
                          className="w-4 h-4 rounded border-gray-300 accent-brand-wine cursor-pointer"
                        />
                      </td>
                    )}
                    {renderRow(item, index, isSelected)}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        <p className="text-xs text-gray-400 font-medium">
          Mostrando {data?.length ?? 0} de {totalRecords} {entityLabel}
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={navDisabled || currentPage === 1}
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
                  onClick={() => onPageChange(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer hover:scale-110 ${
                    page === currentPage
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
            onClick={() => onPageChange(currentPage + 1)}
            disabled={navDisabled || currentPage === totalPages}
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
