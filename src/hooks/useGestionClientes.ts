import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useListadoPaginado } from "@maximilian/hooks/useListadoPaginado";
import { servicioCliente } from "@maximilian/services/cliente.service";
import { servicioTablaMaestra } from "@maximilian/services/tabla-maestra.service";
import type {
  DatosFormularioContacto,
  DatosFormularioInformacionCliente,
  DatosFormularioTarifa,
} from "@maximilian/schemas";
import type { ClientListEntry } from "@maximilian/shared/types/cliente.type";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import {
  construirPayloadCrearCliente,
  construirPayloadCrearContacto,
  construirPayloadCrearTarifa,
} from "@maximilian/shared/utils/gestion-clientes.util";

interface ParametrosCrearCliente {
  datosCliente: DatosFormularioInformacionCliente;
  contactos: DatosFormularioContacto[];
  tarifas: DatosFormularioTarifa[];
  reset: () => void;
}

export function useGestionClientes() {
  const queryClient = useQueryClient();
  const {
    terminoBusqueda,
    paginaActual,
    busquedaConRetardo,
    cambiarBusqueda,
    cambiarPagina,
    reiniciarPagina,
  } = useListadoPaginado();
  const [estaAbiertoModalCrear, setEstaAbiertoModalCrear] = useState(false);
  const [estaAbiertoModalDetalle, setEstaAbiertoModalDetalle] = useState(false);
  const [idClienteSeleccionado, setIdClienteSeleccionado] = useState<number | null>(null);
  const [idMenuActivo, setIdMenuActivo] = useState<number | null>(null);
  const [clienteAEliminar, setClienteAEliminar] = useState<ClientListEntry | null>(null);
  const [filtroPais, setFiltroPais] = useState<number | undefined>(undefined);
  const [filtroEstado, setFiltroEstado] = useState<number | undefined>(undefined);

  const {
    data: clientesData,
    isLoading: estaCargandoClientes,
    isError: hayErrorClientes,
    refetch: recargarClientes,
  } = useQuery({
    queryKey: ["clients", paginaActual, busquedaConRetardo, filtroPais, filtroEstado],
    queryFn: () =>
      servicioCliente.list({
        numPag: paginaActual,
        busqueda: busquedaConRetardo || undefined,
        idPais: filtroPais,
        idEstado: filtroEstado,
      }),
  });

  const { data: paises } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.PAIS],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.PAIS),
    staleTime: Infinity,
  });

  const { data: estadosCliente } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.ESTADO_CLIENTE],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.ESTADO_CLIENTE),
    staleTime: Infinity,
  });

  const crearClienteMutation = useMutation({
    mutationFn: async ({ datosCliente, contactos, tarifas }: ParametrosCrearCliente) => {
      const clienteCreado = await servicioCliente.create(
        construirPayloadCrearCliente(datosCliente),
      );

      for (const contacto of contactos) {
        await servicioCliente.createContacto(
          construirPayloadCrearContacto(clienteCreado.idCliente, contacto),
        );
      }

      for (const tarifa of tarifas) {
        await servicioCliente.createTarifario(
          construirPayloadCrearTarifa(clienteCreado.idCliente, tarifa),
        );
      }

      return clienteCreado;
    },
    onSuccess: (_, { contactos, reset }) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      if (contactos.some((contacto) => contacto.tipoContacto === 0)) {
        queryClient.invalidateQueries({ queryKey: ["masterTable", TablaMaestraId.TIPO_CONTACTO] });
      }
      setEstaAbiertoModalCrear(false);
      reset();
    },
    onError: (error: Error) => {
      console.error("Error al crear cliente:", error.message);
    },
  });

  const eliminarClienteMutation = useMutation({
    mutationFn: (idCliente: number) => servicioCliente.eliminate({ idCliente }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (error: Error) => {
      console.error("Error al desactivar cliente:", error.message);
    },
  });

  const crearCliente = (
    datosCliente: DatosFormularioInformacionCliente,
    contactos: DatosFormularioContacto[],
    tarifas: DatosFormularioTarifa[],
    reset: () => void,
  ) => {
    crearClienteMutation.mutate({ datosCliente, contactos, tarifas, reset });
  };

  const eliminarCliente = () => {
    if (!clienteAEliminar) return;
    eliminarClienteMutation.mutate(clienteAEliminar.idCliente);
    setClienteAEliminar(null);
  };

  const cambiarPaginaCliente = (pagina: number) => {
    cambiarPagina(pagina, clientesData?.totalPaginas || 1);
  };

  const cambiarFiltroPais = (ids: number[]) => {
    setFiltroPais(ids[ids.length - 1]);
    reiniciarPagina();
  };

  const cambiarFiltroEstado = (ids: number[]) => {
    setFiltroEstado(ids[ids.length - 1]);
    reiniciarPagina();
  };

  const abrirDetalleCliente = (idCliente: number) => {
    setIdClienteSeleccionado(idCliente);
    setEstaAbiertoModalDetalle(true);
    setIdMenuActivo(null);
  };

  const cerrarDetalleCliente = () => {
    setEstaAbiertoModalDetalle(false);
    setIdClienteSeleccionado(null);
  };

  const seleccionarClienteAEliminar = (cliente: ClientListEntry) => {
    setClienteAEliminar(cliente);
    setIdMenuActivo(null);
  };

  return {
    abrirDetalleCliente,
    cambiarBusqueda,
    cambiarFiltroEstado,
    cambiarFiltroPais,
    cambiarPaginaCliente,
    cerrarDetalleCliente,
    clienteAEliminar,
    clientesData,
    crearCliente,
    crearClienteMutation,
    eliminarCliente,
    eliminarClienteMutation,
    estaAbiertoModalCrear,
    estaAbiertoModalDetalle,
    estaCargandoClientes,
    estadosCliente,
    filtroEstado,
    filtroPais,
    hayErrorClientes,
    idClienteSeleccionado,
    idMenuActivo,
    paginaActual,
    paises,
    recargarClientes,
    seleccionarClienteAEliminar,
    setClienteAEliminar,
    setEstaAbiertoModalCrear,
    setIdMenuActivo,
    terminoBusqueda,
  };
}
