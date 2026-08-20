import { CustomTabla } from "@maximilian/components/common/CustomTabla";
import { NumberTicker } from "@maximilian/components/common/shadcn/number-ticker";
import { COLUMNAS_TABLA_CLIENTES_FACTURACION_ANALITICA_DASHBOARD } from "@maximilian/shared/constants/components/gerente/facturacion-analitica-dashboard.constants";
import type { ResumenClienteFacturacionAnaliticaDashboard } from "@maximilian/shared/types/dashboard.type";

interface PropsCustomTablaClientesFacturacionAnaliticaGerente {
  resumenClientes: ResumenClienteFacturacionAnaliticaDashboard[];
}

export function CustomTablaClientesFacturacionAnaliticaGerente({
  resumenClientes,
}: PropsCustomTablaClientesFacturacionAnaliticaGerente) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-bold text-slate-800">Total facturado por cliente</h3>
      <p className="mb-5 text-[11px] text-slate-400">
        Totales globales, no varían con los filtros de esta sección.
      </p>

      <CustomTabla
        columns={COLUMNAS_TABLA_CLIENTES_FACTURACION_ANALITICA_DASHBOARD}
        data={resumenClientes}
        getId={(cliente) => cliente.idCliente}
        emptyMessage="No hay clientes con facturación registrada."
        paginaActual={1}
        totalPages={1}
        totalRecords={resumenClientes.length}
        onPageChange={() => undefined}
        entityLabel="clientes"
        cantidadFilasVisibles={Math.min(5, Math.max(resumenClientes.length, 1))}
        renderRow={(cliente) => (
          <>
            <td className="px-6 py-4 text-xs font-semibold text-slate-700">{cliente.cliente}</td>
            <td className="px-6 py-4 text-right text-xs font-bold text-slate-800">
              {cliente.monedaIcono}
              <NumberTicker
                value={cliente.totalFacturado}
                decimalPlaces={2}
                rigidez={260}
                className="tracking-normal text-inherit"
              />
            </td>
            <td className="px-6 py-4 text-center text-xs text-slate-600">
              <NumberTicker
                value={cliente.cantidadPedidos}
                rigidez={260}
                className="tracking-normal text-inherit"
              />
            </td>
            <td className="px-6 py-4 text-right text-xs text-slate-600">
              {cliente.monedaIcono}
              <NumberTicker
                value={cliente.montoPendienteFacturar}
                decimalPlaces={2}
                rigidez={260}
                className="tracking-normal text-inherit"
              />
            </td>
          </>
        )}
      />
    </section>
  );
}
