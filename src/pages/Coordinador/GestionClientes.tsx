import { CLIENT_COLUMNS } from "@maximilian/shared/constants/pages/Coordinador/gestion-clientes.constants";
import { useState } from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  UserMinus,
  Edit,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ModalAgregarCliente } from "@maximilian/components/coordinador/ModalAgregarCliente";
import { ModalDetalleCliente } from "@maximilian/components/coordinador/ModalDetalleCliente";
import { CustomModalConfirmacionEliminacion } from "@maximilian/components/common/CustomModalConfirmacionEliminacion";
import { CustomEncabezadoFiltroTabla } from "@maximilian/components/common/CustomEncabezadoFiltroTabla";
import { CustomTabla } from "@maximilian/components/common/CustomTabla";
import { CustomChipEstado } from "@maximilian/components/common/CustomChipEstado";
import { useListadoPaginado } from "@maximilian/hooks/useListadoPaginado";
import { servicioCliente } from "@maximilian/services/cliente.service";
import { servicioTablaMaestra } from "@maximilian/services/tabla-maestra.service";
import {
  type DatosFormularioInformacionCliente,
  type DatosFormularioContacto,
  type DatosFormularioTarifa,
} from "@maximilian/schemas";
import { type CreateClientRequest, type ClientListEntry } from "@maximilian/shared/types/cliente.type";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";

interface ClientMutationParams {
  data: DatosFormularioInformacionCliente;
  contacts: DatosFormularioContacto[];
  rates: DatosFormularioTarifa[];
  reset: () => void;
}

export default function GestionClientes() {
  const {
    terminoBusqueda,
    paginaActual,
    busquedaConRetardo,
    cambiarBusqueda,
    cambiarPagina,
    reiniciarPagina,
  } = useListadoPaginado();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [idMenuActivo, setActiveMenuId] = useState<number | null>(null);
  const [clientToDelete, setClientToDelete] = useState<ClientListEntry | null>(null);
  const [filterPais, setFilterPais] = useState<number | undefined>(undefined);
  const [filterEstado, setFilterEstado] = useState<number | undefined>(undefined);

  const queryClient = useQueryClient();

  const {
    data: clientsData,
    isLoading: isLoadingClients,
    isError: isErrorClients,
    refetch: refetchClients,
  } = useQuery({
    queryKey: ["clients", paginaActual, busquedaConRetardo, filterPais, filterEstado],
    queryFn: () =>
      servicioCliente.list({
        numPag: paginaActual,
        busqueda: busquedaConRetardo || undefined,
        idPais: filterPais,
        idEstado: filterEstado,
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


  const createClientMutation = useMutation({
    mutationFn: ({ data, contacts, rates }: ClientMutationParams) => {
      const apiRequest: CreateClientRequest = {
        idTipoPersona: data.tipoPersona as number,
        nombre: data.nombre,
        nombreCorto: data.nombre.substring(0, 20),
        idPais: data.pais as number,
        idRegistroTributario: data.tipoRegistroTributario as number,
        numRegistroTributario: data.numRegistroTributario ?? "",
        correo: data.correo,
        idEstado: 1,
        webSite: data.sitioWeb || "",
        telefono: data.telefono ?? "",
        fax: data.fax ?? "",
        direccion: data.direccion ?? "",
        recomendacion: data.recomendacion ?? "",
        idEmpresaAtencion: data.atendidoPor as number,
        idIdioma: data.idioma as number,
        logoClienteUrl: "",
        imprimeLogoSafety: data.imprimeLogoSafety,
        lstIdFormatoDocumento: data.formatoInforme as number[],
        idMoneda: data.moneda as number,
        idIdiomaFacturacion: data.idiomaFacturacion as number,
        aplicaPenalidad: data.aplicaPenalidad,
        idPlantilla: data.plantillaInforme,
        contactos: contacts.map((c) => ({
          nombres: c.nombre,
          idTipoPersonaContacto: c.tipoPersona as number,
          idTipoContacto: c.tipoContacto as number,
          tipoContacto: c.tipoContacto === 0 ? (c.tipoContactoNuevo ?? null) : null,
          areaTrabajo: c.areaTrabajo as number,
          telefono: c.telefono ?? "",
          correo: c.correo,
          codigo: c.codigoContacto || null,
          enviarCorreo: c.enviarCorreo,
        })),
        tarifario: rates.map((r) => ({
          idProducto: r.producto as number,
          idTipoTramite: r.tramite as number,
          idPais: r.pais as number,
          idMoneda: r.moneda as number,
          diasMax: r.diasMax,
          diasMin: r.diasMin,
          precio: r.precio,
          penalidad: r.penalidad,
        })),
      };
      return servicioCliente.create(apiRequest);
    },
    onSuccess: (_, { contacts, reset }) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      if (contacts.some((c) => c.tipoContacto === 0)) {
        queryClient.invalidateQueries({ queryKey: ["masterTable", TablaMaestraId.TIPO_CONTACTO] });
      }
      setIsModalOpen(false);
      reset();
    },
    onError: (error: Error) => {
      console.error("Error al crear cliente:", error.message);
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: (idCliente: number) => servicioCliente.eliminate({ idCliente }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (error: Error) => {
      console.error("Error al desactivar cliente:", error.message);
    },
  });

  const handleConfirmCreate = (
    data: DatosFormularioInformacionCliente,
    contacts: DatosFormularioContacto[],
    rates: DatosFormularioTarifa[],
    reset: () => void,
  ) => {
    createClientMutation.mutate({ data, contacts, rates, reset });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    cambiarBusqueda(e.target.value);
  };

  const handlePageChange = (page: number) => {
    cambiarPagina(page, clientsData?.totalPaginas || 1);
  };

  const columnas = CLIENT_COLUMNS.map((columna, indice) => {
    if (indice === 1) {
      return {
        ...columna,
        label: (
          <CustomEncabezadoFiltroTabla
            titulo="Pais"
            opciones={paises}
            valores={filterPais ? [filterPais] : []}
            onChange={(ids) => setFilterPais(ids[ids.length - 1])}
            onFiltroCambiado={reiniciarPagina}
            multiple={false}
          />
        ),
      };
    }

    if (indice === 5) {
      return {
        ...columna,
        label: (
          <CustomEncabezadoFiltroTabla
            titulo="Estado"
            opciones={estadosCliente}
            valores={filterEstado ? [filterEstado] : []}
            onChange={(ids) => setFilterEstado(ids[ids.length - 1])}
            onFiltroCambiado={reiniciarPagina}
            multiple={false}
          />
        ),
      };
    }

    return columna;
  });

  const renderRow = (client: ClientListEntry, index: number) => (
    <>
      <td className="px-6 py-4">
        <span className="block truncate text-sm font-bold text-brand-black" title={client.nombre}>
          {client.nombre}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-gray-600">{client.pais || "-"}</span>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-gray-600 capitalize">
          {client.tipoPersona?.toLowerCase() || "-"}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="block truncate text-sm font-medium text-gray-600" title={client.telefono}>
          {client.telefono}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="block truncate text-sm text-gray-500" title={client.correo}>
          {client.correo}
        </span>
      </td>
      <td className="px-6 py-4">
        {client.estado ? (
          <CustomChipEstado
            claseColor={client.estado.toLowerCase() === "activo"
              ? "bg-green-50 text-green-600"
              : "bg-gray-100 text-gray-500"}
          >
            {client.estado}
          </CustomChipEstado>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        )}
      </td>
      <td className="px-6 py-4 text-right relative">
        <button
          onClick={() =>
            setActiveMenuId(
              idMenuActivo === client.idCliente ? null : client.idCliente,
            )
          }
          className="p-2 text-gray-400 hover:text-brand-black hover:bg-gray-100 rounded-lg transition-all cursor-pointer hover:scale-110 active:scale-90"
        >
          <MoreHorizontal size={18} />
        </button>

        {idMenuActivo === client.idCliente && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setActiveMenuId(null)}
            />
            <div
              className={`absolute right-6 ${
                index >= (clientsData?.lstClientes.length ?? 0) - 2
                  ? "bottom-10"
                  : "top-10"
              } w-48 bg-brand-white rounded-xl shadow-2xl border border-gray-200/50 py-1 z-20 animate-in fade-in zoom-in-95 duration-100`}
            >
              <button
                onClick={() => {
                  setSelectedClientId(client.idCliente);
                  setIsDetailModalOpen(true);
                  setActiveMenuId(null);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Edit size={14} />
                <span>Modificar Cliente</span>
              </button>
              <button
                onClick={() => {
                  setClientToDelete(client);
                  setActiveMenuId(null);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer transition-colors"
              >
                <UserMinus size={14} />
                <span>Desactivar cliente</span>
              </button>
            </div>
          </>
        )}
      </td>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">Clientes</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Busca por nombre o nro. de registro tributario"
              className="w-full pl-10 pr-4 py-2 bg-brand-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all"
              value={terminoBusqueda}
              onChange={handleSearchChange}
            />
          </div>


          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-wine text-brand-white rounded-lg text-sm font-medium hover:bg-brand-wine/90 transition-all shadow-sm shadow-brand-wine/20 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={16} />
            <span>Agregar Cliente</span>
          </button>
        </div>
      </div>

      <CustomTabla
        columns={columnas}
        data={clientsData?.lstClientes}
        getId={(c) => c.idCliente}
        renderRow={renderRow}
        isLoading={isLoadingClients}
        isError={isErrorClients}
        onRetry={() => refetchClients()}
        emptyMessage="No se encontraron clientes."
        errorMessage="Error al cargar los clientes"
        paginaActual={paginaActual}
        totalPages={clientsData?.totalPaginas ?? 1}
        totalRecords={clientsData?.totalRegistros ?? 0}
        onPageChange={handlePageChange}
        entityLabel="clientes"
      />

      <ModalAgregarCliente
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmCreate}
        isSubmitting={createClientMutation.isPending}
      />

      <ModalDetalleCliente
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedClientId(null);
        }}
        clientId={selectedClientId}
      />

      <CustomModalConfirmacionEliminacion
        isOpen={clientToDelete !== null}
        onClose={() => setClientToDelete(null)}
        onConfirm={() => {
          deleteClientMutation.mutate(clientToDelete!.idCliente);
          setClientToDelete(null);
        }}
        title="Desactivar cliente"
        isSubmitting={deleteClientMutation.isPending}
      >
        <p><span className="font-bold">Nombre:</span> {clientToDelete?.nombre ?? "-"}</p>
        <p><span className="font-bold">Correo:</span> {clientToDelete?.correo ?? "-"}</p>
      </CustomModalConfirmacionEliminacion>
    </div>
  );
}
