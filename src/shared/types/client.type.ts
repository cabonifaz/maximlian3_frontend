export type CreateClientRateRequest = {
  idProducto: number;
  idTipoTramite: number;
  idPais: number;
  idMoneda: number;
  diasMax: number;
  diasMin: number;
  precio: number;
  penalidad?: number;
};

export type CreateClientContactRequest = {
  nombres: string;
  idTipoPersonaContacto: number;
  idTipoContacto: number;
  tipoContacto?: string | null;
  areaTrabajo: number;
  telefono: string;
  email: string;
  codigo: string | null;
  enviarCorreo: boolean;
};

export type CreateClientRequest = {
  idTipoPersona: number;
  nombre: string;
  nombreCorto: string;
  idPais: number;
  idRegistroTributario: number;
  numRegistroTributario: string;
  email: string;
  idEstado: number;
  webSite: string;
  telefono: string;
  fax: string;
  direccion: string;
  recomendacion: string;
  idEmpresaAtencion: number;
  idIdioma: number;
  logoClienteUrl: string;
  imprimeLogoSafety: boolean;
  lstIdFormatoDocumento: number[];
  idMoneda: number;
  idIdiomaFacturacion: number;
  aplicaPenalidad: boolean;
  idPlantilla: number;
  contactos: CreateClientContactRequest[];
  tarifario: CreateClientRateRequest[];
};

export type CreateClientResponse = {
  idCliente: number;
};


export type ClientDetail = {
  idCliente: number;
  idEmpresa: number;
  idTipoPersona: number;
  nombre: string;
  nombreCorto: string | null;
  idPais: number;
  idRegistroTributario: number;
  numRegistroTributario: string | null;
  email: string | null;
  webSite: string | null;
  telefono: string | null;
  fax: string | null;
  direccion: string | null;
  recomendacion: string | null;
  idEmpresaAtencion: number;
  idIdioma: number;
  logoClienteUrl: string | null;
  imprimeLogoSafety: boolean;
  lstIdFormatoDocumento: number[];
  idMoneda: number;
  idIdiomaFacturacion: number;
  aplicaPenalidad: boolean;
  idPlantilla: number;
  idEstado: number;
};

export type UpdateClientRequest = Omit<CreateClientRequest, 'contactos' | 'tarifario'> & {
  idCliente: number;
};

export type ClientListRequest = {
  numPag: number;
  busqueda?: string;
  idPais?: number;
  idEstado?: number;
};

export type ClientListEntry = {
  idCliente: number;
  nombre: string;
  email: string;
  telefono: string;
  pais: string;
  tipoPersona: string;
  estado: string;
};

export type ClientListResponse = {
  lstClientes: ClientListEntry[];
  totalRegistros: number;
  totalPaginas: number;
};

export interface DeleteClientRequest {
  idCliente: number;
}

export type TarifarioListEntry = {
  idTarifario: number;
  idCliente: number;
  producto: string;
  tipoTramite: string;
  pais: string;
  moneda: string;
  diasMax: number;
  diasMin: number;
  diasMinMax: string;
  precio: number;
  penalidad: number;
};

export type TarifarioListResponse = {
  lstTarifario: TarifarioListEntry[];
  totalRegistros: number;
  totalPaginas: number;
};

export type ContactoListEntry = {
  idClienteContacto: number;
  codigo: string;
  nombres: string;
  tipoContacto: string;
  areaTrabajo: string;
  telefono: string;
  email: string;
  enviarCorreo: boolean;
};

export type ContactoListResponse = {
  lstClienteContactos: ContactoListEntry[];
  totalRegistros: number;
  totalPaginas: number;
};

export type CreateTarifarioRequest = {
  idCliente: number;
  idProducto: number;
  idTipoTramite: number;
  idPais: number;
  idMoneda: number;
  diasMax: number;
  diasMin: number;
  precio: number;
  penalidad?: number;
};

export type UpdateTarifarioRequest = CreateTarifarioRequest & { idTarifario: number };
export type DeleteTarifarioRequest = { idTarifario: number; idCliente: number };

export type CreateContactoRequest = {
  idCliente: number;
  codigo: string | null;
  nombres: string;
  idTipoPersonaContacto: number;
  idTipoContacto: number;
  tipoContacto?: string | null;
  idAreaTrabajo: number;
  telefono: string | null;
  email: string | null;
  enviarCorreo: boolean;
};

export type UpdateContactoRequest = {
  idClienteContacto: number;
  idCliente: number;
  codigo: string | null;
  nombres: string;
  idTipoPersonaContacto: number;
  idTipoContacto: number;
  tipoContacto?: string | null;
  idAreaTrabajo: number;
  telefono: string | null;
  email: string | null;
  enviarCorreo: boolean;
};

export type DeleteContactoRequest = { idClienteContacto: number; idCliente: number };

export type TarifarioDetail = {
  idTarifario: number;
  idCliente: number;
  idProducto: number;
  idTipoTramite: number;
  idPais: number;
  idMoneda: number;
  diasMax: number;
  diasMin: number;
  precio: number;
  penalidad: number;
};

export type GetTarifarioRequest = { idTarifario: number; idCliente: number };
export type GetContactoRequest = { idClienteContacto: number; idCliente: number };

export type ContactoDetail = {
  idClienteContacto: number;
  idCliente: number;
  codigo: string | null;
  nombres: string;
  idTipoPersonaContacto: number;
  idTipoContacto: number;
  idAreaTrabajo: number;
  telefono: string | null;
  email: string | null;
  enviarCorreo: boolean;
};

export interface ClienteCorta {
  idCliente: number;
  numeroDocumento: string;
  nombreCliente: string;
  idIdioma: number;
  logoImprimible: boolean;
  idPlantilla: number;
}

export interface ClienteListaCortaResponse {
  LstCliente: ClienteCorta[];
}

export type TarifarioCortaEntry = {
  idTarifario: number;
  tipoTramite: string;
  idMoneda: number;
  moneda: string;
  simboloMoneda: string;
  precio: number;
  idPais: number;
  idProducto: number;
  idTipoTramite: number;
};

export type TarifarioCortaResponse = {
  LstTarifario: TarifarioCortaEntry[];
};
