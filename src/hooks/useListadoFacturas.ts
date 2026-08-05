import { useMemo, useState, type CSSProperties, type MouseEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRetardo } from "@maximilian/hooks/useRetardo";
import { facturacionService } from "@maximilian/services/facturacion.service";
import { servicioTablaMaestra } from "@maximilian/services/tabla-maestra.service";
import {
  CONFIGURACION_CONSULTA_FACTURACION,
  TAMANO_PAGINA_LISTADO_FACTURAS,
  URL_PUBLICA_FACTURA_MOCK,
} from "@maximilian/shared/constants/components/coordinador/facturacion.constants";
import type { DatosFormularioCamposPdfFactura } from "@maximilian/schemas";
import type {
  EntradaListaFactura,
  FormatoDescargaFactura,
} from "@maximilian/shared/types/facturacion.type";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import { formatearFechaIsoLocal } from "@maximilian/shared/utils/fecha.util";

export function useListadoFacturas() {
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [idEstadoSeleccionado, setIdEstadoSeleccionado] = useState<
    number | undefined
  >();
  const [idFormaPagoSeleccionada, setIdFormaPagoSeleccionada] = useState<
    number | undefined
  >();
  const [fechaDesde, setFechaDesde] = useState<Date | undefined>();
  const [fechaHasta, setFechaHasta] = useState<Date | undefined>();
  const [idMenuActivo, setIdMenuActivo] = useState<number | null>(null);
  const [estiloMenu, setEstiloMenu] = useState<CSSProperties>({});
  const [facturaEnlace, setFacturaEnlace] =
    useState<EntradaListaFactura | null>(null);
  const [idSubmenuDescargaActivo, setIdSubmenuDescargaActivo] =
    useState<number | null>(null);
  const [idSubmenuPdfActivo, setIdSubmenuPdfActivo] =
    useState<number | null>(null);
  const [facturaCamposPdf, setFacturaCamposPdf] =
    useState<EntradaListaFactura | null>(null);
  const terminoConRetardo = useRetardo(terminoBusqueda);
  const fechaDesdeIso = fechaDesde ? formatearFechaIsoLocal(fechaDesde) : undefined;
  const fechaHastaIso = fechaHasta ? formatearFechaIsoLocal(fechaHasta) : undefined;
  const fechasInvalidas = Boolean(
    fechaDesde && fechaHasta && fechaDesde > fechaHasta,
  );

  const { data: opcionesEstadoMaestro } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.ESTADO_DOCUMENTO_ELECTRONICO],
    queryFn: () =>
      servicioTablaMaestra.list(TablaMaestraId.ESTADO_DOCUMENTO_ELECTRONICO),
    staleTime: Infinity,
  });

  const estadoCodigoSeleccionado = useMemo(
    () =>
      opcionesEstadoMaestro?.find(
        (opcion) => opcion.num1 === idEstadoSeleccionado,
      )?.string1?.trim(),
    [idEstadoSeleccionado, opcionesEstadoMaestro],
  );

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
      estadoCodigoSeleccionado,
      idFormaPagoSeleccionada,
      fechaDesdeIso,
      fechaHastaIso,
    ],
    queryFn: () =>
      facturacionService.listarFacturas({
        estadoCodigo: estadoCodigoSeleccionado || undefined,
        idFormaPago: idFormaPagoSeleccionada,
        fechaDesde: fechaDesdeIso,
        fechaHasta: fechaHastaIso,
        busqueda: terminoConRetardo || undefined,
        pagina: paginaActual,
        tamanoPagina: TAMANO_PAGINA_LISTADO_FACTURAS,
      }),
    enabled: !fechasInvalidas,
  });

  const reiniciarPagina = () => setPaginaActual(1);

  const cambiarBusqueda = (valor: string) => {
    setTerminoBusqueda(valor);
    reiniciarPagina();
  };

  const cambiarEstado = (valor: number | undefined) => {
    setIdEstadoSeleccionado(valor);
    reiniciarPagina();
  };

  const cambiarFormaPago = (valor: number | undefined) => {
    setIdFormaPagoSeleccionada(valor);
    reiniciarPagina();
  };

  const cambiarFechaDesde = (valor: Date | undefined) => {
    setFechaDesde(valor);
    reiniciarPagina();
  };

  const cambiarFechaHasta = (valor: Date | undefined) => {
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
      setIdSubmenuPdfActivo(null);
      return;
    }

    const rectangulo = evento.currentTarget.getBoundingClientRect();
    setEstiloMenu({
      top: rectangulo.bottom + 4,
      right: window.innerWidth - rectangulo.right,
    });
    setIdMenuActivo(factura.idDocumentoElectronico);
    setIdSubmenuDescargaActivo(null);
    setIdSubmenuPdfActivo(null);
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
    setIdSubmenuPdfActivo(null);
  };

  const alternarSubmenuPdf = (factura: EntradaListaFactura) => {
    setIdSubmenuPdfActivo((idActual) =>
      idActual === factura.idDocumentoElectronico
        ? null
        : factura.idDocumentoElectronico,
    );
  };

  const descargarFactura = async (
    factura: EntradaListaFactura,
    formato: FormatoDescargaFactura,
  ) => {
    setIdMenuActivo(null);
    setIdSubmenuDescargaActivo(null);
    setIdSubmenuPdfActivo(null);
    try {
      const urlDescarga = await facturacionService.obtenerUrlDescargaFactura(
        factura.idDocumentoElectronico,
        formato,
      );
      window.open(urlDescarga, "_blank", "noopener,noreferrer");
    } catch {
      // manejado por el interceptor
    }
  };

  const abrirCamposPdf = (factura: EntradaListaFactura) => {
    setFacturaCamposPdf(factura);
    setIdMenuActivo(null);
    setIdSubmenuDescargaActivo(null);
    setIdSubmenuPdfActivo(null);
  };

  const cerrarCamposPdf = () => setFacturaCamposPdf(null);

  const confirmarCamposPdf = async (datos: DatosFormularioCamposPdfFactura) => {
    if (!facturaCamposPdf) return;
    // TODO: la razón social capturada aún no se envía al backend; la
    // API de descarga (facturaPorId/{id}/urlDescarga) no expone ese campo.
    void datos;
    try {
      const urlDescarga = await facturacionService.obtenerUrlDescargaFactura(
        facturaCamposPdf.idDocumentoElectronico,
        "pdf",
      );
      window.open(urlDescarga, "_blank", "noopener,noreferrer");
    } catch {
      // manejado por el interceptor
    } finally {
      setFacturaCamposPdf(null);
    }
  };

  return {
    abrirCamposPdf,
    abrirEnlace,
    alternarMenu,
    alternarSubmenuDescarga,
    alternarSubmenuPdf,
    cambiarBusqueda,
    cambiarEstado,
    cambiarFechaDesde,
    cambiarFechaHasta,
    cambiarFormaPago,
    cambiarPagina: setPaginaActual,
    cerrarCamposPdf,
    cerrarEnlace: () => setFacturaEnlace(null),
    cerrarMenu: () => {
      setIdMenuActivo(null);
      setIdSubmenuDescargaActivo(null);
      setIdSubmenuPdfActivo(null);
    },
    confirmarCamposPdf,
    descargarFactura,
    enlaceFactura: facturaEnlace
      ? URL_PUBLICA_FACTURA_MOCK
        + encodeURIComponent(facturaEnlace.numeroFactura)
      : "",
    estiloMenu,
    facturaCamposPdf,
    facturaEnlace,
    facturasPagina: respuesta?.items ?? [],
    fechaDesde,
    fechaHasta,
    fechasInvalidas,
    idEstadoSeleccionado,
    idFormaPagoSeleccionada,
    idMenuActivo,
    idSubmenuDescargaActivo,
    idSubmenuPdfActivo,
    isError,
    isLoading,
    paginaActual,
    refetch,
    terminoBusqueda,
    totalPaginas: respuesta?.totalPaginas ?? 1,
    totalRegistros: respuesta?.totalRegistros ?? 0,
  };
}
