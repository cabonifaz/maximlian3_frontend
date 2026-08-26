import { useMemo, useState } from "react";
import { Combine, FileSpreadsheet, FileText, Layers, MoreHorizontal, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { CustomTabla } from "@maximilian/components/common/CustomTabla";
import { CustomEncabezadoFiltroTabla } from "@maximilian/components/common/CustomEncabezadoFiltroTabla";
import { CustomModalFactura } from "@maximilian/components/coordinador/CustomModalFactura";
import { CustomModalGestionLineasAgrupadas } from "@maximilian/components/coordinador/CustomModalGestionLineasAgrupadas";
import { CustomModalProductosFactura } from "@maximilian/components/coordinador/CustomModalProductosFactura";
import { CustomModalGenerarPrefactura } from "@maximilian/components/coordinador/CustomModalGenerarPrefactura";
import { useFiltrosFacturacion } from "@maximilian/hooks/useFiltrosFacturacion";
import { useRetardo } from "@maximilian/hooks/useRetardo";
import type { ModoFormularioFactura } from "@maximilian/hooks/useFormularioFactura";
import { facturacionService } from "@maximilian/services/facturacion.service";
import {
  COLUMNAS_FACTURACION,
  CONFIGURACION_CONSULTA_FACTURACION,
  ESTADO_CODIGO_FACTURA_ACEPTADA,
  ID_ESTADO_FACTURA_APROBADA,
  PESTANAS_GESTION_FACTURACION,
  type PestanaGestionFacturacion,
} from "@maximilian/shared/constants/components/coordinador/facturacion.constants";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import type {
  DetalleFactura,
  EntradaFacturaCliente,
  EntradaFacturacion,
  EntradaListaFactura,
  EntradaProductoFacturable,
} from "@maximilian/shared/types/facturacion.type";

import { CustomListadoFacturas } from '@maximilian/components/coordinador/CustomListadoFacturas';

export default function GestionFacturacion() {
  const [pestanaActiva, setPestanaActiva] =
    useState<PestanaGestionFacturacion>('facturas');
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [idMenuActivo, setIdMenuActivo] = useState<number | null>(null);
  const [menuDropdownStyle, setMenuDropdownStyle] = useState<React.CSSProperties>({});
  const [clienteParaAgruparPedidos, setClienteParaAgruparPedidos] = useState<EntradaFacturacion | null>(null);
  const [clienteParaGestionarLineas, setClienteParaGestionarLineas] = useState<EntradaFacturacion | null>(null);
  const [clienteParaPrefactura, setClienteParaPrefactura] = useState<EntradaFacturacion | null>(null);
  const [modalFactura, setModalFactura] = useState<{
    modo: ModoFormularioFactura;
    detalle: DetalleFactura | null;
    productosIniciales: EntradaProductoFacturable[];
    abrirAnulacionInicial?: boolean;
  } | null>(null);

  const busquedaConRetardo = useRetardo(terminoBusqueda);
  const {
    cambiarIdiomas,
    cambiarPrefacturables,
    emitirPrefactura,
    idIdiomaFacturacion,
    idsIdioma,
    idsPrefacturable,
  } = useFiltrosFacturacion(() => setPaginaActual(1));

  const {
    data: facturacionData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    ...CONFIGURACION_CONSULTA_FACTURACION,
    queryKey: [
      "facturacion",
      paginaActual,
      busquedaConRetardo,
      emitirPrefactura,
      idIdiomaFacturacion,
    ],
    enabled: pestanaActiva === 'clientes',
    queryFn: () =>
      facturacionService.list({
        numPag: paginaActual,
        busqueda: busquedaConRetardo || undefined,
        emitirPrefactura,
        idIdiomaFacturacion,
      }),
  });

  const facturaciones = useMemo(
    () => facturacionData?.lstFacturacion ?? [],
    [facturacionData?.lstFacturacion],
  );

  const columnas = COLUMNAS_FACTURACION.map((columna, indice) => {
    if (indice === 1) {
      return {
        ...columna,
        label: (
          <CustomEncabezadoFiltroTabla
            titulo="Requiere prefactura"
            idMaster={TablaMaestraId.EMITIR_PREFACTURA}
            valores={idsPrefacturable}
            onChange={cambiarPrefacturables}
            multiple={false}
          />
        ),
      };
    }

    if (indice === 4) {
      return {
        ...columna,
        label: (
          <CustomEncabezadoFiltroTabla
            titulo="Idioma de facturación"
            idMaster={TablaMaestraId.IDIOMA}
            valores={idsIdioma}
            onChange={cambiarIdiomas}
            multiple={false}
          />
        ),
      };
    }

    return columna;
  });

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
    const altoMenu = 136;
    const espacioInferior = window.innerHeight - rect.bottom;
    const top = espacioInferior < altoMenu ? rect.top - altoMenu - 4 : rect.bottom + 4;
    setMenuDropdownStyle({ top, right: window.innerWidth - rect.right });
    setIdMenuActivo(facturacion.idFacturacion);
  };

  const abrirDetalleFacturaListado = async (
    factura: EntradaListaFactura,
    abrirAnulacionInicial = false,
  ) => {
    try {
      const detalle =
        await facturacionService.obtenerDetalleFacturaPorDocumento(
          factura.idDocumentoElectronico,
          factura.estado === ESTADO_CODIGO_FACTURA_ACEPTADA
            ? ID_ESTADO_FACTURA_APROBADA
            : null,
          factura.estado,
          factura.documentoAfectado !== null,
        );
      setModalFactura({
        modo: "detalle",
        detalle,
        productosIniciales: [],
        abrirAnulacionInicial,
      });
    } catch {
      return;
    }
  };

  const abrirNotaCreditoDebito = async (factura: EntradaListaFactura) => {
    try {
      const detalle = await facturacionService.obtenerDetalleFacturaPorDocumento(
        factura.idDocumentoElectronico,
        ID_ESTADO_FACTURA_APROBADA,
        factura.estado,
      );
      setModalFactura({
        modo: "notaCreditoDebito",
        detalle,
        productosIniciales: [],
      });
    } catch {
      return;
    }
  };

  const abrirEdicionFacturaListado = async (factura: EntradaListaFactura) => {
    try {
      const detalle = await facturacionService.obtenerDetalleFacturaPorDocumento(
        factura.idDocumentoElectronico,
        null,
        factura.estado,
        factura.documentoAfectado !== null,
      );
      setModalFactura({
        modo: detalle.esNotaCreditoDebito ? "editarNotaCreditoDebito" : "emitir",
        detalle,
        productosIniciales: [],
      });
    } catch {
      return;
    }
  };

  const abrirEmisionFactura = async (facturacion: EntradaFacturacion, factura?: EntradaFacturaCliente | null) => {
    try {
      const detalle = await facturacionService.obtenerDetalleFactura(
        facturacion.idFacturacion,
        facturacion.cliente,
        factura,
      );
      setModalFactura({ modo: "emitir", detalle, productosIniciales: [] });
    } catch {
      return;
    }
  };

  const renderRow = (facturacion: EntradaFacturacion) => (
    <>
      <td className="px-6 py-4">
        <span className="block max-w-56 truncate text-sm font-bold text-brand-black">
          {facturacion.cliente}
        </span>
      </td>
      <td className="px-6 py-4 text-center text-sm font-medium text-slate-600">
        {facturacion.prefacturable === null
          ? "-"
          : facturacion.prefacturable
            ? "Sí"
            : "No"}
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
                  setClienteParaAgruparPedidos(facturacion);
                  setIdMenuActivo(null);
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
              >
                <Combine size={14} className="shrink-0" />
                <span>Agrupar Pedidos</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  abrirEmisionFactura(facturacion);
                  setIdMenuActivo(null);
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
              >
                <FileText size={14} className="shrink-0" />
                <span>Emitir Factura</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setClienteParaPrefactura(facturacion);
                  setIdMenuActivo(null);
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
              >
                <FileSpreadsheet size={14} className="shrink-0" />
                <span>Generar Prefactura</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setClienteParaGestionarLineas(facturacion);
                  setIdMenuActivo(null);
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
              >
                <Layers size={14} className="shrink-0" />
                <span>Gestionar Líneas Agrupadas</span>
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
        <div
          className="flex gap-6 border-b border-slate-200"
          role="tablist"
          aria-label="Secciones de facturación"
        >
          {PESTANAS_GESTION_FACTURACION.map((pestana) => (
            <button
              key={pestana.id}
              type="button"
              role="tab"
              aria-selected={pestanaActiva === pestana.id}
              onClick={() => setPestanaActiva(pestana.id)}
              className={
                "relative px-1 pb-3 text-sm font-semibold transition-colors " +
                (pestanaActiva === pestana.id
                  ? "text-brand-wine after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-brand-wine"
                  : "text-slate-400 hover:text-slate-700")
              }
            >
              {pestana.etiqueta}
            </button>
          ))}
        </div>
        {pestanaActiva === "clientes" ? (
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
        ) : null}
      </div>

      {pestanaActiva === "facturas" ? (
        <CustomListadoFacturas
          onVerFactura={(factura) => {
            void abrirDetalleFacturaListado(factura);
          }}
          onAnularFactura={(factura) => {
            void abrirDetalleFacturaListado(factura, true);
          }}
          onCrearNotaCreditoDebito={(factura) => {
            void abrirNotaCreditoDebito(factura);
          }}
          onEditarFactura={(factura) => {
            void abrirEdicionFacturaListado(factura);
          }}
        />
      ) : (
        <>
      <CustomTabla
        columns={columnas}
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
      {clienteParaAgruparPedidos ? (
        <CustomModalProductosFactura
          abierto={clienteParaAgruparPedidos !== null}
          idCliente={clienteParaAgruparPedidos.idFacturacion}
          idDocumentoElectronico={null}
          onCerrar={() => setClienteParaAgruparPedidos(null)}
          onLineaCreada={() => setClienteParaAgruparPedidos(null)}
        />
      ) : null}
      {clienteParaGestionarLineas ? (
        <CustomModalGestionLineasAgrupadas
          abierto={clienteParaGestionarLineas !== null}
          idCliente={clienteParaGestionarLineas.idFacturacion}
          onCerrar={() => setClienteParaGestionarLineas(null)}
        />
      ) : null}
        </>
      )}
      <CustomModalFactura
        key={modalFactura
          ? `${modalFactura.modo}-${modalFactura.detalle?.idDocumentoElectronico ?? modalFactura.detalle?.idFactura ?? "nueva"}`
          : "cerrada"}
        abierto={modalFactura !== null}
        modo={modalFactura?.modo ?? "detalle"}
        factura={modalFactura?.detalle ?? null}
        productosIniciales={modalFactura?.productosIniciales ?? []}
        abrirAnulacionInicial={modalFactura?.abrirAnulacionInicial}
        onCerrar={() => setModalFactura(null)}
      />
      {clienteParaPrefactura ? (
        <CustomModalGenerarPrefactura
          abierto={clienteParaPrefactura !== null}
          idCliente={clienteParaPrefactura.idFacturacion}
          cliente={clienteParaPrefactura.cliente}
          onCerrar={() => setClienteParaPrefactura(null)}
        />
      ) : null}
    </div>
  );
}
