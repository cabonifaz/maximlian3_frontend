import { AlertTriangle, FileDown, Search } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomModalConfirmacionAccion } from "@maximilian/components/common/CustomModalConfirmacionAccion";
import { CustomTabla } from "@maximilian/components/common/CustomTabla";
import { CustomFilaListadoFactura } from "@maximilian/components/coordinador/CustomFilaListadoFactura";
import { CustomFiltroColumnaFactura } from "@maximilian/components/coordinador/CustomFiltroColumnaFactura";
import { CustomModalEnlaceFactura } from "@maximilian/components/coordinador/CustomModalEnlaceFactura";
import { CustomModalErroresFactura } from "@maximilian/components/coordinador/CustomModalErroresFactura";
import { CustomModalExportarLibroVentas } from "@maximilian/components/coordinador/CustomModalExportarLibroVentas";
import { CustomModalFormularioAnulacionManual } from "@maximilian/components/coordinador/CustomModalFormularioAnulacionManual";
import { useListadoFacturas } from "@maximilian/hooks/useListadoFacturas";
import { COLUMNAS_LISTADO_FACTURAS } from "@maximilian/shared/constants/components/coordinador/facturacion.constants";
import type { EntradaListaFactura } from "@maximilian/shared/types/facturacion.type";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";

interface PropsCustomListadoFacturas {
  onVerFactura: (factura: EntradaListaFactura) => void;
  onAnularFactura: (factura: EntradaListaFactura) => void;
  onCrearNotaCreditoDebito: (factura: EntradaListaFactura) => void;
  onEditarFactura: (factura: EntradaListaFactura) => void;
}

export function CustomListadoFacturas({
  onVerFactura,
  onAnularFactura,
  onCrearNotaCreditoDebito,
  onEditarFactura,
}: PropsCustomListadoFacturas) {
  const listado = useListadoFacturas();
  const columnas = COLUMNAS_LISTADO_FACTURAS.map((columna, indice) => {
    if (indice === 3) {
      return {
        ...columna,
        label: (
          <CustomFiltroColumnaFactura
            titulo="Fecha de emisión"
            fechaDesde={listado.fechaDesde}
            fechaHasta={listado.fechaHasta}
            fechasInvalidas={listado.fechasInvalidas}
            onCambiarFechaDesde={listado.cambiarFechaDesde}
            onCambiarFechaHasta={listado.cambiarFechaHasta}
          />
        ),
      };
    }

    if (indice === 4) {
      return {
        ...columna,
        label: (
          <CustomFiltroColumnaFactura
            titulo="Forma de pago"
            idMaster={TablaMaestraId.FORMA_PAGO_SUNAT}
            valorId={listado.idFormaPagoSeleccionada}
            onCambiarId={listado.cambiarFormaPago}
          />
        ),
      };
    }

    if (indice === 6) {
      return {
        ...columna,
        label: (
          <CustomFiltroColumnaFactura
            titulo="Estado"
            idMaster={TablaMaestraId.ESTADO_DOCUMENTO_ELECTRONICO}
            valorId={listado.idEstadoSeleccionado}
            onCambiarId={listado.cambiarEstado}
          />
        ),
      };
    }

    return columna;
  });

  const verFactura = (factura: EntradaListaFactura) => {
    listado.cerrarMenu();
    onVerFactura(factura);
  };

  const anularFactura = (factura: EntradaListaFactura) => {
    listado.cerrarMenu();
    onAnularFactura(factura);
  };

  const anularFacturaManualmente = (factura: EntradaListaFactura) => {
    listado.abrirAnulacionManual(factura);
  };

  const crearNotaCreditoDebito = (factura: EntradaListaFactura) => {
    listado.cerrarMenu();
    onCrearNotaCreditoDebito(factura);
  };

  const editarFactura = (factura: EntradaListaFactura) => {
    listado.cerrarMenu();
    onEditarFactura(factura);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por factura o cliente"
            value={listado.terminoBusqueda}
            onChange={(evento) => listado.cambiarBusqueda(evento.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-brand-wine focus:ring-4 focus:ring-brand-wine/10"
          />
        </div>
        <CustomButton
          variant="wine"
          size="sm"
          onClick={listado.abrirModalExportarLibro}
        >
          <FileDown size={14} />
          Exportar Libro electrónico de ventas
        </CustomButton>
      </div>

      <CustomTabla
        columns={columnas}
        data={listado.facturasPagina}
        getId={(factura) => factura.idDocumentoElectronico}
        renderRow={(factura) => (
          <CustomFilaListadoFactura
            factura={factura}
            menuActivo={listado.idMenuActivo === factura.idDocumentoElectronico}
            submenuDescargaActivo={
              listado.idSubmenuDescargaActivo === factura.idDocumentoElectronico
            }
            estiloMenu={listado.estiloMenu}
            onAlternarMenu={listado.alternarMenu}
            onCerrarMenu={listado.cerrarMenu}
            onGenerarUrl={listado.abrirEnlace}
            onVer={verFactura}
            onAnular={anularFactura}
            onAnularManualmente={anularFacturaManualmente}
            onCrearNotaCreditoDebito={crearNotaCreditoDebito}
            onEditar={editarFactura}
            onAlternarDescarga={listado.alternarSubmenuDescarga}
            onDescargar={listado.descargarFactura}
            onVerErrores={listado.abrirErrores}
          />
        )}
        isLoading={listado.isLoading}
        isError={listado.isError}
        onRetry={() => void listado.refetch()}
        emptyMessage="No se encontraron facturas."
        errorMessage="Error al cargar las facturas."
        paginaActual={listado.paginaActual}
        totalPages={listado.totalPaginas}
        totalRecords={listado.totalRegistros}
        onPageChange={listado.cambiarPagina}
        entityLabel="facturas"
      />

      <CustomModalEnlaceFactura
        key={listado.facturaEnlace?.idDocumentoElectronico ?? "cerrado"}
        abierto={listado.facturaEnlace !== null}
        factura={listado.facturaEnlace}
        enlace={listado.enlaceFactura}
        cargando={listado.cargandoEnlace}
        onCerrar={listado.cerrarEnlace}
      />

      <CustomModalErroresFactura
        key={listado.facturaErrores?.idDocumentoElectronico ?? "cerrado"}
        abierto={listado.facturaErrores !== null}
        factura={listado.facturaErrores}
        errores={listado.erroresFactura}
        cargando={listado.cargandoErrores}
        onCerrar={listado.cerrarErrores}
      />

      <CustomModalConfirmacionAccion
        isOpen={listado.facturaAdvertenciaAnulacionManual !== null}
        onClose={listado.cerrarAdvertenciaAnulacionManual}
        onConfirm={listado.confirmarAdvertenciaAnulacionManual}
        title="Anular manualmente"
        descripcion="Vas a marcar este comprobante como anulado solo en Safety Report. Verifica los datos antes de continuar."
        textoConfirmar="Sí, ya fue anulado en SUNAT"
        varianteConfirmar="danger"
        anchoMaximoClassName="max-w-md"
        zIndexClassName="z-[95]"
      >
        <p className="text-sm font-semibold text-slate-700">
          {listado.facturaAdvertenciaAnulacionManual?.numeroFactura} · {listado.facturaAdvertenciaAnulacionManual?.cliente}
        </p>
        <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-red-700">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <p className="text-sm font-medium leading-snug">
            Acción crítica: úsala únicamente si este comprobante <span className="font-bold">ya fue anulado en SUNAT</span>.
            Esta opción solo actualiza el estado aquí en Safety Report y <span className="font-bold">no envía ninguna solicitud de anulación a SUNAT</span>.
          </p>
        </div>
      </CustomModalConfirmacionAccion>

      <CustomModalFormularioAnulacionManual
        key={listado.facturaFormularioAnulacionManual?.idDocumentoElectronico ?? "cerrado"}
        abierto={listado.facturaFormularioAnulacionManual !== null}
        cargando={listado.enviandoAnulacionManual}
        numeroFactura={listado.facturaFormularioAnulacionManual?.numeroFactura}
        onCerrar={listado.cerrarFormularioAnulacionManual}
        onConfirmar={listado.confirmarFormularioAnulacionManual}
      />

      <CustomModalExportarLibroVentas
        abierto={listado.modalExportarLibroAbierto}
        cargando={listado.exportandoLibro}
        onCerrar={listado.cerrarModalExportarLibro}
        onConfirmar={listado.exportarLibroVentas}
      />
    </div>
  );
}
