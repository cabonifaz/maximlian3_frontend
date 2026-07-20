import { useMemo, useState } from "react";
import { Eye, FileText, MoreHorizontal, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { CustomTabla } from "@maximilian/components/common/CustomTabla";
import { CustomModalFactura } from "@maximilian/components/coordinador/CustomModalFactura";
import { CustomModalFacturasCliente } from "@maximilian/components/coordinador/CustomModalFacturasCliente";
import { useRetardo } from "@maximilian/hooks/useRetardo";
import { facturacionService } from "@maximilian/services/facturacion.service";
import type {
  DetalleFactura,
  EntradaFacturaCliente,
  EntradaFacturacion,
  EstadoFacturacion,
} from "@maximilian/shared/types/facturacion.type";

const COLUMNAS_FACTURACION = [
  { label: "Cliente" },
  { label: "Prefacturable", className: "text-center" },
  { label: "Total Pedidos", className: "text-center" },
  { label: "Total Facturados", className: "text-center" },
  { label: "Idioma", className: "text-center" },
  { label: "Estado", className: "text-center" },
  { label: "", className: "text-right w-16" },
];

const ESTILOS_ESTADO: Record<EstadoFacturacion, { texto: string; clase: string }> = {
  finalizado: {
    texto: "Finalizado",
    clase: "bg-emerald-100 text-emerald-600",
  },
  pendiente: {
    texto: "Pendiente",
    clase: "bg-orange-100 text-orange-600",
  },
  "en-pre-factura": {
    texto: "En pre-factura",
    clase: "bg-blue-100 text-blue-600",
  },
  "pre-factura-aprobada": {
    texto: "Pre-factura aprobada",
    clase: "bg-cyan-100 text-cyan-700",
  },
  "pre-factura-rechazada": {
    texto: "Pre-factura rechazada",
    clase: "bg-red-100 text-red-600",
  },
};

function EstadoBadge({ estado }: { estado: EstadoFacturacion }) {
  const configuracion = ESTILOS_ESTADO[estado];

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${configuracion.clase}`}>
      {configuracion.texto}
    </span>
  );
}

export default function GestionFacturacion() {
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [idMenuActivo, setIdMenuActivo] = useState<number | null>(null);
  const [menuDropdownStyle, setMenuDropdownStyle] = useState<React.CSSProperties>({});
  const [clienteSeleccionado, setClienteSeleccionado] = useState<EntradaFacturacion | null>(null);
  const [modalFactura, setModalFactura] = useState<{
    modo: "emitir" | "detalle";
    detalle: DetalleFactura | null;
  } | null>(null);

  const busquedaConRetardo = useRetardo(terminoBusqueda);

  const {
    data: facturacionData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["facturacion", paginaActual, busquedaConRetardo],
    queryFn: () =>
      facturacionService.list({
        numPag: paginaActual,
        busqueda: busquedaConRetardo || undefined,
      }),
  });

  const { data: facturasCliente = [] } = useQuery({
    queryKey: ["facturacion", "facturas-cliente", clienteSeleccionado?.idFacturacion],
    queryFn: () => facturacionService.listarFacturasCliente(),
    enabled: clienteSeleccionado !== null,
  });

  const { data: productosFacturables = [] } = useQuery({
    queryKey: ["facturacion", "productos-facturables"],
    queryFn: () => facturacionService.listarProductosFacturables(),
    enabled: modalFactura?.modo === "emitir",
  });

  const facturaciones = useMemo(
    () => facturacionData?.lstFacturacion ?? [],
    [facturacionData?.lstFacturacion],
  );

  const handleCambiarBusqueda = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTerminoBusqueda(event.target.value);
    setPaginaActual(1);
  };

  const handleAbrirMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
    facturacion: EntradaFacturacion,
  ) => {
    if (idMenuActivo === facturacion.idFacturacion) {
      setIdMenuActivo(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const altoMenu = 92;
    const espacioInferior = window.innerHeight - rect.bottom;
    const top = espacioInferior < altoMenu ? rect.top - altoMenu - 4 : rect.bottom + 4;
    setMenuDropdownStyle({ top, right: window.innerWidth - rect.right });
    setIdMenuActivo(facturacion.idFacturacion);
  };

  const abrirDetalleFactura = async (facturacion: EntradaFacturacion, factura?: EntradaFacturaCliente | null) => {
    const detalle = await facturacionService.obtenerDetalleFactura(facturacion.cliente, factura);
    setModalFactura({ modo: "detalle", detalle });
  };

  const abrirEmisionFactura = async (facturacion: EntradaFacturacion, factura?: EntradaFacturaCliente | null) => {
    const detalle = await facturacionService.obtenerDetalleFactura(facturacion.cliente, factura);
    setModalFactura({ modo: "emitir", detalle });
  };

  const renderRow = (facturacion: EntradaFacturacion) => (
    <>
      <td className="px-6 py-4">
        <span className="block max-w-56 truncate text-sm font-bold text-brand-black">
          {facturacion.cliente}
        </span>
      </td>
      <td className="px-6 py-4 text-center text-sm font-medium text-slate-600">
        {facturacion.prefacturable ? "Sí" : "No"}
      </td>
      <td className="px-6 py-4 text-center text-sm font-medium text-slate-600">
        {facturacion.totalPedidos}
      </td>
      <td className="px-6 py-4 text-center text-sm font-medium text-slate-600">
        {facturacion.totalFacturados}
      </td>
      <td className="px-6 py-4 text-center text-sm font-medium text-slate-600">
        {facturacion.idioma}
      </td>
      <td className="px-6 py-4 text-center">
        <EstadoBadge estado={facturacion.estado} />
      </td>
      <td className="px-6 py-4 text-right">
        <button
          type="button"
          onClick={(event) => handleAbrirMenu(event, facturacion)}
          className="rounded-lg p-2 text-slate-400 transition-all hover:bg-slate-100 hover:text-brand-black active:scale-95"
          aria-label={`Acciones de facturación para ${facturacion.cliente}`}
        >
          <MoreHorizontal size={18} />
        </button>

        {idMenuActivo === facturacion.idFacturacion ? (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIdMenuActivo(null)} />
            <div
              className="fixed z-20 w-52 rounded-lg border border-slate-200 bg-white py-1 shadow-xl"
              style={menuDropdownStyle}
            >
              <button
                type="button"
                onClick={() => {
                  setClienteSeleccionado(facturacion);
                  setIdMenuActivo(null);
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
              >
                <Eye size={14} />
                <span>Detalle de la facturación</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  abrirEmisionFactura(facturacion);
                  setIdMenuActivo(null);
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
              >
                <FileText size={14} />
                <span>Generar facturación</span>
              </button>
            </div>
          </>
        ) : null}
      </td>
    </>
  );

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <h1 className="text-2xl font-bold text-brand-black">Facturación</h1>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar factura"
            value={terminoBusqueda}
            onChange={handleCambiarBusqueda}
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-brand-wine focus:ring-4 focus:ring-brand-wine/10"
          />
        </div>
      </div>

      <CustomTabla
        columns={COLUMNAS_FACTURACION}
        data={facturaciones}
        getId={(facturacion) => facturacion.idFacturacion}
        renderRow={renderRow}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        emptyMessage="No se encontraron facturas."
        errorMessage="Error al cargar la facturación"
        paginaActual={paginaActual}
        totalPages={facturacionData?.totalPaginas ?? 1}
        totalRecords={facturacionData?.totalRegistros ?? 0}
        onPageChange={setPaginaActual}
        entityLabel="facturas"
      />
      {clienteSeleccionado ? (
        <CustomModalFacturasCliente
          abierto={clienteSeleccionado !== null}
          cliente={clienteSeleccionado.cliente}
          facturas={facturasCliente}
          onCerrar={() => setClienteSeleccionado(null)}
          onAgregarFactura={() => abrirEmisionFactura(clienteSeleccionado)}
          onVerFactura={(factura) => abrirDetalleFactura(clienteSeleccionado, factura)}
          onEditarFactura={(factura) => abrirEmisionFactura(clienteSeleccionado, factura)}
        />
      ) : null}
      <CustomModalFactura
        abierto={modalFactura !== null}
        modo={modalFactura?.modo ?? "detalle"}
        factura={modalFactura?.detalle ?? null}
        productosFacturables={productosFacturables}
        onCerrar={() => setModalFactura(null)}
      />
    </div>
  );
}
