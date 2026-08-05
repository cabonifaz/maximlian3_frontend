import { useMemo, useState } from 'react';
import { useRetardo } from '@maximilian/hooks/useRetardo';
import {
  CANTIDAD_FACTURAS_POR_PAGINA_MOCK,
  FACTURAS_MOCK,
  URL_PUBLICA_FACTURA_MOCK,
} from '@maximilian/shared/constants/components/coordinador/facturacion.constants';
import type {
  EntradaListaFactura,
  FormatoDescargaFactura,
} from '@maximilian/shared/types/facturacion.type';

export function useListadoFacturas() {
  const [facturas, setFacturas] =
    useState<EntradaListaFactura[]>(FACTURAS_MOCK);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('');
  const [formaPagoSeleccionada, setFormaPagoSeleccionada] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [idMenuActivo, setIdMenuActivo] = useState<number | null>(null);
  const [estiloMenu, setEstiloMenu] = useState<React.CSSProperties>({});
  const [facturaEnlace, setFacturaEnlace] =
    useState<EntradaListaFactura | null>(null);
  const [facturaDetalle, setFacturaDetalle] =
    useState<EntradaListaFactura | null>(null);
  const [facturaAAnular, setFacturaAAnular] =
    useState<EntradaListaFactura | null>(null);
  const [idSubmenuDescargaActivo, setIdSubmenuDescargaActivo] =
    useState<number | null>(null);
  const terminoConRetardo = useRetardo(terminoBusqueda);

  const facturasFiltradas = useMemo(() => {
    const termino = terminoConRetardo.toLocaleLowerCase();

    return facturas.filter((factura) => {
      const coincideBusqueda =
        !termino ||
        factura.numeroFactura.toLocaleLowerCase().includes(termino) ||
        factura.cliente.toLocaleLowerCase().includes(termino) ||
        factura.formaPago.toLocaleLowerCase().includes(termino) ||
        factura.estado.toLocaleLowerCase().includes(termino);
      const coincideEstado =
        !estadoSeleccionado || factura.estado === estadoSeleccionado;
      const coincideFormaPago =
        !formaPagoSeleccionada ||
        factura.formaPago === formaPagoSeleccionada;
      const coincideFechaDesde =
        !fechaDesde || factura.fechaEmision >= fechaDesde;
      const coincideFechaHasta =
        !fechaHasta || factura.fechaEmision <= fechaHasta;

      return (
        coincideBusqueda &&
        coincideEstado &&
        coincideFormaPago &&
        coincideFechaDesde &&
        coincideFechaHasta
      );
    });
  }, [
    estadoSeleccionado,
    fechaDesde,
    fechaHasta,
    facturas,
    formaPagoSeleccionada,
    terminoConRetardo,
  ]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(
      facturasFiltradas.length / CANTIDAD_FACTURAS_POR_PAGINA_MOCK,
    ),
  );
  const facturasPagina = facturasFiltradas.slice(
    (paginaActual - 1) * CANTIDAD_FACTURAS_POR_PAGINA_MOCK,
    paginaActual * CANTIDAD_FACTURAS_POR_PAGINA_MOCK,
  );

  const reiniciarPagina = () => setPaginaActual(1);

  const cambiarBusqueda = (valor: string) => {
    setTerminoBusqueda(valor);
    reiniciarPagina();
  };

  const cambiarEstado = (valor: string) => {
    setEstadoSeleccionado(valor);
    reiniciarPagina();
  };

  const cambiarFormaPago = (valor: string) => {
    setFormaPagoSeleccionada(valor);
    reiniciarPagina();
  };

  const cambiarFechaDesde = (valor: string) => {
    setFechaDesde(valor);
    reiniciarPagina();
  };

  const cambiarFechaHasta = (valor: string) => {
    setFechaHasta(valor);
    reiniciarPagina();
  };

  const alternarMenu = (
    evento: React.MouseEvent<HTMLButtonElement>,
    factura: EntradaListaFactura,
  ) => {
    if (idMenuActivo === factura.idDocumentoElectronico) {
      setIdMenuActivo(null);
      setIdSubmenuDescargaActivo(null);
      return;
    }

    const rectangulo = evento.currentTarget.getBoundingClientRect();
    setEstiloMenu({
      top: rectangulo.bottom + 4,
      right: window.innerWidth - rectangulo.right,
    });
    setIdMenuActivo(factura.idDocumentoElectronico);
    setIdSubmenuDescargaActivo(null);
  };

  const abrirEnlace = (factura: EntradaListaFactura) => {
    setFacturaEnlace(factura);
    setIdMenuActivo(null);
  };

  const abrirDetalle = (factura: EntradaListaFactura) => {
    setFacturaDetalle(factura);
    setIdMenuActivo(null);
  };

  const solicitarAnulacion = (factura: EntradaListaFactura) => {
    setFacturaAAnular(factura);
    setIdMenuActivo(null);
  };

  const confirmarAnulacion = () => {
    if (!facturaAAnular) return;

    setFacturas((facturasActuales) =>
      facturasActuales.map((factura) =>
        factura.idDocumentoElectronico ===
        facturaAAnular.idDocumentoElectronico
          ? { ...factura, estado: 'Anulada' }
          : factura,
      ),
    );
    setFacturaAAnular(null);
  };

  const alternarSubmenuDescarga = (factura: EntradaListaFactura) => {
    setIdSubmenuDescargaActivo((idActual) =>
      idActual === factura.idDocumentoElectronico
        ? null
        : factura.idDocumentoElectronico,
    );
  };

  const descargarFactura = (
    factura: EntradaListaFactura,
    formato: FormatoDescargaFactura,
  ) => {
    const contenido =
      formato === 'xml'
        ? '<factura>\n' +
          '  <numero>' + factura.numeroFactura + '</numero>\n' +
          '  <cliente>' + factura.cliente + '</cliente>\n' +
          '  <fechaEmision>' + factura.fechaEmision + '</fechaEmision>\n' +
          '  <formaPago>' + factura.formaPago + '</formaPago>\n' +
          '  <moneda>' + factura.moneda + '</moneda>\n' +
          '  <total>' + factura.totalImporte + '</total>\n' +
          '  <estado>' + factura.estado + '</estado>\n' +
          '</factura>'
        : 'FACTURA ' + factura.numeroFactura + '\n\n' +
          'Cliente: ' + factura.cliente + '\n' +
          'Fecha de emision: ' + factura.fechaEmision + '\n' +
          'Forma de pago: ' + factura.formaPago + '\n' +
          'Total: ' + factura.moneda + ' ' + factura.totalImporte + '\n' +
          'Estado: ' + factura.estado;
    const archivo = new Blob([contenido], {
      type: formato === 'xml' ? 'application/xml' : 'application/pdf',
    });
    const url = URL.createObjectURL(archivo);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = factura.numeroFactura + '.' + formato;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    URL.revokeObjectURL(url);
    setIdMenuActivo(null);
    setIdSubmenuDescargaActivo(null);
  };

  return {
    abrirDetalle,
    abrirEnlace,
    alternarMenu,
    alternarSubmenuDescarga,
    cambiarBusqueda,
    cambiarEstado,
    cambiarFechaDesde,
    cambiarFechaHasta,
    cambiarFormaPago,
    cerrarAnulacion: () => setFacturaAAnular(null),
    cerrarDetalle: () => setFacturaDetalle(null),
    cerrarEnlace: () => setFacturaEnlace(null),
    cerrarMenu: () => {
      setIdMenuActivo(null);
      setIdSubmenuDescargaActivo(null);
    },
    confirmarAnulacion,
    descargarFactura,
    enlaceFactura: facturaEnlace
      ? URL_PUBLICA_FACTURA_MOCK +
        encodeURIComponent(facturaEnlace.numeroFactura)
      : '',
    estadoSeleccionado,
    estiloMenu,
    facturaAAnular,
    facturaDetalle,
    facturaEnlace,
    facturasPagina,
    fechaDesde,
    fechaHasta,
    formaPagoSeleccionada,
    idMenuActivo,
    idSubmenuDescargaActivo,
    paginaActual,
    terminoBusqueda,
    totalPaginas,
    totalRegistros: facturasFiltradas.length,
    solicitarAnulacion,
    cambiarPagina: setPaginaActual,
  };
}
