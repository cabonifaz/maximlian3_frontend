export type CreateClientContactRequest = {
  nombres: string;
  idTipoContacto: number;
  areaTrabajo: number;
  telefono: string;
  email: string;
};

export type CreateClientRequest = {
  idTipoPersona: number;
  nombre: string;
  nombreCorto: string;
  idPais: number;
  idRegistroTributario: number;
  numRegistroTributario: string;
  correo: string;
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
  Filtro?: string;
};

export type ClientListEntry = {
  idCliente: number;
  nombre: string;
  pais: string;
  tipoPersona: string;
  correo: string;
  telefono: string;
};

export type ClientListResponse = {
  lstClientes: ClientListEntry[];
  totalRegistros: number;
  totalPaginas: number;
};
