import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router";
import { useOpcionesMaestrosVistaPreviaInforme } from "@maximilian/hooks/useOpcionesMaestrosVistaPreviaInforme";
import { informeService } from "@maximilian/services/informe.service";
import { servicioInformeAprobacion } from "@maximilian/services/informe-aprobacion.service";
import {
  CLAVE_CONSULTA_INFORME_REVISION_MIGRACION,
  CLAVE_CONSULTA_INFORMES_PENDIENTES_APROBACION,
  MODO_VISTA_REVISION_MIGRACION_POR_DEFECTO,
} from "@maximilian/shared/constants/pages/Coordinador/aprobacion-migraciones.constants";
import type {
  ModoVistaRevisionMigracion,
  RegistroInformePendienteAprobacion,
} from "@maximilian/shared/types/informe-aprobacion.type";
import { formatearFechaUtcALocal } from "@maximilian/shared/utils/fecha.util";
import { traducirMaestrosDatosInvestigacion } from "@maximilian/shared/utils/investigacion/traducir-maestros-informe.util";
import { tieneTraduccionTablaMaestra } from "@maximilian/shared/utils/tabla-maestra-idioma.util";

export function useRevisionMigracionCoordinador() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { idInforme } = useParams();
  const [parametrosBusqueda] = useSearchParams();
  const registro = useLocation().state as RegistroInformePendienteAprobacion | null;
  const [estaAbiertoModalAprobar, setEstaAbiertoModalAprobar] = useState(false);
  const [modoVista, setModoVista] = useState<ModoVistaRevisionMigracion>(
    MODO_VISTA_REVISION_MIGRACION_POR_DEFECTO,
  );
  const idInformeNumerico = Number(idInforme);
  const idPedidoNumerico = Number(parametrosBusqueda.get("idPedido"));
  const esIdentificadorValido = Number.isFinite(idInformeNumerico) && idInformeNumerico > 0
    && Number.isFinite(idPedidoNumerico) && idPedidoNumerico > 0;

  const { data: informeObtenido, isLoading: estaCargandoInforme } = useQuery({
    queryKey: [CLAVE_CONSULTA_INFORME_REVISION_MIGRACION, idInformeNumerico, idPedidoNumerico],
    queryFn: () => informeService.obtener({ idPedido: idPedidoNumerico, idInforme: idInformeNumerico }),
    enabled: esIdentificadorValido,
  });

  const idIdiomaInforme = informeObtenido?.idIdioma;
  const debeTraducirMaestros = tieneTraduccionTablaMaestra(idIdiomaInforme);
  const opcionesMaestros = useOpcionesMaestrosVistaPreviaInforme(debeTraducirMaestros, idIdiomaInforme);
  const datosInvestigacion = useMemo(() => {
    if (!informeObtenido) return undefined;
    if (!debeTraducirMaestros || !opcionesMaestros) return informeObtenido.datosInvestigacion;
    return traducirMaestrosDatosInvestigacion(informeObtenido, opcionesMaestros);
  }, [debeTraducirMaestros, informeObtenido, opcionesMaestros]);

  const volverBandeja = () => navigate("/coordinador/migraciones");

  const mutacionAprobar = useMutation({
    mutationFn: () => servicioInformeAprobacion.aprobar({ idInformes: [idInformeNumerico] }),
    onSuccess: async () => {
      setEstaAbiertoModalAprobar(false);
      await queryClient.invalidateQueries({ queryKey: [CLAVE_CONSULTA_INFORMES_PENDIENTES_APROBACION] });
      volverBandeja();
    },
  });

  const cerrarModalAprobar = () => {
    if (mutacionAprobar.isPending) return;
    setEstaAbiertoModalAprobar(false);
  };

  return {
    cerrarModalAprobar,
    confirmarAprobacion: () => mutacionAprobar.mutate(),
    datosInvestigacion,
    encabezado: {
      pais: registro?.pais ?? "-",
      fecha: registro ? formatearFechaUtcALocal(registro.fecha) : "-",
      tipoSolicitud: "Migracion",
      analista: registro?.usuario ?? "-",
      traductor: "-",
    },
    esIdentificadorValido,
    estaAbiertoModalAprobar,
    estaAprobando: mutacionAprobar.isPending,
    estaCargandoInforme,
    idIdiomaInforme,
    idInforme: idInformeNumerico,
    idPedido: idPedidoNumerico,
    modoVista,
    registro,
    setEstaAbiertoModalAprobar,
    setModoVista,
    volverBandeja,
  };
}
