import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ID_MAESTRO_ESTADO_CIVIL,
  ID_MAESTRO_PROFESION,
  ID_MAESTRO_TIPO_DOCUMENTO,
} from "@maximilian/shared/constants/components/investigacion/custom-modal-registro-persona-directorio.constants";
import { servicioDirectorioEjecutivo } from "@maximilian/services/directorio-ejecutivo.service";
import { servicioTablaMaestra } from "@maximilian/services/tabla-maestra.service";
import {
  registroPersonaDirectorioInvestigacionSchema,
  type DatosFormularioRegistroPersonaDirectorioInvestigacion,
} from "@maximilian/schemas/investigacion.schema";
import type { DirectorioEjecutivoGuardarRequest } from "@maximilian/shared/types/directorio-ejecutivo.type";
import type { RegistroPersonaDirectorioAnalista } from "@maximilian/shared/types/investigacion.type";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import { traducirOpcionesTablaMaestra } from "@maximilian/shared/utils/tabla-maestra-idioma.util";

interface ParametrosUseModalRegistroPersonaDirectorio {
  estaAbierto: boolean;
  idIdioma?: number;
  registroInicial?: RegistroPersonaDirectorioAnalista | null;
  onGuardar: (registro: RegistroPersonaDirectorioAnalista) => void;
}

export function useModalRegistroPersonaDirectorio({
  estaAbierto,
  idIdioma,
  registroInicial,
  onGuardar,
}: ParametrosUseModalRegistroPersonaDirectorio) {
  const [fechaNacimiento, setFechaNacimiento] = useState(
    registroInicial?.fechaNacimiento ?? "",
  );

  useEffect(() => {
    if (!estaAbierto) return;
    const idTemporizador = window.setTimeout(() => {
      setFechaNacimiento(registroInicial?.fechaNacimiento ?? "");
    }, 0);
    return () => window.clearTimeout(idTemporizador);
  }, [estaAbierto, registroInicial?.fechaNacimiento]);

  const { data: opcionesTipoPersonaBase } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.TIPO_PERSONA],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.TIPO_PERSONA),
    enabled: estaAbierto,
    staleTime: Infinity,
  });

  const { data: opcionesPaisBase } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.PAIS],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.PAIS),
    enabled: estaAbierto,
    staleTime: Infinity,
  });

  const { data: opcionesTipoDocumentoBase } = useQuery({
    queryKey: ["masterTable", ID_MAESTRO_TIPO_DOCUMENTO],
    queryFn: () => servicioTablaMaestra.list(ID_MAESTRO_TIPO_DOCUMENTO),
    enabled: estaAbierto,
    staleTime: Infinity,
  });

  const { data: opcionesTipoIdFiscalBase } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.TIPO_REG_TRIBUTARIO],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.TIPO_REG_TRIBUTARIO),
    enabled: estaAbierto,
    staleTime: Infinity,
  });

  const { data: opcionesEstadoCivilBase } = useQuery({
    queryKey: ["masterTable", ID_MAESTRO_ESTADO_CIVIL],
    queryFn: () => servicioTablaMaestra.list(ID_MAESTRO_ESTADO_CIVIL),
    enabled: estaAbierto,
    staleTime: Infinity,
  });

  const { data: opcionesProfesionBase } = useQuery({
    queryKey: ["masterTable", ID_MAESTRO_PROFESION],
    queryFn: () => servicioTablaMaestra.list(ID_MAESTRO_PROFESION),
    enabled: estaAbierto,
    staleTime: Infinity,
  });

  const opcionesTipoPersona = useMemo(
    () => traducirOpcionesTablaMaestra(opcionesTipoPersonaBase, idIdioma),
    [idIdioma, opcionesTipoPersonaBase],
  );
  const opcionesPais = useMemo(
    () => traducirOpcionesTablaMaestra(opcionesPaisBase, idIdioma),
    [idIdioma, opcionesPaisBase],
  );
  const opcionesTipoDocumento = useMemo(
    () => traducirOpcionesTablaMaestra(opcionesTipoDocumentoBase, idIdioma),
    [idIdioma, opcionesTipoDocumentoBase],
  );
  const opcionesTipoIdFiscal = useMemo(
    () => traducirOpcionesTablaMaestra(opcionesTipoIdFiscalBase, idIdioma),
    [idIdioma, opcionesTipoIdFiscalBase],
  );
  const opcionesEstadoCivil = useMemo(
    () => traducirOpcionesTablaMaestra(opcionesEstadoCivilBase, idIdioma),
    [idIdioma, opcionesEstadoCivilBase],
  );
  const opcionesProfesion = useMemo(
    () => traducirOpcionesTablaMaestra(opcionesProfesionBase, idIdioma),
    [idIdioma, opcionesProfesionBase],
  );

  const opcionesNacionalidad = useMemo(
    () =>
      opcionesPais?.map((opcion) => ({
        ...opcion,
        string1: opcion.string3 || opcion.string1,
      })),
    [opcionesPais],
  );

  const crearRegistroMutation = useMutation({
    mutationFn: async (
      datosFormulario: DatosFormularioRegistroPersonaDirectorioInvestigacion,
    ) => {
      const registro: RegistroPersonaDirectorioAnalista = {
        id: registroInicial?.id ?? 0,
        idDirectorioEjecutivo: registroInicial?.idDirectorioEjecutivo,
        ...datosFormulario,
      };

      const payload: DirectorioEjecutivoGuardarRequest = {
        idTipoPersona: registro.idTipoPersona ?? 0,
        nombreCompleto: registro.nombres,
        idPais: registro.idPais ?? 0,
        direccion: registro.direccionPrincipal,
        ubigeo: registro.ciudadProvinciaEstado,
        codigoPostal: registro.codigoPostal,
        idTipoDocumento: registro.idTipoDocumento ?? 0,
        numeroDocumento: registro.numeroDocumentoIdentidad,
        taxIdType: registro.taxIdType ?? 0,
        taxNum: registro.numeroIdFiscal,
        idNacionalidad: registro.idNacionalidad ?? 0,
        fechaNacimiento: registro.fechaNacimiento || null,
        idEstadoCivil: registro.idEstadoCivil ?? 0,
        idProfesion: registro.idProfesion ?? 0,
        referencias: registro.referenciaAdicional,
      };

      const respuesta = registroInicial?.idDirectorioEjecutivo
        ? await servicioDirectorioEjecutivo.editar({
            ...payload,
            idDirectorioEjecutivo: registroInicial.idDirectorioEjecutivo,
          })
        : await servicioDirectorioEjecutivo.crear(payload);

      const idDirectorioEjecutivo =
        respuesta.idDirectorioEjecutivo ??
        registroInicial?.idDirectorioEjecutivo ??
        registroInicial?.id ??
        Date.now();

      return {
        ...registro,
        id: idDirectorioEjecutivo,
        idDirectorioEjecutivo,
        idTipoPersona: payload.idTipoPersona,
        idPais: payload.idPais,
        idTipoDocumento: payload.idTipoDocumento,
        taxIdType: payload.taxIdType,
        idNacionalidad: payload.idNacionalidad,
        idEstadoCivil: payload.idEstadoCivil,
        idProfesion: payload.idProfesion,
      };
    },
    onSuccess: (registro) => {
      onGuardar(registro);
    },
  });

  const manejarSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const resultado = registroPersonaDirectorioInvestigacionSchema.safeParse(
      Object.fromEntries(new FormData(event.currentTarget).entries()),
    );
    if (resultado.success) crearRegistroMutation.mutate(resultado.data);
  };

  return {
    crearRegistroMutation,
    fechaNacimiento,
    manejarSubmit,
    opcionesEstadoCivil,
    opcionesNacionalidad,
    opcionesPais,
    opcionesProfesion,
    opcionesTipoDocumento,
    opcionesTipoIdFiscal,
    opcionesTipoPersona,
    setFechaNacimiento,
  };
}
