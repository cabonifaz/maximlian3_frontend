import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRetardo } from "@maximilian/hooks/useRetardo";
import { servicioBanco } from "@maximilian/services/banco.service";
import type { BancoListaItem, BancoListResponse } from "@maximilian/shared/types/banco.type";

interface ParametrosUseModalBusquedaBancoInforme {
  estaAbierto: boolean;
}

export function useModalBusquedaBancoInforme({
  estaAbierto,
}: ParametrosUseModalBusquedaBancoInforme) {
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [idBancoSeleccionado, setIdBancoSeleccionado] = useState<number | null>(
    null,
  );
  const [estaAbiertoModalCrearBanco, setEstaAbiertoModalCrearBanco] =
    useState(false);
  const [bancoEnEdicion, setBancoEnEdicion] = useState<BancoListaItem | null>(
    null,
  );
  const [bancoAEliminar, setBancoAEliminar] = useState<BancoListaItem | null>(
    null,
  );
  const busquedaConRetardo = useRetardo(busqueda);
  const queryClient = useQueryClient();

  const {
    data: respuestaBancos,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["bancos-busqueda-modal", busquedaConRetardo, paginaActual],
    queryFn: () =>
      servicioBanco.list({
        busqueda: busquedaConRetardo.trim() || undefined,
        numPag: paginaActual,
      }),
    enabled: estaAbierto,
    retry: false,
  });

  const bancos = useMemo(
    () => respuestaBancos?.lstBanco ?? [],
    [respuestaBancos?.lstBanco],
  );

  useEffect(() => {
    if (!estaAbierto) {
      setBusqueda("");
      setPaginaActual(1);
      setIdBancoSeleccionado(null);
    }
  }, [estaAbierto]);

  useEffect(() => {
    setPaginaActual(1);
  }, [busquedaConRetardo]);

  useEffect(() => {
    if (!bancos.length) {
      setIdBancoSeleccionado(null);
      return;
    }

    setIdBancoSeleccionado((valorActual) =>
      valorActual != null &&
      bancos.some((banco) => banco.idBanco === valorActual)
        ? valorActual
        : bancos[0]?.idBanco ?? null,
    );
  }, [bancos]);

  const bancoSeleccionado = useMemo(
    () =>
      bancos.find((banco) => banco.idBanco === idBancoSeleccionado) ?? null,
    [bancos, idBancoSeleccionado],
  );

  const eliminarBancoMutation = useMutation({
    mutationFn: async () => {
      if (!bancoAEliminar?.idBanco) {
        throw new Error("No se encontro el banco a eliminar.");
      }

      const idBanco = bancoAEliminar.idBanco;
      await servicioBanco.eliminar({ idBanco });
      return idBanco;
    },
    onSuccess: async (idBancoEliminado) => {
      queryClient.setQueriesData<BancoListResponse>(
        { queryKey: ["bancos-busqueda-modal"] },
        (respuestaActual) => {
          if (!respuestaActual) return respuestaActual;

          const cantidadEliminada = respuestaActual.lstBanco.some(
            (banco) => banco.idBanco === idBancoEliminado,
          )
            ? 1
            : 0;

          return {
            ...respuestaActual,
            lstBanco: respuestaActual.lstBanco.filter(
              (banco) => banco.idBanco !== idBancoEliminado,
            ),
            totalRegistros: Math.max(
              0,
              respuestaActual.totalRegistros - cantidadEliminada,
            ),
          };
        },
      );
      await queryClient.invalidateQueries({ queryKey: ["bancos-busqueda-modal"] });
      setBancoAEliminar(null);
      if (bancoSeleccionado?.idBanco === idBancoEliminado) {
        setIdBancoSeleccionado(null);
      }
    },
  });

  const prepararNuevoBanco = () => {
    setBancoEnEdicion(null);
    setEstaAbiertoModalCrearBanco(true);
  };

  const cerrarModalCrearBanco = () => {
    setEstaAbiertoModalCrearBanco(false);
    setBancoEnEdicion(null);
  };

  const manejarBancoCreado = (bancoCreado: BancoListaItem) => {
    setEstaAbiertoModalCrearBanco(false);
    setBancoEnEdicion(null);
    setIdBancoSeleccionado(bancoCreado.idBanco);
    setBusqueda("");
    setPaginaActual(1);
  };

  const prepararEdicionBanco = async (banco: BancoListaItem) => {
    const bancoDetalle = await servicioBanco.obtener({ idBanco: banco.idBanco });
    setBancoEnEdicion(bancoDetalle ?? banco);
    setEstaAbiertoModalCrearBanco(true);
  };

  return {
    bancoAEliminar,
    bancoEnEdicion,
    bancoSeleccionado,
    bancos,
    busqueda,
    cerrarModalCrearBanco,
    eliminarBancoMutation,
    estaAbiertoModalCrearBanco,
    idBancoSeleccionado,
    isError,
    isLoading,
    manejarBancoCreado,
    paginaActual,
    prepararEdicionBanco,
    prepararNuevoBanco,
    refetch,
    respuestaBancos,
    setBancoAEliminar,
    setBusqueda,
    setIdBancoSeleccionado,
    setPaginaActual,
  };
}
