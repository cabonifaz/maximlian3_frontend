import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { RegistroPersonaAnalista } from "@maximilian/components/investigacion/CustomModalRegistroEmpresaRelacionada";
import { servicioCompania } from "@maximilian/services/compania.service";
import type { CompaniaListaItem } from "@maximilian/shared/types/compania.type";

function convertirRegistroACompania(registro: RegistroPersonaAnalista): CompaniaListaItem {
  return {
    idCompania: registro.idCompania ?? registro.id,
    idTipoPersona: registro.idTipoPersona,
    idTipoDocumento: registro.idTipoDocumento,
    idPais: registro.idPais,
    direccion: registro.direccion,
    ubigeo: registro.ubigeo,
    codigoPostal: registro.codigoPostal,
    numeroDocumento: registro.numeroDocumento ?? "",
    nombreCompleto: registro.nombres,
    pais: registro.pais,
    telefono: registro.telefono,
    existeInformacion: registro.textoExisteInformacion ?? "",
    tipoPersona: registro.tipoPersona,
  };
}

export function useCompaniaVinculada(idCompania?: number) {
  const queryClient = useQueryClient();
  const [estaCargandoDetalle, setEstaCargandoDetalle] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["compania", "vinculada", idCompania],
    queryFn: () => servicioCompania.obtener({ idCompania }),
    enabled: Boolean(idCompania),
    staleTime: Infinity,
  });

  const obtenerDetalleCompania = async (registro: RegistroPersonaAnalista): Promise<CompaniaListaItem> => {
    const respaldo = convertirRegistroACompania(registro);
    setEstaCargandoDetalle(true);
    try {
      const detalle = await servicioCompania.obtener({ idCompania: respaldo.idCompania });
      if (!detalle) return respaldo;
      queryClient.setQueryData(["compania", "vinculada", respaldo.idCompania], detalle);
      return { ...respaldo, ...detalle };
    } catch {
      return respaldo;
    } finally {
      setEstaCargandoDetalle(false);
    }
  };

  return {
    compania: idCompania ? data ?? null : null,
    estaCargando: (Boolean(idCompania) && isLoading) || estaCargandoDetalle,
    obtenerDetalleCompania,
  };
}
