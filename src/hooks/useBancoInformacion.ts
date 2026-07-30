import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ID_MAESTRO_ACTIVIDAD_ECONOMICA_EMPRESA,
  ID_MAESTRO_ESTADO_CREDITO,
  type PestanaBancoInformacion,
} from "@maximilian/shared/constants/components/common/custom-banco-informacion.constants";
import { useFiltroRangoFechas } from "@maximilian/hooks/useFiltroRangoFechas";
import { useRetardo } from "@maximilian/hooks/useRetardo";
import { servicioCompaniaNoticiaBalance } from "@maximilian/services/compania-noticia-balance.service";
import { servicioCompaniaNoticiaDetalle } from "@maximilian/services/compania-noticia-detalle.service";
import { servicioTablaMaestra } from "@maximilian/services/tabla-maestra.service";
import type { CompaniaNoticiaBalanceListaItem } from "@maximilian/shared/types/compania-noticia-balance.type";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";

function serializarIdsFiltro(ids: number[]) {
  return ids.length > 0 ? ids.join(",") : undefined;
}

export function useBancoInformacion() {
  const [pestanaActiva, setPestanaActiva] =
    useState<PestanaBancoInformacion>("noticias");
  const [busqueda, setBusqueda] = useState("");
  const [paginaCredito, setPaginaCredito] = useState(1);
  const [paginaEmpresas, setPaginaEmpresas] = useState(1);
  const [idsEstadoFinancieroFiltro, setIdsEstadoFinancieroFiltro] = useState<number[]>([]);
  const [idEstadoCreditoFiltro, setIdEstadoCreditoFiltro] = useState<number | undefined>();
  const [idsPaisEmpresaFiltro, setIdsPaisEmpresaFiltro] = useState<number[]>([]);
  const [idsActividadEconomicaEmpresaFiltro, setIdsActividadEconomicaEmpresaFiltro] =
    useState<number[]>([]);
  const [reporteDetalle, setReporteDetalle] =
    useState<CompaniaNoticiaBalanceListaItem | null>(null);
  const [idReporteCargandoDetalle, setIdReporteCargandoDetalle] = useState<number | null>(null);
  const [claveAgregarNoticia, setClaveAgregarNoticia] = useState(0);
  const busquedaConRetardo = useRetardo(busqueda);
  const filtroFechasCredito = useFiltroRangoFechas({
    onCambio: () => setPaginaCredito(1),
  });

  useEffect(() => {
    setPaginaCredito(1);
    setPaginaEmpresas(1);
  }, [busquedaConRetardo]);

  const { data: opcionesEstadoFinanciero } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.ESTADO_FINANCIERO],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.ESTADO_FINANCIERO),
    staleTime: Infinity,
  });

  const { data: opcionesEstadoCredito } = useQuery({
    queryKey: ["masterTable", ID_MAESTRO_ESTADO_CREDITO],
    queryFn: () => servicioTablaMaestra.list(ID_MAESTRO_ESTADO_CREDITO),
    staleTime: Infinity,
  });

  const tipoEstadoFinancieroFiltro = serializarIdsFiltro(idsEstadoFinancieroFiltro);
  const estadoCreditoFiltro =
    idEstadoCreditoFiltro != null ? String(idEstadoCreditoFiltro) : undefined;
  const {
    data: respuestaCredito,
    isLoading: estaCargandoCredito,
    isError: hayErrorCredito,
    refetch: recargarCredito,
  } = useQuery({
    queryKey: [
      "companiaNoticiaBalance",
      {
        busqueda: busquedaConRetardo,
        estado: estadoCreditoFiltro,
        tipoEstadoFinanciero: tipoEstadoFinancieroFiltro,
        fechaInicio: filtroFechasCredito.fechaInicioParametro,
        fechaFin: filtroFechasCredito.fechaFinParametro,
        numPag: paginaCredito,
      },
    ],
    queryFn: () =>
      servicioCompaniaNoticiaBalance.list({
        busqueda: busquedaConRetardo,
        estado: estadoCreditoFiltro,
        tipoEstadoFinanciero: tipoEstadoFinancieroFiltro,
        fechaInicio: filtroFechasCredito.fechaInicioParametro,
        fechaFin: filtroFechasCredito.fechaFinParametro,
        numPag: paginaCredito,
      }),
    enabled: pestanaActiva === "credito" && !filtroFechasCredito.fechasInvalidas,
  });

  const reportesCredito = respuestaCredito?.lstCompaniaNoticiaBalance ?? [];

  const {
    data: respuestaEmpresas,
    isLoading: estaCargandoEmpresas,
    isError: hayErrorEmpresas,
    refetch: recargarEmpresas,
  } = useQuery({
    queryKey: [
      "companiaNoticiaDetalle",
      {
        busqueda: busquedaConRetardo,
        actividades: serializarIdsFiltro(idsActividadEconomicaEmpresaFiltro),
        paises: serializarIdsFiltro(idsPaisEmpresaFiltro),
        numPag: paginaEmpresas,
      },
    ],
    queryFn: () =>
      servicioCompaniaNoticiaDetalle.list({
        busqueda: busquedaConRetardo,
        actividades: serializarIdsFiltro(idsActividadEconomicaEmpresaFiltro),
        paises: serializarIdsFiltro(idsPaisEmpresaFiltro),
        numPag: paginaEmpresas,
      }),
    enabled: pestanaActiva === "empresas",
  });

  const empresas = respuestaEmpresas?.lstCompaniaNoticiaDetalle ?? [];

  const { data: opcionesPaisEmpresa } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.PAIS],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.PAIS),
    staleTime: Infinity,
  });

  const { data: opcionesActividadEconomicaEmpresa } = useQuery({
    queryKey: ["masterTable", ID_MAESTRO_ACTIVIDAD_ECONOMICA_EMPRESA],
    queryFn: () => servicioTablaMaestra.list(ID_MAESTRO_ACTIVIDAD_ECONOMICA_EMPRESA),
    staleTime: Infinity,
  });

  const exportarEmpresasMutation = useMutation({
    mutationFn: () =>
      servicioCompaniaNoticiaDetalle.exportar({
        busqueda: busquedaConRetardo,
        actividades: serializarIdsFiltro(idsActividadEconomicaEmpresaFiltro),
        paises: serializarIdsFiltro(idsPaisEmpresaFiltro),
        numPag: paginaEmpresas,
      }),
    onSuccess: (respuesta) => {
      if (respuesta.downloadUrl) {
        window.open(respuesta.downloadUrl, "_blank", "noopener,noreferrer");
        return;
      }

      if (!respuesta.archivo) return;

      const url = URL.createObjectURL(respuesta.archivo);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.target = "_blank";
      enlace.rel = "noopener noreferrer";
      enlace.download = respuesta.nombreArchivo;
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    },
  });

  const verDetalleCredito = async (reporte: CompaniaNoticiaBalanceListaItem) => {
    setIdReporteCargandoDetalle(reporte.idInformeBalance);
    try {
      const detalle = await servicioCompaniaNoticiaBalance.obtener({
        idInformeBalance: reporte.idInformeBalance,
        idCompania: reporte.idCompania,
      });
      setReporteDetalle(detalle ?? reporte);
    } catch {
      setReporteDetalle(reporte);
    } finally {
      setIdReporteCargandoDetalle(null);
    }
  };

  const cambiarBusqueda = (valor: string) => {
    setBusqueda(valor);
    setPaginaEmpresas(1);
  };

  const cambiarEstadoFinancieroFiltro = (ids: number[]) => {
    setIdsEstadoFinancieroFiltro(ids);
    setPaginaCredito(1);
  };

  const cambiarEstadoCreditoFiltro = (ids: number[]) => {
    setIdEstadoCreditoFiltro(ids[ids.length - 1]);
    setPaginaCredito(1);
  };

  const cambiarPaisEmpresaFiltro = (ids: number[]) => {
    setIdsPaisEmpresaFiltro(ids);
    setPaginaEmpresas(1);
  };

  const cambiarActividadEconomicaEmpresaFiltro = (ids: number[]) => {
    setIdsActividadEconomicaEmpresaFiltro(ids);
    setPaginaEmpresas(1);
  };

  return {
    busqueda,
    busquedaConRetardo,
    cambiarActividadEconomicaEmpresaFiltro,
    cambiarBusqueda,
    cambiarEstadoCreditoFiltro,
    cambiarEstadoFinancieroFiltro,
    cambiarFechaFinCreditoFiltro: filtroFechasCredito.cambiarFechaFinFiltro,
    cambiarFechaInicioCreditoFiltro: filtroFechasCredito.cambiarFechaInicioFiltro,
    cambiarPaisEmpresaFiltro,
    claveAgregarNoticia,
    empresas,
    estaCargandoCredito,
    estaCargandoEmpresas,
    exportarEmpresasMutation,
    fechaFinCreditoFiltro: filtroFechasCredito.fechaFinFiltro,
    fechaInicioCreditoFiltro: filtroFechasCredito.fechaInicioFiltro,
    fechasCreditoInvalidas: filtroFechasCredito.fechasInvalidas,
    hayErrorCredito,
    hayErrorEmpresas,
    idEstadoCreditoFiltro,
    idReporteCargandoDetalle,
    idsActividadEconomicaEmpresaFiltro,
    idsEstadoFinancieroFiltro,
    idsPaisEmpresaFiltro,
    limpiarFechaFinCreditoFiltro: filtroFechasCredito.limpiarFechaFinFiltro,
    limpiarFechaInicioCreditoFiltro: filtroFechasCredito.limpiarFechaInicioFiltro,
    opcionesActividadEconomicaEmpresa,
    opcionesEstadoCredito,
    opcionesEstadoFinanciero,
    opcionesPaisEmpresa,
    paginaCredito,
    paginaEmpresas,
    pestanaActiva,
    recargarCredito,
    recargarEmpresas,
    reporteDetalle,
    reportesCredito,
    respuestaCredito,
    respuestaEmpresas,
    setClaveAgregarNoticia,
    setPaginaCredito,
    setPaginaEmpresas,
    setPestanaActiva,
    setReporteDetalle,
    verDetalleCredito,
  };
}
