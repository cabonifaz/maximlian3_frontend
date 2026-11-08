import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { informeService } from "@maximilian/services/informe.service";
import type { InformeHistorialCompania } from "@maximilian/shared/types/informe.type";
import type { DatosInvestigacionAnalista } from "@maximilian/shared/types/investigacion.type";
import { prepararDatosParaNuevoInforme } from "@maximilian/shared/utils/investigacion/investigacion-payload.util";

export function useRellenarDesdeInformeAnterior(
  onRellenar: (datos: DatosInvestigacionAnalista) => void,
) {
  const [informePendiente, setInformePendiente] = useState<InformeHistorialCompania | null>(null);
  const [idCompaniaPendiente, setIdCompaniaPendiente] = useState<number | undefined>(undefined);

  const mutacionRellenar = useMutation({
    mutationFn: async (informe: InformeHistorialCompania) => {
      const informeAnterior = await informeService.obtenerPorReferencia({
        idPedido: informe.idPedido,
        idInforme: informe.idInforme,
      });
      return informeAnterior.datosInvestigacion;
    },
    onSuccess: (datos) => {
      if (!datos) return;
      const datosSinIds = prepararDatosParaNuevoInforme(datos);
      onRellenar({
        ...datosSinIds,
        identificacion: {
          ...datosSinIds.identificacion,
          idCompania: datosSinIds.identificacion.idCompania ?? idCompaniaPendiente,
        },
        locales: datosSinIds.locales.map((local) => ({ ...local, imagenes: [] })),
      });
      setInformePendiente(null);
    },
  });

  return {
    informePendiente,
    estaRellenando: mutacionRellenar.isPending,
    solicitarRellenar: (informe: InformeHistorialCompania, idCompania?: number) => {
      setInformePendiente(informe);
      setIdCompaniaPendiente(idCompania);
    },
    cancelarRellenar: () => {
      if (!mutacionRellenar.isPending) setInformePendiente(null);
    },
    confirmarRellenar: () => {
      if (informePendiente) mutacionRellenar.mutate(informePendiente);
    },
  };
}
