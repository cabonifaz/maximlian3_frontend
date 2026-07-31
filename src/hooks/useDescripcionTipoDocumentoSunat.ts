import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { servicioTablaMaestra } from "@maximilian/services/tabla-maestra.service";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";

export function useDescripcionTipoDocumentoSunat(
  idTipoRegistroTributario: string | number | undefined,
  activo: boolean,
) {
  const idTipoRegistro =
    typeof idTipoRegistroTributario === "number"
      ? idTipoRegistroTributario
      : Number(idTipoRegistroTributario);
  const tieneTipoRegistro = Number.isFinite(idTipoRegistro) && idTipoRegistro > 0;

  const {
    data: opcionesTipoRegistroTributario,
    isFetching: cargandoTiposRegistroTributario,
  } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.TIPO_REG_TRIBUTARIO],
    queryFn: () =>
      servicioTablaMaestra.list(TablaMaestraId.TIPO_REG_TRIBUTARIO),
    enabled: activo && tieneTipoRegistro,
    staleTime: Infinity,
  });

  const {
    data: opcionesTipoDocumentoSunat,
    isFetching: cargandoTiposDocumentoSunat,
  } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.TIPO_DOCUMENTO_SUNAT],
    queryFn: () =>
      servicioTablaMaestra.list(TablaMaestraId.TIPO_DOCUMENTO_SUNAT),
    enabled: activo && tieneTipoRegistro,
    staleTime: Infinity,
  });

  const tipoDocumentoSunat = useMemo(() => {
    const tipoRegistroTributario = opcionesTipoRegistroTributario?.find(
      (opcion) => opcion.num1 === idTipoRegistro,
    );
    const idTipoDocumentoSunat = tipoRegistroTributario?.num2;

    if (idTipoDocumentoSunat == null) return undefined;

    const tipoDocumento = opcionesTipoDocumentoSunat?.find(
      (opcion) => opcion.num1 === idTipoDocumentoSunat,
    );
    const codigo = tipoDocumento?.string1?.trim();
    const descripcion = tipoDocumento?.string2?.trim();

    if (codigo && descripcion) return `${codigo} - ${descripcion}`;
    return codigo || descripcion;
  }, [
    idTipoRegistro,
    opcionesTipoDocumentoSunat,
    opcionesTipoRegistroTributario,
  ]);

  return {
    tipoDocumentoSunat,
    cargandoTipoDocumentoSunat:
      cargandoTiposRegistroTributario || cargandoTiposDocumentoSunat,
  };
}
