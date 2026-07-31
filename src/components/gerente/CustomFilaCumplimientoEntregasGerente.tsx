import { NumberTicker } from "@maximilian/components/common/shadcn/number-ticker";
import type { ResumenUsuarioDashboard } from "@maximilian/shared/types/dashboard.type";
import { obtenerCantidadDecimales } from "@maximilian/shared/utils/numero.util";

interface PropsCustomFilaCumplimientoEntregasGerente {
  usuario: ResumenUsuarioDashboard;
}

export function CustomFilaCumplimientoEntregasGerente({
  usuario,
}: PropsCustomFilaCumplimientoEntregasGerente) {
  return (
    <>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
            style={{
              color: usuario.colorLetra,
              backgroundColor: usuario.colorFondo,
            }}
          >
            {usuario.iniciales}
          </span>
          <div className="min-w-0">
            <strong
              className="block truncate text-xs text-slate-700"
              title={usuario.nombreCompleto}
            >
              {usuario.nombreCompleto}
            </strong>
            <span className="text-[10px] text-slate-400">
              {usuario.descripcionRol}
            </span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <NumberTicker
          value={usuario.ordenes}
          className="text-xs font-bold tracking-normal text-slate-700"
        />
      </td>
      <td
        className="px-6 py-4 text-xs font-bold"
        style={{ color: usuario.colorLetra }}
      >
        <NumberTicker
          value={usuario.cumplimiento}
          decimalPlaces={obtenerCantidadDecimales(usuario.cumplimiento)}
          className="tracking-normal text-inherit"
        />
        % (
        <NumberTicker
          value={usuario.aTiempo}
          className="tracking-normal text-inherit"
        />
        )
      </td>
      <td className="px-6 py-4">
        <span
          className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold"
          style={{
            color: usuario.colorLetra,
            backgroundColor: usuario.colorFondo,
          }}
        >
          <span
            className="h-2 w-2 rounded-full border"
            style={{ borderColor: usuario.colorLetra }}
          />
          {usuario.descripcionEficiencia}
        </span>
      </td>
    </>
  );
}
