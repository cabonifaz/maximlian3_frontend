import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { servicioInformeAprobacion } from "@maximilian/services/informe-aprobacion.service";
import { CLAVE_CONSULTA_INFORMES_PENDIENTES_APROBACION } from "@maximilian/shared/constants/pages/Coordinador/aprobacion-migraciones.constants";
import type {
  ModalBandejaAprobacionMigraciones,
  ParametrosListaInformesPendientesAprobacion,
  RegistroInformePendienteAprobacion,
} from "@maximilian/shared/types/informe-aprobacion.type";

interface ParametrosAccionesAprobacionMigraciones {
  parametros: ParametrosListaInformesPendientesAprobacion;
  totalRegistros: number;
  registrosSeleccionados: RegistroInformePendienteAprobacion[];
  onAccionCompletada: () => void;
}

export function useAccionesAprobacionMigraciones({
  parametros,
  totalRegistros,
  registrosSeleccionados,
  onAccionCompletada,
}: ParametrosAccionesAprobacionMigraciones) {
  const queryClient = useQueryClient();
  const [modalAbierto, setModalAbierto] = useState<ModalBandejaAprobacionMigraciones | null>(null);

  const idsSeleccionados = registrosSeleccionados.map((registro) => registro.idInforme);
  const idsParaAgregarMuestra = registrosSeleccionados
    .filter((registro) => !registro.esMuestra)
    .map((registro) => registro.idInforme);
  const idsParaQuitarMuestra = registrosSeleccionados
    .filter((registro) => registro.esMuestra)
    .map((registro) => registro.idInforme);

  const recargarBandeja = () =>
    queryClient.invalidateQueries({ queryKey: [CLAVE_CONSULTA_INFORMES_PENDIENTES_APROBACION] });

  const finalizarAccion = async () => {
    setModalAbierto(null);
    onAccionCompletada();
    await recargarBandeja();
  };

  const mutacionAprobarSeleccionados = useMutation({
    mutationFn: () => servicioInformeAprobacion.aprobar({ idInformes: idsSeleccionados }),
    onSuccess: finalizarAccion,
  });

  const mutacionAprobarTodos = useMutation({
    mutationFn: () => servicioInformeAprobacion.aprobarTodos({
      idPais: parametros.idPais ?? null,
      idPlantilla: parametros.idPlantilla ?? null,
      idIdioma: parametros.idIdioma ?? null,
      busqueda: parametros.busqueda ?? null,
      fchInicio: parametros.fchInicio ?? null,
      fchFin: parametros.fchFin ?? null,
      totalEsperado: totalRegistros,
    }),
    onSuccess: finalizarAccion,
    onError: recargarBandeja,
  });

  const mutacionAgregarMuestra = useMutation({
    mutationFn: () => servicioInformeAprobacion.agregarMuestra({ idInformes: idsParaAgregarMuestra }),
    onSuccess: finalizarAccion,
  });

  const mutacionQuitarMuestra = useMutation({
    mutationFn: () => servicioInformeAprobacion.quitarMuestra({ idInformes: idsParaQuitarMuestra }),
    onSuccess: finalizarAccion,
  });

  const estaAprobando = mutacionAprobarSeleccionados.isPending || mutacionAprobarTodos.isPending;

  const cerrarModal = () => {
    if (estaAprobando) return;
    setModalAbierto(null);
  };

  return {
    abrirModal: setModalAbierto,
    agregarMuestra: () => mutacionAgregarMuestra.mutate(),
    aprobarSeleccionados: () => mutacionAprobarSeleccionados.mutate(),
    aprobarTodos: () => mutacionAprobarTodos.mutate(),
    cantidadParaAgregarMuestra: idsParaAgregarMuestra.length,
    cantidadParaQuitarMuestra: idsParaQuitarMuestra.length,
    cantidadSeleccionados: idsSeleccionados.length,
    cerrarModal,
    estaAgregandoMuestra: mutacionAgregarMuestra.isPending,
    estaAprobandoSeleccionados: mutacionAprobarSeleccionados.isPending,
    estaAprobandoTodos: mutacionAprobarTodos.isPending,
    estaQuitandoMuestra: mutacionQuitarMuestra.isPending,
    modalAbierto,
    puedeAprobarTodos: !parametros.soloMuestra && totalRegistros > 0,
    quitarMuestra: () => mutacionQuitarMuestra.mutate(),
  };
}
