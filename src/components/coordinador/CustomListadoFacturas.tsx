import { Search } from 'lucide-react';
import { CustomTabla } from '@maximilian/components/common/CustomTabla';
import { CustomModalConfirmacionAccion } from '@maximilian/components/common/CustomModalConfirmacionAccion';
import { CustomFilaListadoFactura } from '@maximilian/components/coordinador/CustomFilaListadoFactura';
import { CustomFiltroColumnaFactura } from '@maximilian/components/coordinador/CustomFiltroColumnaFactura';
import { CustomModalEnlaceFactura } from '@maximilian/components/coordinador/CustomModalEnlaceFactura';
import { CustomModalDetalleFacturaMock } from '@maximilian/components/coordinador/CustomModalDetalleFacturaMock';
import { useListadoFacturas } from '@maximilian/hooks/useListadoFacturas';
import {
  COLUMNAS_LISTADO_FACTURAS,
  OPCIONES_ESTADO_FACTURA_MOCK,
  OPCIONES_FORMA_PAGO_FACTURA_MOCK,
} from '@maximilian/shared/constants/components/coordinador/facturacion.constants';

export function CustomListadoFacturas() {
  const listado = useListadoFacturas();
  const columnas = COLUMNAS_LISTADO_FACTURAS.map(
    (columna, indice) => {
      if (indice === 2) {
        return {
          ...columna,
          label: (
            <CustomFiltroColumnaFactura
              titulo='Fecha de emisión'
              fechaDesde={listado.fechaDesde}
              fechaHasta={listado.fechaHasta}
              onCambiarFechaDesde={listado.cambiarFechaDesde}
              onCambiarFechaHasta={listado.cambiarFechaHasta}
            />
          ),
        };
      }

      if (indice === 3) {
        return {
          ...columna,
          label: (
            <CustomFiltroColumnaFactura
              titulo='Forma de pago'
              valor={listado.formaPagoSeleccionada}
              opciones={OPCIONES_FORMA_PAGO_FACTURA_MOCK}
              onChange={listado.cambiarFormaPago}
            />
          ),
        };
      }

      if (indice === 5) {
        return {
          ...columna,
          label: (
            <CustomFiltroColumnaFactura
              titulo='Estado'
              valor={listado.estadoSeleccionado}
              opciones={OPCIONES_ESTADO_FACTURA_MOCK}
              onChange={listado.cambiarEstado}
            />
          ),
        };
      }

      return columna;
    },
  );

  return (
    <div className='space-y-5'>
      <div className='relative w-full max-w-md'>
        <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
        <input
          type='text'
          placeholder='Buscar por factura, cliente, estado o forma de pago'
          value={listado.terminoBusqueda}
          onChange={(evento) =>
            listado.cambiarBusqueda(evento.target.value)
          }
          className='w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-brand-wine focus:ring-4 focus:ring-brand-wine/10'
        />
      </div>

      <CustomTabla
        columns={columnas}
        data={listado.facturasPagina}
        getId={(factura) => factura.idDocumentoElectronico}
        renderRow={(factura) => (
          <CustomFilaListadoFactura
            factura={factura}
            menuActivo={
              listado.idMenuActivo ===
              factura.idDocumentoElectronico
            }
            submenuDescargaActivo={
              listado.idSubmenuDescargaActivo ===
              factura.idDocumentoElectronico
            }
            estiloMenu={listado.estiloMenu}
            onAlternarMenu={listado.alternarMenu}
            onCerrarMenu={listado.cerrarMenu}
            onGenerarUrl={listado.abrirEnlace}
            onVer={listado.abrirDetalle}
            onAnular={listado.solicitarAnulacion}
            onAlternarDescarga={listado.alternarSubmenuDescarga}
            onDescargar={listado.descargarFactura}
          />
        )}
        emptyMessage='No se encontraron facturas.'
        paginaActual={listado.paginaActual}
        totalPages={listado.totalPaginas}
        totalRecords={listado.totalRegistros}
        onPageChange={listado.cambiarPagina}
        entityLabel='facturas'
      />

      <CustomModalEnlaceFactura
        key={
          listado.facturaEnlace?.idDocumentoElectronico ?? 'cerrado'
        }
        abierto={listado.facturaEnlace !== null}
        factura={listado.facturaEnlace}
        enlace={listado.enlaceFactura}
        onCerrar={listado.cerrarEnlace}
      />

      <CustomModalDetalleFacturaMock
        key={
          listado.facturaDetalle?.idDocumentoElectronico ?? 'sin-detalle'
        }
        abierto={listado.facturaDetalle !== null}
        factura={listado.facturaDetalle}
        onCerrar={listado.cerrarDetalle}
      />

      <CustomModalConfirmacionAccion
        isOpen={listado.facturaAAnular !== null}
        onClose={listado.cerrarAnulacion}
        onConfirm={listado.confirmarAnulacion}
        title='Anular factura'
        descripcion='La factura cambiará al estado Anulada en esta demostración.'
        textoConfirmar='Anular factura'
        varianteConfirmar='danger'
      >
        <p className='font-semibold text-brand-black'>
          {listado.facturaAAnular?.numeroFactura}
        </p>
        <p>{listado.facturaAAnular?.cliente}</p>
      </CustomModalConfirmacionAccion>
    </div>
  );
}
