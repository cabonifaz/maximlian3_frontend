import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { servicioBanco } from "@maximilian/services/banco.service";
import { servicioTablaMaestra } from "@maximilian/services/tabla-maestra.service";
import type {
  BancoCrearRequest,
  BancoEditarRequest,
  BancoListaItem,
} from "@maximilian/shared/types/banco.type";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import { traducirOpcionesTablaMaestra } from "@maximilian/shared/utils/tabla-maestra-idioma.util";

interface ParametrosUseModalCrearBancoInforme {
  bancoInicial?: BancoListaItem | null;
  estaAbierto: boolean;
  idIdioma?: number;
  onBancoCreado: (banco: BancoListaItem) => void;
  onCerrar: () => void;
}

export function useModalCrearBancoInforme({
  bancoInicial,
  estaAbierto,
  idIdioma,
  onBancoCreado,
  onCerrar,
}: ParametrosUseModalCrearBancoInforme) {
  const queryClient = useQueryClient();
  const [idPais, setIdPais] = useState<number | undefined>(bancoInicial?.idPais);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");

  const { data: opcionesPaisBase } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.PAIS],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.PAIS),
    enabled: estaAbierto,
    staleTime: Infinity,
  });

  const opcionesPais = useMemo(
    () => traducirOpcionesTablaMaestra(opcionesPaisBase, idIdioma),
    [idIdioma, opcionesPaisBase],
  );

  useEffect(() => {
    if (!estaAbierto) {
      setNombre("");
      setTelefono("");
      return;
    }

    setIdPais(bancoInicial?.idPais);
    setNombre(bancoInicial?.nombre ?? "");
    setTelefono(bancoInicial?.telefono ?? "");
  }, [bancoInicial?.idPais, bancoInicial?.nombre, bancoInicial?.telefono, estaAbierto]);

  const guardarBancoMutation = useMutation({
    mutationFn: async () => {
      const payloadBase = {
        idPais: idPais ?? 0,
        nombre: nombre.trim(),
        telefono: telefono.trim(),
      };

      const respuesta = bancoInicial?.idBanco
        ? await servicioBanco.editar({
            idBanco: bancoInicial.idBanco,
            ...payloadBase,
          } satisfies BancoEditarRequest)
        : await servicioBanco.crear(payloadBase satisfies BancoCrearRequest);

      await queryClient.invalidateQueries({ queryKey: ["bancos-busqueda-modal"] });

      if (respuesta.idBanco) {
        const bancoCreado = await servicioBanco.obtener({
          idBanco: respuesta.idBanco,
        });
        if (bancoCreado) return bancoCreado;
      }

      const pais =
        opcionesPais?.find((opcion) => opcion.num1 === payloadBase.idPais)?.string1 ??
        "-";

      return {
        idBanco: respuesta.idBanco ?? bancoInicial?.idBanco ?? 0,
        idPais: payloadBase.idPais,
        nombre: payloadBase.nombre,
        telefono: payloadBase.telefono,
        pais,
      } satisfies BancoListaItem;
    },
    onSuccess: (bancoCreado) => {
      onBancoCreado(bancoCreado);
      onCerrar();
    },
  });

  const formularioInvalido = !idPais || !nombre.trim() || !telefono.trim();

  return {
    formularioInvalido,
    guardarBancoMutation,
    idPais,
    nombre,
    opcionesPais,
    setIdPais,
    setNombre,
    setTelefono,
    telefono,
  };
}
