import { useMemo, useState, type CSSProperties, type MouseEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRetardo } from "@maximilian/hooks/useRetardo";
import { facturacionService } from "@maximilian/services/facturacion.service";
import {
  CONFIGURACION_CONSULTA_FACTURACION,
  TAMANO_PAGINA_LISTADO_FACTURAS,
  URL_PUBLICA_FACTURA_MOCK,
} from "@maximilian/shared/constants/components/coordinador/facturacion.constants";
import type {
  EntradaListaFactura,
  FormatoDescargaFactura,
} from "@maximilian/shared/types/facturacion.type";

export function useListadoFacturas() {
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("");
  const [idFormaPagoSeleccionada, setIdFormaPagoSeleccionada] = useState<
    number | undefined
  >();
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [idMenuActivo, setIdMenuActivo] = useState<number | null>(null);
  const [estiloMenu, setEstiloMenu] = useState<CSSProperties>({});
  const [facturaEnlace, setFacturaEnlace] =
    useState<EntradaListaFactura | null>(null);
  const [idSubmenuDescargaActivo, setIdSubmenuDescargaActivo] =
    useState<number | null>(null);
  const terminoConRetardo = useRetardo(terminoBusqueda);

  const {
    data: respuesta,
    isError,
    isLoading,
    refetch,
  } = useQuery({
    ...CONFIGURACION_CONSULTA_FACTURACION,
    queryKey: [
      "facturacion",
      "facturas",
      paginaActual,
      TAMANO_PAGINA_LISTADO_FACTURAS,
      terminoConRetardo,
      estadoSeleccionado,
      idFormaPagoSeleccionada,
      fechaDesde,
      fechaHasta,
    ],
    queryFn: () =>
      facturacionService.listarFacturas({
        estadoCodigo: estadoSeleccionado || undefined,
        idFormaPago: idFormaPagoSeleccionada,
        fechaDesde: fechaDesde || undefined,
        fechaHasta: fechaHasta || undefined,
        busqueda: terminoConRetardo || undefined,
        pagina: paginaActual,
        tamanoPagina: TAMANO_PAGINA_LISTADO_FACTURAS,
      }),
  });

  const opcionesEstado = useMemo(() => {
    const estados = new Set(
      respuesta?.items.map((factura) => factura.estado) ?? [],
    );
    if (estadoSeleccionado) estados.add(estadoSeleccionado);

    return Array.from(estados).map((estado) => ({
      valor: estado,
      etiqueta: estado,
    }));
  }, [estadoSeleccionado, respuesta?.items]);

  const reiniciarPagina = () => setPaginaActual(1);

  const cambiarBusqueda = (valor: string) => {
    setTerminoBusqueda(valor);
    reiniciarPagina();
  };

  const cambiarEstado = (valor: string) => {
    setEstadoSeleccionado(valor);
    reiniciarPagina();
  };

  const cambiarFormaPago = (valor: number | undefined) => {
    setIdFormaPagoSeleccionada(valor);
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
    evento: MouseEvent<HTMLButtonElement>,
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
    const contenido = formato === "xml"
      ? `<factura><numero>${factura.numeroFactura}</numero></factura>`
      : `FACTURA ${factura.numeroFactura}`;
    const archivo = new Blob([contenido], {
      type: formato === "xml" ? "application/xml" : "application/pdf",
    });
    const url = URL.createObjectURL(archivo);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = `${factura.numeroFactura}.${formato}`;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    URL.revokeObjectURL(url);
    setIdMenuActivo(null);
    setIdSubmenuDescargaActivo(null);
  };

  return {
    abrirEnlace,
    alternarMenu,
    alternarSubmenuDescarga,
    cambiarBusqueda,
    cambiarEstado,
    cambiarFechaDesde,
    cambiarFechaHasta,
    cambiarFormaPago,
    cambiarPagina: setPaginaActual,
    cerrarEnlace: () => setFacturaEnlace(null),
    cerrarMenu: () => {
      setIdMenuActivo(null);
      setIdSubmenuDescargaActivo(null);
    },
    descargarFactura,
    enlaceFactura: facturaEnlace
      ? URL_PUBLICA_FACTURA_MOCK
        + encodeURIComponent(facturaEnlace.numeroFactura)
      : "",
    estadoSeleccionado,
    estiloMenu,
    facturaEnlace,
    facturasPagina: respuesta?.items ?? [],
    fechaDesde,
    fechaHasta,
    idFormaPagoSeleccionada,
    idMenuActivo,
    idSubmenuDescargaActivo,
    isError,
    isLoading,
    opcionesEstado,
    paginaActual,
    refetch,
    terminoBusqueda,
    totalPaginas: respuesta?.totalPaginas ?? 1,
    totalRegistros: respuesta?.totalRegistros ?? 0,
  };
}
