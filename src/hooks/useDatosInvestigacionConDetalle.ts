import { useQuery } from "@tanstack/react-query";
import { servicioCompania } from "@maximilian/services/compania.service";
import { servicioDirectorioEjecutivo } from "@maximilian/services/directorio-ejecutivo.service";
import type { DatosInvestigacionAnalista } from "@maximilian/shared/types/investigacion.type";

async function obtenerDetalleOpcional<T>(consulta: () => Promise<T | null>) {
  try {
    return await consulta();
  } catch {
    return null;
  }
}

async function completarDetalleRelacionados(
  datos: DatosInvestigacionAnalista,
): Promise<DatosInvestigacionAnalista> {
  const companiasRelacionadas = await Promise.all(
    datos.companiasRelacionadas.map(async (compania) => {
      if (!compania.idCompania) return compania;
      const detalle = await obtenerDetalleOpcional(() =>
        servicioCompania.obtener({ idCompania: compania.idCompania as number }),
      );
      if (!detalle) return compania;

      return {
        ...compania,
        empresa: compania.empresa || detalle.nombreCompleto,
        idFiscal: compania.idFiscal || detalle.numeroDocumento,
        pais: compania.pais || detalle.pais,
        tipoPersona: detalle.tipoPersona,
        tipoDocumento: detalle.tipoDocumento,
        direccion: detalle.direccion,
        ciudadProvinciaEstado: detalle.ubigeo,
        codigoPostal: detalle.codigoPostal,
        telefono: detalle.telefono,
        existeInformacion: detalle.existeInformacion,
      };
    }),
  );

  const directorioEjecutivo = await Promise.all(
    datos.directorioEjecutivo.map(async (ejecutivo) => {
      if (!ejecutivo.idDirectorioEjecutivo) return ejecutivo;
      const detalle = await obtenerDetalleOpcional(() =>
        servicioDirectorioEjecutivo.obtener({
          idDirectorioEjecutivo: ejecutivo.idDirectorioEjecutivo as number,
        }),
      );
      if (!detalle) return ejecutivo;

      return {
        ...ejecutivo,
        pais: ejecutivo.pais || detalle.pais,
        tipoPersona: ejecutivo.tipoPersona || detalle.tipoPersona,
        descripcionBusqueda: ejecutivo.descripcionBusqueda || detalle.referenciaAdicional,
        direccionPrincipal: detalle.direccionPrincipal,
        ciudadProvinciaEstado: detalle.ciudadProvinciaEstado,
        codigoPostal: detalle.codigoPostal,
        nacionalidad: detalle.nacionalidad,
        tipoDocumentoIdentidad: detalle.tipoDocumentoIdentidad,
        numeroDocumentoIdentidad: detalle.numeroDocumentoIdentidad,
        tipoIdFiscal: detalle.tipoIdFiscal,
        numeroIdFiscal: detalle.numeroIdFiscal,
        fechaNacimiento: detalle.fechaNacimiento,
        estadoCivil: detalle.estadoCivil,
        profesion: detalle.profesion,
      };
    }),
  );

  return { ...datos, companiasRelacionadas, directorioEjecutivo };
}

export function useDatosInvestigacionConDetalle(
  datosInvestigacion: DatosInvestigacionAnalista | undefined,
  habilitado = true,
) {
  const idsCompanias = datosInvestigacion?.companiasRelacionadas.map((compania) => compania.idCompania ?? 0) ?? [];
  const idsEjecutivos = datosInvestigacion?.directorioEjecutivo.map((ejecutivo) => ejecutivo.idDirectorioEjecutivo ?? 0) ?? [];

  const { data: datosConDetalle } = useQuery({
    queryKey: ["datos-investigacion-con-detalle", idsCompanias, idsEjecutivos, datosInvestigacion?.identificacion.nombreEmpresa],
    queryFn: () => completarDetalleRelacionados(datosInvestigacion as DatosInvestigacionAnalista),
    enabled: habilitado && Boolean(datosInvestigacion),
    staleTime: Infinity,
  });

  return datosConDetalle ?? datosInvestigacion;
}
