import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRetardo } from "@maximilian/hooks/useRetardo";
import { facturacionService } from "@maximilian/services/facturacion.service";
import {
  CONFIGURACION_CONSULTA_FACTURACION,
  INTERVALO_RECARGA_LISTADO_FACTURAS_MS,
  RETARDO_CIERRE_SUBMENU_ACCIONES_FACTURA_MS,
  TAMANO_PAGINA_LISTADO_FACTURAS,
} from "@maximilian/shared/constants/components/coordinador/facturacion.constants";
import type {
  DatosFormularioAnulacionManualFactura,
  DatosFormularioExportarLibroVentas,
} from "@maximilian/schemas";
import type {
  EntradaListaFactura,
  ErrorDocumentoFactura,
  FormatoDescargaFactura,
} from "@maximilian/shared/types/facturacion.type";
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
  const [enlaceFactura, setEnlaceFactura] = useState("");
  const [cargandoEnlace, setCargandoEnlace] = useState(false);
  const [facturaErrores, setFacturaErrores] =
    useState<EntradaListaFactura | null>(null);
  const [erroresFactura, setErroresFactura] = useState<ErrorDocumentoFactura[]>([]);
  const [cargandoErrores, setCargandoErrores] = useState(false);
  const [idSubmenuDescargaActivo, setIdSubmenuDescargaActivo] =
    useState<number | null>(null);
  const [idSubmenuOperacionesActivo, setIdSubmenuOperacionesActivo] =
    useState<number | null>(null);
  const [idSubmenuEstadoActivo, setIdSubmenuEstadoActivo] =
    useState<number | null>(null);
  const temporizadorCierreSubmenuRef = useRef<number | null>(null);
  const [modalExportarLibroAbierto, setModalExportarLibroAbierto] =
    useState(false);
  const [exportandoLibro, setExportandoLibro] = useState(false);
  const [facturaAdvertenciaAnulacionManual, setFacturaAdvertenciaAnulacionManual] =
    useState<EntradaListaFactura | null>(null);
  const [facturaFormularioAnulacionManual, setFacturaFormularioAnulacionManual] =
    useState<EntradaListaFactura | null>(null);
  const [enviandoAnulacionManual, setEnviandoAnulacionManual] = useState(false);
  const [facturaEliminarBorrador, setFacturaEliminarBorrador] =
    useState<EntradaListaFactura | null>(null);
  const [eliminandoBorrador, setEliminandoBorrador] = useState(false);
  const queryClient = useQueryClient();
  const terminoConRetardo = useRetardo(terminoBusqueda);
  const fechaDesdeIso = fechaDesde ? formatearFechaIsoLocal(fechaDesde) : undefined;
  const fechaHastaIso = fechaHasta ? formatearFechaIsoLocal(fechaHasta) : undefined;
  const fechasInvalidas = Boolean(
    fechaDesde && fechaHasta && fechaDesde > fechaHasta,
  );

  const estadoCodigoSeleccionado =
    idEstadoSeleccionado !== undefined ? String(idEstadoSeleccionado) : undefined;

  const {
    data: respuesta,
    isError,
    isLoading,
    refetch,
  } = useQuery({
    ...CONFIGURACION_CONSULTA_FACTURACION,
    refetchInterval: INTERVALO_RECARGA_LISTADO_FACTURAS_MS,
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

  const cancelarCierreSubmenuProgramado = () => {
    if (temporizadorCierreSubmenuRef.current !== null) {
      window.clearTimeout(temporizadorCierreSubmenuRef.current);
      temporizadorCierreSubmenuRef.current = null;
    }
  };

  useEffect(() => cancelarCierreSubmenuProgramado, []);

  const cerrarSubmenus = () => {
    cancelarCierreSubmenuProgramado();
    setIdSubmenuDescargaActivo(null);
    setIdSubmenuOperacionesActivo(null);
    setIdSubmenuEstadoActivo(null);
  };

  const programarCierreSubmenu = (cerrar: () => void) => {
    cancelarCierreSubmenuProgramado();
    temporizadorCierreSubmenuRef.current = window.setTimeout(() => {
      temporizadorCierreSubmenuRef.current = null;
      cerrar();
    }, RETARDO_CIERRE_SUBMENU_ACCIONES_FACTURA_MS);
  };

  const alternarMenu = (
    evento: MouseEvent<HTMLButtonElement>,
    factura: EntradaListaFactura,
  ) => {
    if (idMenuActivo === factura.idDocumentoElectronico) {
      setIdMenuActivo(null);
      cerrarSubmenus();
      return;
    }

    const rectangulo = evento.currentTarget.getBoundingClientRect();
    const altoMenu = 260;
    const espacioInferior = window.innerHeight - rectangulo.bottom;
    const top = espacioInferior < altoMenu
      ? rectangulo.top - altoMenu - 4
      : rectangulo.bottom + 4;
    setEstiloMenu({
      top,
      right: window.innerWidth - rectangulo.right,
    });
    setIdMenuActivo(factura.idDocumentoElectronico);
    cerrarSubmenus();
  };

  const abrirEnlace = async (factura: EntradaListaFactura) => {
    setFacturaEnlace(factura);
    setEnlaceFactura("");
    setIdMenuActivo(null);
    setCargandoEnlace(true);
    try {
      const url = await facturacionService.obtenerUrlVerificacionFactura(
        factura.idDocumentoElectronico,
      );
      setEnlaceFactura(url);
    } catch {
      // manejado por el interceptor
    } finally {
      setCargandoEnlace(false);
    }
  };

  const abrirErrores = async (factura: EntradaListaFactura) => {
    setFacturaErrores(factura);
    setErroresFactura([]);
    setIdMenuActivo(null);
    setCargandoErrores(true);
    try {
      const errores = await facturacionService.obtenerErroresUltimoEnvio(
        factura.idDocumentoElectronico,
      );
      setErroresFactura(errores);
    } catch {
      setFacturaErrores(null);
    } finally {
      setCargandoErrores(false);
    }
  };

  const abrirSubmenuDescarga = (factura: EntradaListaFactura) => {
    cerrarSubmenus();
    setIdSubmenuDescargaActivo(factura.idDocumentoElectronico);
  };

  const cerrarSubmenuDescarga = () =>
    programarCierreSubmenu(() => setIdSubmenuDescargaActivo(null));

  const abrirSubmenuOperaciones = (factura: EntradaListaFactura) => {
    cerrarSubmenus();
    setIdSubmenuOperacionesActivo(factura.idDocumentoElectronico);
  };

  const cerrarSubmenuOperaciones = () =>
    programarCierreSubmenu(() => setIdSubmenuOperacionesActivo(null));

  const abrirSubmenuEstado = (factura: EntradaListaFactura) => {
    cerrarSubmenus();
    setIdSubmenuEstadoActivo(factura.idDocumentoElectronico);
  };

  const cerrarSubmenuEstado = () =>
    programarCierreSubmenu(() => setIdSubmenuEstadoActivo(null));

  const descargarFactura = async (
    factura: EntradaListaFactura,
    formato: FormatoDescargaFactura,
  ) => {
    setIdMenuActivo(null);
    cerrarSubmenus();
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

  const abrirAnulacionManual = (factura: EntradaListaFactura) => {
    setFacturaAdvertenciaAnulacionManual(factura);
    setIdMenuActivo(null);
  };

  const cerrarAdvertenciaAnulacionManual = () =>
    setFacturaAdvertenciaAnulacionManual(null);

  const confirmarAdvertenciaAnulacionManual = () => {
    setFacturaFormularioAnulacionManual(facturaAdvertenciaAnulacionManual);
    setFacturaAdvertenciaAnulacionManual(null);
  };

  const cerrarFormularioAnulacionManual = () =>
    setFacturaFormularioAnulacionManual(null);

  const confirmarFormularioAnulacionManual = async (
    datos: DatosFormularioAnulacionManualFactura,
  ) => {
    if (!facturaFormularioAnulacionManual) return;

    setEnviandoAnulacionManual(true);
    try {
      await facturacionService.anularManualmente(
        facturaFormularioAnulacionManual.idDocumentoElectronico,
        {
          motivo: datos.motivo,
          fechaAnulacion: formatearFechaIsoLocal(datos.fechaAnulacion),
        },
      );
      await queryClient.invalidateQueries({ queryKey: ["facturacion"] });
      setFacturaFormularioAnulacionManual(null);
    } catch {
      // manejado por el interceptor
    } finally {
      setEnviandoAnulacionManual(false);
    }
  };

  const abrirEliminarBorrador = (factura: EntradaListaFactura) => {
    setFacturaEliminarBorrador(factura);
    setIdMenuActivo(null);
  };

  const cerrarEliminarBorrador = () => setFacturaEliminarBorrador(null);

  const confirmarEliminarBorrador = async () => {
    if (!facturaEliminarBorrador) return;

    setEliminandoBorrador(true);
    try {
      await facturacionService.eliminarBorrador(
        facturaEliminarBorrador.idDocumentoElectronico,
      );
      await queryClient.invalidateQueries({ queryKey: ["facturacion"] });
      setFacturaEliminarBorrador(null);
    } catch {
      // manejado por el interceptor
    } finally {
      setEliminandoBorrador(false);
    }
  };

  const abrirModalExportarLibro = () => setModalExportarLibroAbierto(true);

  const cerrarModalExportarLibro = () => setModalExportarLibroAbierto(false);

  const exportarLibroVentas = async (
    datos: DatosFormularioExportarLibroVentas,
  ) => {
    setExportandoLibro(true);
    try {
      const periodo = formatearFechaIsoLocal(datos.mes);
      const { archivo, nombreArchivo } =
        await facturacionService.exportarLibroVentas(periodo);
      const url = URL.createObjectURL(archivo);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = nombreArchivo;
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      setModalExportarLibroAbierto(false);
    } catch {
      // manejado por el interceptor
    } finally {
      setExportandoLibro(false);
    }
  };

  return {
    abrirAnulacionManual,
    abrirEliminarBorrador,
    abrirEnlace,
    abrirErrores,
    abrirModalExportarLibro,
    abrirSubmenuDescarga,
    abrirSubmenuEstado,
    abrirSubmenuOperaciones,
    alternarMenu,
    cambiarBusqueda,
    cambiarEstado,
    cambiarFechaDesde,
    cambiarFechaHasta,
    cambiarFormaPago,
    cambiarPagina: setPaginaActual,
    cargandoEnlace,
    cargandoErrores,
    cerrarAdvertenciaAnulacionManual,
    cerrarEnlace: () => {
      setFacturaEnlace(null);
      setEnlaceFactura("");
    },
    cerrarErrores: () => {
      setFacturaErrores(null);
      setErroresFactura([]);
    },
    cerrarEliminarBorrador,
    cerrarFormularioAnulacionManual,
    cerrarMenu: () => {
      setIdMenuActivo(null);
      cerrarSubmenus();
    },
    cerrarModalExportarLibro,
    cerrarSubmenuDescarga,
    cerrarSubmenuEstado,
    cerrarSubmenuOperaciones,
    confirmarAdvertenciaAnulacionManual,
    confirmarEliminarBorrador,
    confirmarFormularioAnulacionManual,
    descargarFactura,
    eliminandoBorrador,
    enlaceFactura,
    enviandoAnulacionManual,
    erroresFactura,
    estiloMenu,
    exportandoLibro,
    exportarLibroVentas,
    facturaAdvertenciaAnulacionManual,
    facturaEliminarBorrador,
    facturaEnlace,
    facturaErrores,
    facturaFormularioAnulacionManual,
    facturasPagina: respuesta?.items ?? [],
    fechaDesde,
    fechaHasta,
    fechasInvalidas,
    idEstadoSeleccionado,
    idFormaPagoSeleccionada,
    idMenuActivo,
    idSubmenuDescargaActivo,
    idSubmenuEstadoActivo,
    idSubmenuOperacionesActivo,
    isError,
    isLoading,
    modalExportarLibroAbierto,
    paginaActual,
    refetch,
    terminoBusqueda,
    totalPaginas: respuesta?.totalPaginas ?? 1,
    totalRegistros: respuesta?.totalRegistros ?? 0,
  };
}
