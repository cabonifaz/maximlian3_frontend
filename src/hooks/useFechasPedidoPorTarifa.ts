import { useCallback } from "react";
import type { UseFormSetValue } from "react-hook-form";
import type { PedidoFormData } from "@maximilian/schemas";
import type { TarifarioCortaEntry } from "@maximilian/shared/types/cliente.type";
import { sumarDias } from "@maximilian/shared/utils/fecha-pedido.util";

interface ParametrosUseFechasPedidoPorTarifa {
  setValue: UseFormSetValue<PedidoFormData>;
  habilitado: boolean;
}

export function useFechasPedidoPorTarifa({
  setValue,
  habilitado,
}: ParametrosUseFechasPedidoPorTarifa) {
  return useCallback(
    (tarifa: TarifarioCortaEntry | undefined) => {
      if (!habilitado || !tarifa) return;
      const hoy = new Date();
      setValue("fechaDesde", hoy, { shouldValidate: true, shouldDirty: true });
      setValue("fechaHasta", sumarDias(hoy, tarifa.diasMin), {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [habilitado, setValue],
  );
}
