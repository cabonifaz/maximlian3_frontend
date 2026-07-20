import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { servicioCompania } from "@maximilian/services/compania.service";
import { servicioTablaMaestra } from "@maximilian/services/tabla-maestra.service";
import type {
  CompaniaEditarRequest,
  CompaniaListaItem,
  DirectorioEjecutivoCrearRequest,
} from "@maximilian/shared/types/compania.type";
import type { EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import { traducirOpcionesTablaMaestra } from "@maximilian/shared/utils/tabla-maestra-idioma.util";
import type { RegistroPersonaAnalista } from "@maximilian/components/investigacion/CustomModalRegistroEmpresaRelacionada";

interface ParametrosUseModalRegistroEmpresaRelacionada {
  estaAbierto: boolean;
  idIdioma?: number;
  onCerrar: () => void;
  onGuardar: (registro: RegistroPersonaAnalista) => void;
  opcionesPais?: EntradaTablaMaestra[];
  opcionesTipoPersona?: EntradaTablaMaestra[];
  registroInicial?: RegistroPersonaAnalista | null;
  soloEdicionLocal: boolean;
  tipoCreacion: "compania" | "directorioEjecutivo";
}

function obtenerTextoPorId(opciones: EntradaTablaMaestra[] | undefined, id?: number) {
  return opciones?.find((opcion) => opcion.num1 === id)?.string1 ?? "";
}

export function useModalRegistroEmpresaRelacionada({
  estaAbierto,
  idIdioma,
  onCerrar,
  onGuardar,
  opcionesPais,
  opcionesTipoPersona,
  registroInicial,
  soloEdicionLocal,
  tipoCreacion,
}: ParametrosUseModalRegistroEmpresaRelacionada) {
  const queryClient = useQueryClient();
  const [idTipoPersona, setIdTipoPersona] = useState<number | undefined>(
    registroInicial?.idTipoPersona,
  );
  const [idPais, setIdPais] = useState<number | undefined>(registroInicial?.idPais);
  const [idTipoDocumento, setIdTipoDocumento] = useState<number | undefined>(
    registroInicial?.idTipoDocumento,
  );
  const [nombreCompleto, setNombreCompleto] = useState(
    registroInicial?.nombres ?? "",
  );
  const [numeroDocumento, setNumeroDocumento] = useState(
    registroInicial?.numeroDocumento ?? "",
  );
  const [direccion, setDireccion] = useState(registroInicial?.direccion ?? "");
  const [ciudadProvinciaEstado, setCiudadProvinciaEstado] = useState(
    registroInicial?.ubigeo ?? "",
  );
  const [codigoPostal, setCodigoPostal] = useState(
    registroInicial?.codigoPostal ?? "",
  );
  const [telefono, setTelefono] = useState(registroInicial?.telefono ?? "");
  const [existeInformacion, setExisteInformacion] = useState(
    registroInicial?.existeInformacion ?? true,
  );

  const { data: opcionesTipoDocumentoBase } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.TIPO_DOCUMENTO_IDENTIDAD],
    queryFn: () =>
      servicioTablaMaestra.list(TablaMaestraId.TIPO_DOCUMENTO_IDENTIDAD),
    enabled: estaAbierto,
    staleTime: Infinity,
  });
  const opcionesTipoDocumento = traducirOpcionesTablaMaestra(
    opcionesTipoDocumentoBase,
    idIdioma,
  );

  useEffect(() => {
    if (!estaAbierto) return;

    setIdTipoPersona(registroInicial?.idTipoPersona);
    setIdPais(registroInicial?.idPais);
    setIdTipoDocumento(registroInicial?.idTipoDocumento);
    setNombreCompleto(registroInicial?.nombres ?? "");
    setNumeroDocumento(
      registroInicial?.numeroDocumento ??
        registroInicial?.tipoDocumento.split(" - ")[1] ??
        "",
    );
    setDireccion(registroInicial?.direccion ?? "");
    setCiudadProvinciaEstado(registroInicial?.ubigeo ?? "");
    setCodigoPostal(registroInicial?.codigoPostal ?? "");
    setTelefono(registroInicial?.telefono ?? "");
    setExisteInformacion(registroInicial?.existeInformacion ?? true);
  }, [estaAbierto, registroInicial]);

  const guardarCompaniaMutation = useMutation({
    mutationFn: async () => {
      const payloadBase = {
        idTipoPersona: idTipoPersona ?? 0,
        idTipoDocumento: idTipoDocumento ?? 0,
        numeroDocumento: numeroDocumento.trim(),
        nombreCompleto: nombreCompleto.trim(),
        idPais: idPais ?? 0,
        direccion: direccion.trim(),
        ubigeo: ciudadProvinciaEstado.trim(),
        codigoPostal: codigoPostal.trim(),
        telefono: telefono.trim(),
        existeInformacion,
      };

      if (soloEdicionLocal && !registroInicial?.idCompania) {
        return {
          idCompania: 0,
          idTipoPersona: payloadBase.idTipoPersona,
          idTipoDocumento: payloadBase.idTipoDocumento,
          idPais: payloadBase.idPais,
          direccion: payloadBase.direccion,
          ubigeo: payloadBase.ubigeo,
          codigoPostal: payloadBase.codigoPostal,
          numeroDocumento: payloadBase.numeroDocumento,
          nombreCompleto: payloadBase.nombreCompleto,
          pais: obtenerTextoPorId(opcionesPais, payloadBase.idPais) || "-",
          telefono: payloadBase.telefono || "-",
          existeInformacion: payloadBase.existeInformacion ? "Si" : "No",
          tipoPersona:
            obtenerTextoPorId(opcionesTipoPersona, payloadBase.idTipoPersona) ||
            undefined,
          tipoDocumento:
            obtenerTextoPorId(opcionesTipoDocumento, payloadBase.idTipoDocumento) ||
            undefined,
        } satisfies CompaniaListaItem;
      }

      const respuesta = registroInicial?.idCompania
        ? await servicioCompania.editar({
            idCompania: registroInicial.idCompania,
            idTipoPersona: payloadBase.idTipoPersona,
            idTipoDocumento: payloadBase.idTipoDocumento,
            numeroDocumento: payloadBase.numeroDocumento,
            nombreCompleto: payloadBase.nombreCompleto,
            idPais: payloadBase.idPais,
            telefono: payloadBase.telefono,
            direccion: payloadBase.direccion,
            ciudadProvinciaEstado: payloadBase.ubigeo,
            codigoPostal: payloadBase.codigoPostal,
            existeInformacion: payloadBase.existeInformacion,
          } satisfies CompaniaEditarRequest)
        : tipoCreacion === "compania"
          ? await servicioCompania.crear({
              idTipoPersona: payloadBase.idTipoPersona,
              idTipoDocumento: payloadBase.idTipoDocumento,
              numeroDocumento: payloadBase.numeroDocumento,
              nombreCompleto: payloadBase.nombreCompleto,
              idPais: payloadBase.idPais,
              telefono: payloadBase.telefono,
              direccion: payloadBase.direccion,
              ciudadProvinciaEstado: payloadBase.ubigeo,
              codigoPostal: payloadBase.codigoPostal,
              existeInformacion: payloadBase.existeInformacion,
            })
          : await servicioCompania.crearDirectorioEjecutivo({
              idTipoPersona: payloadBase.idTipoPersona,
              nombreCompleto: payloadBase.nombreCompleto,
              idPais: payloadBase.idPais,
              direccion: payloadBase.direccion,
              ubigeo: payloadBase.ubigeo,
              codigoPostal: payloadBase.codigoPostal,
              idTipoDocumento: payloadBase.idTipoDocumento,
              numeroDocumento: payloadBase.numeroDocumento,
              taxIdType: payloadBase.idTipoDocumento,
              taxNum: payloadBase.numeroDocumento,
              idNacionalidad: 0,
              fechaNacimiento: null,
              idEstadoCivil: 0,
              idProfesion: 0,
              referencias: "",
            } satisfies DirectorioEjecutivoCrearRequest);

      await queryClient.invalidateQueries({
        queryKey: ["companias-relacionadas-modal"],
      });

      if (respuesta.idCompania) {
        try {
          const companiaActualizada = await servicioCompania.obtener({
            idCompania: respuesta.idCompania,
          });
          if (companiaActualizada) return companiaActualizada;
        } catch {
          // El detalle puede estar restringido para algunos roles.
        }
      }

      return {
        idCompania: respuesta.idCompania ?? registroInicial?.idCompania ?? 0,
        idTipoPersona: payloadBase.idTipoPersona,
        idTipoDocumento: payloadBase.idTipoDocumento,
        idPais: payloadBase.idPais,
        direccion: payloadBase.direccion,
        ubigeo: payloadBase.ubigeo,
        codigoPostal: payloadBase.codigoPostal,
        numeroDocumento: payloadBase.numeroDocumento,
        nombreCompleto: payloadBase.nombreCompleto,
        pais: obtenerTextoPorId(opcionesPais, payloadBase.idPais) || "-",
        telefono: payloadBase.telefono || "-",
        existeInformacion: payloadBase.existeInformacion ? "Si" : "No",
        tipoPersona:
          obtenerTextoPorId(opcionesTipoPersona, payloadBase.idTipoPersona) ||
          undefined,
        tipoDocumento:
          obtenerTextoPorId(opcionesTipoDocumento, payloadBase.idTipoDocumento) ||
          undefined,
      } satisfies CompaniaListaItem;
    },
    onSuccess: (companiaGuardada) => {
      onGuardar({
        id: companiaGuardada.idCompania,
        idCompania: companiaGuardada.idCompania,
        idTipoPersona: companiaGuardada.idTipoPersona,
        idTipoDocumento: companiaGuardada.idTipoDocumento,
        idPais: companiaGuardada.idPais,
        direccion: companiaGuardada.direccion,
        ubigeo: companiaGuardada.ubigeo,
        codigoPostal: companiaGuardada.codigoPostal,
        numeroDocumento: companiaGuardada.numeroDocumento,
        tipoPersona:
          companiaGuardada.tipoPersona ??
          obtenerTextoPorId(opcionesTipoPersona, companiaGuardada.idTipoPersona),
        nombres: companiaGuardada.nombreCompleto,
        tipoDocumento: `${companiaGuardada.tipoDocumento ?? obtenerTextoPorId(opcionesTipoDocumento, companiaGuardada.idTipoDocumento)} - ${companiaGuardada.numeroDocumento}`,
        pais: companiaGuardada.pais,
        telefono: companiaGuardada.telefono,
        existeInformacion: companiaGuardada.existeInformacion === "Si",
        textoExisteInformacion: companiaGuardada.existeInformacion,
      });
      onCerrar();
    },
  });

  return {
    ciudadProvinciaEstado,
    codigoPostal,
    direccion,
    existeInformacion,
    guardarCompaniaMutation,
    idPais,
    idTipoDocumento,
    idTipoPersona,
    nombreCompleto,
    numeroDocumento,
    opcionesTipoDocumento,
    setCiudadProvinciaEstado,
    setCodigoPostal,
    setDireccion,
    setExisteInformacion,
    setIdPais,
    setIdTipoDocumento,
    setIdTipoPersona,
    setNombreCompleto,
    setNumeroDocumento,
    setTelefono,
    telefono,
  };
}
