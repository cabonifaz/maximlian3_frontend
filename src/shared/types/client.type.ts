export type CreateClientRateRequest = {
  idProducto: number;
  idTipoTramite: number;
  idPais: number;
  idMoneda: number;
  diasMax: number;
  diasMin: number;
  precio: number;
  penalidad: number;
};

export type CreateClientContactRequest = {
  nombres: string;
  idTipoPersonaContacto: number;
  idTipoContacto: number;
  areaTrabajo: number;
  telefono: string;
  email: string;
  codigo: string | null;
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
  idFormatoDocumento: number;
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

export type ClientDetailContact = {
  idContacto: number;
  nombres: string;
  idTipoContacto: number;
  areaTrabajo: number;
  telefono: string;
  email: string;
};

export type ClientDetail = {
  idCliente: number;
  idTipoPersona: number;
  nombre: string;
  nombreCorto: string;
  idPais: number;
  idRegistroTributario: number;
  numRegistroTributario: string;
  correo: string;
  webSite: string;
  telefono: string;
  direccion: string;
  idFormatoDocumento: number;
  estado: string;
  contactos: ClientDetailContact[];
};

export type ClientListRequest = {
  numPag: number;
  busqueda?: string;
};

export type ClientListEntry = {
  idCliente: number;
  nombre: string;
  idPais: number;
  idTipoPersona: number;
  email: string;
  telefono: string;
  idEstado: number;
};

export type ClientListResponse = {
  lstClientes: ClientListEntry[];
  totalRegistros: number;
  totalPaginas: number;
};

export interface DeleteClientRequest {
  idCliente: number;
}
