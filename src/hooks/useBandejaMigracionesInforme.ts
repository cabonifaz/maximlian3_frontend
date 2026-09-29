import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRetardo } from "@maximilian/hooks/useRetardo";
import { servicioInformeMigracion } from "@maximilian/services/informe-migracion.service";
import type { RolMigracionInforme } from "@maximilian/shared/types/informe-migracion.type";

export function useBandejaMigracionesInforme(rol: RolMigracionInforme) {
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const terminoBusquedaConRetardo = useRetardo(terminoBusqueda);

  const consulta = useQuery({
    queryKey: ["migraciones-informe", rol, paginaActual, terminoBusquedaConRetardo],
    queryFn: ({ signal }) =>
      servicioInformeMigracion.listar(
        {
          busqueda: terminoBusquedaConRetardo.trim() || undefined,
          numPag: paginaActual,
        },
        signal,
      ),
    enabled: terminoBusqueda.trim() === terminoBusquedaConRetardo,
    retry: false,
  });

  const tarjetasResumen = useMemo(() => {
    const respuesta = consulta.data;
    return [
      { id: "borrador", titulo: "Borradores", valor: respuesta?.borrador ?? 0 },
      { id: "proceso", titulo: "En proceso", valor: respuesta?.enProceso ?? 0 },
      { id: "pendiente", titulo: "Pendiente aprobación", valor: respuesta?.pendienteAprobacion ?? 0 },
      { id: "aprobado", titulo: "Aprobados", valor: respuesta?.aprobado ?? 0 },
      { id: "rechazado", titulo: "Rechazados", valor: respuesta?.rechazado ?? 0 },
    ];
  }, [consulta.data]);

  return {
    ...consulta,
    paginaActual,
    setPaginaActual,
    setTerminoBusqueda,
    tarjetasResumen,
    terminoBusqueda,
  };
}
