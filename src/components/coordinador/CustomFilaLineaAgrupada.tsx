import { Pencil, Trash2 } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import type { EntradaLineaAgrupadaPendiente } from "@maximilian/shared/types/facturacion.type";
import { formatearMontoDosDecimales } from "@maximilian/shared/utils/formato-monto.util";

interface CustomFilaLineaAgrupadaProps {
  linea: EntradaLineaAgrupadaPendiente;
  onEditar: (linea: EntradaLineaAgrupadaPendiente) => void;
  onEliminar: (linea: EntradaLineaAgrupadaPendiente) => void;
}

export function CustomFilaLineaAgrupada({
  linea,
  onEditar,
  onEliminar,
}: CustomFilaLineaAgrupadaProps) {
  const total = linea.cantidad * linea.valorUnitario - linea.descuento;

  return (
    <tr className="hover:bg-slate-50">
      <td className="px-3 py-2 font-bold text-slate-700">{linea.codigo}</td>
      <td className="px-3 py-2 text-slate-600">{linea.descripcion}</td>
      <td className="px-3 py-2 text-center text-slate-600">{linea.moneda}</td>
      <td className="px-3 py-2 text-center text-slate-600">{linea.cantidad}</td>
      <td className="px-3 py-2 text-right text-slate-600">
        {formatearMontoDosDecimales(linea.valorUnitario)}
      </td>
      <td className="px-3 py-2 text-center text-slate-600">
        {formatearMontoDosDecimales(linea.descuento)}
      </td>
      <td className="px-3 py-2 text-right font-medium text-slate-700">
        {formatearMontoDosDecimales(total)}
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center justify-end gap-1">
          <CustomButton
            variant="ghost"
            size="icon"
            onClick={() => onEditar(linea)}
            aria-label={`Editar línea ${linea.codigo}`}
          >
            <Pencil size={14} className="text-slate-500" />
          </CustomButton>
          <CustomButton
            variant="ghost"
            size="icon"
            onClick={() => onEliminar(linea)}
            aria-label={`Eliminar línea ${linea.codigo}`}
          >
            <Trash2 size={14} className="text-red-500" />
          </CustomButton>
        </div>
      </td>
    </tr>
  );
}
