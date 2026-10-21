import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { servicioCompania } from "@maximilian/services/compania.service";
import type { RegistroPersonaAnalista } from "@maximilian/components/investigacion/CustomModalRegistroEmpresaRelacionada";
import type { EmpresaRelacionadaAnalista } from "@maximilian/shared/types/investigacion.type";

interface ParametrosUseEdicionCompaniaRelacionada {
  onActualizar: (indice: number, empresa: EmpresaRelacionadaAnalista) => void;
}

function construirRegistroLocal(empresa: EmpresaRelacionadaAnalista): RegistroPersonaAnalista {
  return {
    id: empresa.idCompania ?? 0,
    idCompania: empresa.idCompania,
    tipoPersona: "",
    nombres: empresa.empresa,
    tipoDocumento: "",
    numeroDocumento: empresa.idFiscal,
    pais: empresa.pais,
    telefono: "",
    existeInformacion: true,
  };
}

export function useEdicionCompaniaRelacionada({ onActualizar }: ParametrosUseEdicionCompaniaRelacionada) {
  const [indiceEdicion, setIndiceEdicion] = useState<number | null>(null);
  const [registroEdicion, setRegistroEdicion] = useState<RegistroPersonaAnalista | null>(null);

  const cargarRegistroMutation = useMutation({
    mutationFn: async ({ indice, empresa }: { indice: number; empresa: EmpresaRelacionadaAnalista }) => {
      if (!empresa.idCompania) return { indice, registro: construirRegistroLocal(empresa) };

      const compania = await servicioCompania.obtener({ idCompania: empresa.idCompania });
      if (!compania) return { indice, registro: construirRegistroLocal(empresa) };

      const registro: RegistroPersonaAnalista = {
        id: compania.idCompania,
        idCompania: compania.idCompania,
        idTipoPersona: compania.idTipoPersona,
        idTipoDocumento: compania.idTipoDocumento,
        idPais: compania.idPais,
        direccion: compania.direccion,
        ubigeo: compania.ubigeo,
        codigoPostal: compania.codigoPostal,
        numeroDocumento: compania.numeroDocumento,
        tipoPersona: compania.tipoPersona ?? "",
        nombres: compania.nombreCompleto,
        tipoDocumento: `${compania.tipoDocumento ?? ""} - ${compania.numeroDocumento}`,
        pais: compania.pais,
        telefono: compania.telefono,
        existeInformacion: compania.existeInformacion === "Si",
        textoExisteInformacion: compania.existeInformacion,
      };
      return { indice, registro };
    },
    onSuccess: ({ indice, registro }) => {
      setRegistroEdicion(registro);
      setIndiceEdicion(indice);
    },
  });

  const abrirEdicion = (indice: number, empresa: EmpresaRelacionadaAnalista) => {
    if (cargarRegistroMutation.isPending) return;
    cargarRegistroMutation.mutate({ indice, empresa });
  };

  const cerrarEdicion = () => {
    setIndiceEdicion(null);
    setRegistroEdicion(null);
  };

  const guardarEdicion = (registro: RegistroPersonaAnalista) => {
    if (indiceEdicion == null) return;

    onActualizar(indiceEdicion, {
      idCompania: registro.idCompania,
      empresa: registro.nombres,
      idFiscal: registro.numeroDocumento ?? "",
      pais: registro.pais,
    });
  };

  return {
    abrirEdicion,
    cerrarEdicion,
    estaCargandoEdicion: cargarRegistroMutation.isPending,
    guardarEdicion,
    indiceEdicion,
    registroEdicion,
  };
}
