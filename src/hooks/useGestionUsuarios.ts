import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ID_MAESTRO_ESTADO_USUARIO } from "@maximilian/shared/constants/pages/Administrador/gestion-usuarios.constants";
import { useRetardo } from "@maximilian/hooks/useRetardo";
import { servicioTablaMaestra } from "@maximilian/services/tabla-maestra.service";
import { servicioUsuario } from "@maximilian/services/usuario.service";
import type { DatosFormularioUsuario } from "@maximilian/schemas";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import type { UserListEntry } from "@maximilian/shared/types/usuario.type";
import {
  construirPayloadActualizarUsuario,
  construirPayloadCrearUsuario,
  construirPayloadEliminarUsuario,
  mapearDetalleUsuarioAFormulario,
  mapearUsuarioEliminacionAFormulario,
  mapearUsuarioInactivoAFormulario,
  obtenerIdsRolesDesdeListado,
} from "@maximilian/shared/utils/gestion-usuarios.util";

interface ParametrosMutacionUsuario {
  datosUsuario: DatosFormularioUsuario;
  resetForm: () => void;
}

export function useGestionUsuarios() {
  const queryClient = useQueryClient();
  const [estaAbiertoModalCrear, setEstaAbiertoModalCrear] = useState(false);
  const [estaAbiertoModalEditar, setEstaAbiertoModalEditar] = useState(false);
  const [estaAbiertoModalEliminar, setEstaAbiertoModalEliminar] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<DatosFormularioUsuario | null>(null);
  const [idUsuarioEditando, setIdUsuarioEditando] = useState<number | null>(null);
  const [idUsuarioEliminando, setIdUsuarioEliminando] = useState<number | null>(null);
  const [idMenuActivo, setIdMenuActivo] = useState<number | null>(null);
  const [estaCargandoUsuario, setEstaCargandoUsuario] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [filtro, setFiltro] = useState("");
  const [idEstadoFiltro, setIdEstadoFiltro] = useState<number | undefined>(undefined);
  const filtroConRetardo = useRetardo(filtro);

  const { data: estadosUsuarioData } = useQuery({
    queryKey: ["masterTable", ID_MAESTRO_ESTADO_USUARIO],
    queryFn: () => servicioTablaMaestra.list(ID_MAESTRO_ESTADO_USUARIO),
    staleTime: Infinity,
  });

  const {
    data: usuariosData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["users", paginaActual, filtroConRetardo, idEstadoFiltro],
    queryFn: () =>
      servicioUsuario.list({
        numPag: paginaActual,
        filtro: filtroConRetardo,
        idEstado: idEstadoFiltro,
      }),
    enabled: filtro === filtroConRetardo,
  });

  const crearUsuarioMutation = useMutation({
    mutationFn: ({ datosUsuario }: ParametrosMutacionUsuario) =>
      servicioUsuario.create(construirPayloadCrearUsuario(datosUsuario)),
    onSuccess: (_, { resetForm }) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEstaAbiertoModalCrear(false);
      resetForm();
    },
    onError: (error: Error) => {
      console.error("Error al crear usuario:", error.message);
    },
  });

  const actualizarUsuarioMutation = useMutation({
    mutationFn: ({ datosUsuario }: ParametrosMutacionUsuario) => {
      if (idUsuarioEditando === null) {
        throw new Error("No hay usuario seleccionado para editar");
      }

      return servicioUsuario.update(construirPayloadActualizarUsuario(idUsuarioEditando, datosUsuario));
    },
    onSuccess: (_, { resetForm }) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEstaAbiertoModalEditar(false);
      setIdUsuarioEditando(null);
      resetForm();
    },
    onError: (error: Error) => {
      console.error("Error al actualizar usuario:", error.message);
    },
  });

  const eliminarUsuarioMutation = useMutation({
    mutationFn: (idUsuario: number) => servicioUsuario.delete(construirPayloadEliminarUsuario(idUsuario)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEstaAbiertoModalEliminar(false);
      setIdUsuarioEliminando(null);
    },
    onError: (error: Error) => {
      console.error("Error al eliminar usuario:", error.message);
    },
  });

  const obtenerRolesDesdeListado = async (usuario: UserListEntry) => {
    const rolesMaestros = await queryClient.fetchQuery({
      queryKey: ["masterTable", TablaMaestraId.ROLES],
      queryFn: () => servicioTablaMaestra.list(TablaMaestraId.ROLES),
      staleTime: Infinity,
    });

    return obtenerIdsRolesDesdeListado(usuario, rolesMaestros);
  };

  const abrirModalEditar = async (usuario: UserListEntry) => {
    setEstaCargandoUsuario(true);
    setIdMenuActivo(null);

    try {
      const detalle = await servicioUsuario.getById(usuario.idUsuario);
      const rolesDesdeListado = await obtenerRolesDesdeListado(usuario);

      setIdUsuarioEditando(usuario.idUsuario);
      setUsuarioSeleccionado(mapearDetalleUsuarioAFormulario(usuario, detalle, rolesDesdeListado));
      setEstaAbiertoModalEditar(true);
    } catch (error) {
      console.error("Error al cargar detalle de usuario", error);
      if (usuario.estado.toLowerCase() !== "activo") {
        const rolesDesdeListado = await obtenerRolesDesdeListado(usuario);
        setIdUsuarioEditando(usuario.idUsuario);
        setUsuarioSeleccionado(mapearUsuarioInactivoAFormulario(usuario, rolesDesdeListado));
        setEstaAbiertoModalEditar(true);
      }
    } finally {
      setEstaCargandoUsuario(false);
    }
  };

  const abrirModalEliminar = (usuario: UserListEntry) => {
    setIdUsuarioEliminando(usuario.idUsuario);
    setUsuarioSeleccionado(mapearUsuarioEliminacionAFormulario(usuario));
    setEstaAbiertoModalEliminar(true);
    setIdMenuActivo(null);
  };

  const crearUsuario = (datosUsuario: DatosFormularioUsuario, resetForm: () => void) => {
    crearUsuarioMutation.mutate({ datosUsuario, resetForm });
  };

  const editarUsuario = (datosUsuario: DatosFormularioUsuario, resetForm: () => void) => {
    actualizarUsuarioMutation.mutate({ datosUsuario, resetForm });
  };

  const eliminarUsuario = () => {
    if (idUsuarioEliminando !== null) {
      eliminarUsuarioMutation.mutate(idUsuarioEliminando);
    }
  };

  const cambiarBusqueda = (valor: string) => {
    setFiltro(valor);
    setPaginaActual(1);
  };

  const cambiarPagina = (pagina: number) => {
    if (pagina >= 1 && pagina <= (usuariosData?.totalPaginas || 1)) {
      setPaginaActual(pagina);
    }
  };

  const cambiarFiltroEstado = (ids: number[]) => {
    setIdEstadoFiltro(ids[ids.length - 1]);
    setPaginaActual(1);
  };

  const cerrarModalEditar = () => {
    setEstaAbiertoModalEditar(false);
    setIdUsuarioEditando(null);
  };

  const cerrarModalEliminar = () => {
    setEstaAbiertoModalEliminar(false);
    setIdUsuarioEliminando(null);
  };

  return {
    abrirModalEditar,
    abrirModalEliminar,
    actualizarUsuarioMutation,
    cambiarBusqueda,
    cambiarFiltroEstado,
    cambiarPagina,
    cerrarModalEditar,
    cerrarModalEliminar,
    crearUsuario,
    crearUsuarioMutation,
    editarUsuario,
    eliminarUsuario,
    eliminarUsuarioMutation,
    estaAbiertoModalCrear,
    estaAbiertoModalEditar,
    estaAbiertoModalEliminar,
    estaCargandoUsuario,
    estadosUsuarioData,
    filtro,
    idEstadoFiltro,
    idMenuActivo,
    isError,
    isLoading,
    paginaActual,
    refetch,
    setEstaAbiertoModalCrear,
    setIdMenuActivo,
    usuarioSeleccionado,
    usuariosData,
  };
}
