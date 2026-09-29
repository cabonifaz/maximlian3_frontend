import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router";
import { servicioInformeAprobacion } from "@maximilian/services/informe-aprobacion.service";
import { CLAVE_CONSULTA_INFORMES_PENDIENTES_APROBACION } from "@maximilian/shared/constants/pages/Coordinador/aprobacion-migraciones.constants";
import type { RegistroInformePendienteAprobacion } from "@maximilian/shared/types/informe-aprobacion.type";
import { formatearFechaUtcALocal } from "@maximilian/shared/utils/fecha.util";

export function useRevisionMigracionCoordinador() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { idInforme } = useParams();
  const [parametrosBusqueda] = useSearchParams();
  const registro = useLocation().state as RegistroInformePendienteAprobacion | null;
  const [estaAbiertoModalAprobar, setEstaAbiertoModalAprobar] = useState(false);
  const idInformeNumerico = Number(idInforme);
  const idPedidoNumerico = Number(parametrosBusqueda.get("idPedido"));
  const esIdentificadorValido = Number.isFinite(idInformeNumerico) && idInformeNumerico > 0
    && Number.isFinite(idPedidoNumerico) && idPedidoNumerico > 0;

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
    idInforme: idInformeNumerico,
    idPedido: idPedidoNumerico,
    registro,
    setEstaAbiertoModalAprobar,
    volverBandeja,
  };
}
