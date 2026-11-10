import type {
  CandidatoFlujoAsignacion,
  Complemento,
  FilaFlujoAsignacion,
  InformeRepositorio,
  OpcionClienteDestino,
} from "@maximilian/shared/types/flujo-informe.type";

const MILISEGUNDOS_POR_HORA = 60 * 60 * 1000;

function fechaRelativa(horas: number) {
  return new Date(Date.now() + horas * MILISEGUNDOS_POR_HORA).toISOString();
}

export const TAMANO_PAGINA_FLUJO_SIMULADO = 10;
export const RETARDO_RESPUESTA_SIMULADA_MS = 350;
export const ID_IDIOMA_ESPANOL_SIMULADO = 1;

export const PEDIDOS_FLUJO_SIMULADOS: FilaFlujoAsignacion[] = [
  {
    idPedido: 9001, cliente: "Coface Chile", investigado: "Minera Andina del Sur S.A.", pais: "Chile",
    idIdioma: 2, idiomaInforme: "Inglés", requiereTraduccion: true, prioridad: "super-flash",
    fechaPedido: fechaRelativa(-20), fechaVencimiento: fechaRelativa(28), etapa: "sin-asignar",
    idUsuarioAnalista: null, analista: null, idUsuarioTraductor: null, traductor: null,
    idInformeAnalista: null, idInformeTraductor: null, fechaFinAnalisis: null, rechazado: false, fechaFinalizacion: null,
  },
  {
    idPedido: 9002, cliente: "Atradius Iberia", investigado: "Textiles San Miguel S.A.C.", pais: "Perú",
    idIdioma: 1, idiomaInforme: "Español", requiereTraduccion: false, prioridad: "normal",
    fechaPedido: fechaRelativa(-48), fechaVencimiento: fechaRelativa(140), etapa: "sin-asignar",
    idUsuarioAnalista: null, analista: null, idUsuarioTraductor: null, traductor: null,
    idInformeAnalista: null, idInformeTraductor: null, fechaFinAnalisis: null, rechazado: false, fechaFinalizacion: null,
  },
  {
    idPedido: 9003, cliente: "Allianz Trade", investigado: "Agroexportadora Pacífico S.A.", pais: "Ecuador",
    idIdioma: 2, idiomaInforme: "Inglés", requiereTraduccion: true, prioridad: "express",
    fechaPedido: fechaRelativa(-30), fechaVencimiento: fechaRelativa(60), etapa: "sin-asignar",
    idUsuarioAnalista: null, analista: null, idUsuarioTraductor: null, traductor: null,
    idInformeAnalista: null, idInformeTraductor: null, fechaFinAnalisis: null, rechazado: false, fechaFinalizacion: null,
  },
  {
    idPedido: 9004, cliente: "Coface Chile", investigado: "Constructora Los Andes Ltda.", pais: "Chile",
    idIdioma: 1, idiomaInforme: "Español", requiereTraduccion: false, prioridad: "express",
    fechaPedido: fechaRelativa(-60), fechaVencimiento: fechaRelativa(20), etapa: "en-analisis",
    idUsuarioAnalista: 501, analista: "Lucía Ramírez Soto", idUsuarioTraductor: null, traductor: null,
    idInformeAnalista: 7004, idInformeTraductor: null, fechaFinAnalisis: null, rechazado: false, fechaFinalizacion: null,
  },
  {
    idPedido: 9005, cliente: "Crédito y Caución", investigado: "Distribuidora Norte S.A.", pais: "Colombia",
    idIdioma: 2, idiomaInforme: "Inglés", requiereTraduccion: true, prioridad: "normal",
    fechaPedido: fechaRelativa(-96), fechaVencimiento: fechaRelativa(100), etapa: "en-analisis",
    idUsuarioAnalista: 502, analista: "Jorge Medina Paredes", idUsuarioTraductor: null, traductor: null,
    idInformeAnalista: 7005, idInformeTraductor: null, fechaFinAnalisis: null, rechazado: false, fechaFinalizacion: null,
  },
  {
    idPedido: 9006, cliente: "Allianz Trade", investigado: "Pesquera Austral S.A.", pais: "Perú",
    idIdioma: 3, idiomaInforme: "Portugués", requiereTraduccion: true, prioridad: "super-flash",
    fechaPedido: fechaRelativa(-14), fechaVencimiento: fechaRelativa(-2), etapa: "en-analisis",
    idUsuarioAnalista: 501, analista: "Lucía Ramírez Soto", idUsuarioTraductor: null, traductor: null,
    idInformeAnalista: 7006, idInformeTraductor: null, fechaFinAnalisis: null, rechazado: false, fechaFinalizacion: null,
  },
  {
    idPedido: 9007, cliente: "Atradius Iberia", investigado: "Laboratorios Vida Sana S.A.", pais: "Bolivia",
    idIdioma: 2, idiomaInforme: "Inglés", requiereTraduccion: true, prioridad: "express",
    fechaPedido: fechaRelativa(-70), fechaVencimiento: fechaRelativa(16), etapa: "listo-traduccion",
    idUsuarioAnalista: 503, analista: "Carla Gutiérrez Ríos", idUsuarioTraductor: null, traductor: null,
    idInformeAnalista: 7007, idInformeTraductor: null, fechaFinAnalisis: fechaRelativa(-3), rechazado: false, fechaFinalizacion: null,
  },
  {
    idPedido: 9008, cliente: "Coface Chile", investigado: "Inversiones del Valle S.A.", pais: "Chile",
    idIdioma: 1, idiomaInforme: "Español", requiereTraduccion: false, prioridad: "normal",
    fechaPedido: fechaRelativa(-120), fechaVencimiento: fechaRelativa(50), etapa: "listo-traduccion",
    idUsuarioAnalista: 502, analista: "Jorge Medina Paredes", idUsuarioTraductor: null, traductor: null,
    idInformeAnalista: 7008, idInformeTraductor: null, fechaFinAnalisis: fechaRelativa(-1), rechazado: false, fechaFinalizacion: null,
  },
  {
    idPedido: 9009, cliente: "Allianz Trade", investigado: "Transportes Rápidos del Sur S.A.", pais: "Argentina",
    idIdioma: 2, idiomaInforme: "Inglés", requiereTraduccion: true, prioridad: "super-flash",
    fechaPedido: fechaRelativa(-10), fechaVencimiento: fechaRelativa(10), etapa: "listo-traduccion",
    idUsuarioAnalista: 501, analista: "Lucía Ramírez Soto", idUsuarioTraductor: null, traductor: null,
    idInformeAnalista: 7009, idInformeTraductor: null, fechaFinAnalisis: fechaRelativa(-0.5), rechazado: false, fechaFinalizacion: null,
  },
  {
    idPedido: 9010, cliente: "Crédito y Caución", investigado: "Energía Solar Atacama SpA", pais: "Chile",
    idIdioma: 2, idiomaInforme: "Inglés", requiereTraduccion: true, prioridad: "express",
    fechaPedido: fechaRelativa(-80), fechaVencimiento: fechaRelativa(30), etapa: "en-traduccion",
    idUsuarioAnalista: 503, analista: "Carla Gutiérrez Ríos", idUsuarioTraductor: 601, traductor: "Ana Torres Vega",
    idInformeAnalista: 7010, idInformeTraductor: 8010, fechaFinAnalisis: fechaRelativa(-20), rechazado: false, fechaFinalizacion: null,
  },
  {
    idPedido: 9011, cliente: "Atradius Iberia", investigado: "Comercializadora Lima Centro S.A.C.", pais: "Perú",
    idIdioma: 1, idiomaInforme: "Español", requiereTraduccion: false, prioridad: "normal",
    fechaPedido: fechaRelativa(-150), fechaVencimiento: fechaRelativa(40), etapa: "en-traduccion",
    idUsuarioAnalista: 502, analista: "Jorge Medina Paredes", idUsuarioTraductor: 602, traductor: "Martín Salas Cruz",
    idInformeAnalista: 7011, idInformeTraductor: 8011, fechaFinAnalisis: fechaRelativa(-30), rechazado: true, fechaFinalizacion: null,
  },
  {
    idPedido: 9012, cliente: "Coface Chile", investigado: "Viñedos del Maule S.A.", pais: "Chile",
    idIdioma: 2, idiomaInforme: "Inglés", requiereTraduccion: true, prioridad: "super-flash",
    fechaPedido: fechaRelativa(-22), fechaVencimiento: fechaRelativa(4), etapa: "por-revisar",
    idUsuarioAnalista: 501, analista: "Lucía Ramírez Soto", idUsuarioTraductor: 601, traductor: "Ana Torres Vega",
    idInformeAnalista: 7012, idInformeTraductor: 8012, fechaFinAnalisis: fechaRelativa(-12), rechazado: false, fechaFinalizacion: null,
  },
  {
    idPedido: 9013, cliente: "Allianz Trade", investigado: "Química Industrial Andes S.A.", pais: "Colombia",
    idIdioma: 1, idiomaInforme: "Español", requiereTraduccion: false, prioridad: "express",
    fechaPedido: fechaRelativa(-90), fechaVencimiento: fechaRelativa(26), etapa: "por-revisar",
    idUsuarioAnalista: 503, analista: "Carla Gutiérrez Ríos", idUsuarioTraductor: 602, traductor: "Martín Salas Cruz",
    idInformeAnalista: 7013, idInformeTraductor: 8013, fechaFinAnalisis: fechaRelativa(-40), rechazado: false, fechaFinalizacion: null,
  },
];

export const ANALISTAS_SIMULADOS: CandidatoFlujoAsignacion[] = [
  { idUsuario: 501, nombre: "Lucía Ramírez Soto", cantidadAsignaciones: 3 },
  { idUsuario: 502, nombre: "Jorge Medina Paredes", cantidadAsignaciones: 3 },
  { idUsuario: 503, nombre: "Carla Gutiérrez Ríos", cantidadAsignaciones: 3 },
  { idUsuario: 504, nombre: "Diego Fernández Luna", cantidadAsignaciones: 0 },
];

export const TRADUCTORES_SIMULADOS: CandidatoFlujoAsignacion[] = [
  { idUsuario: 601, nombre: "Ana Torres Vega", cantidadAsignaciones: 2 },
  { idUsuario: 602, nombre: "Martín Salas Cruz", cantidadAsignaciones: 2 },
  { idUsuario: 603, nombre: "Sofía Herrera Paz", cantidadAsignaciones: 0 },
];

export const ID_TRADUCTOR_SESION_SIMULADO = 601;
export const NOMBRE_TRADUCTOR_SESION_SIMULADO = "Ana Torres Vega";

export const CLIENTES_DESTINO_SIMULADOS: OpcionClienteDestino[] = [
  { idCliente: 301, nombre: "Coface Chile" },
  { idCliente: 302, nombre: "Atradius Iberia" },
  { idCliente: 303, nombre: "Allianz Trade" },
  { idCliente: 304, nombre: "Crédito y Caución" },
  { idCliente: 305, nombre: "Euler Hermes Perú" },
];

export const INFORMES_REPOSITORIO_SIMULADOS: InformeRepositorio[] = [
  {
    idInforme: 8101, idCompania: 4001, tipo: "informe", investigado: "Viñedos del Maule S.A.", pais: "Chile",
    cliente: "Coface Chile", idioma: "Inglés", traductor: "Ana Torres Vega", fechaAprobacion: fechaRelativa(-24 * 120),
    idInformeBase: null, esUltimaVersion: false,
  },
  {
    idInforme: 8102, idCompania: 4001, tipo: "complemento", investigado: "Viñedos del Maule S.A.", pais: "Chile",
    cliente: "Allianz Trade", idioma: "Inglés", traductor: "Martín Salas Cruz", fechaAprobacion: fechaRelativa(-24 * 30),
    idInformeBase: 8101, esUltimaVersion: true,
  },
  {
    idInforme: 8103, idCompania: 4002, tipo: "informe", investigado: "Textiles San Miguel S.A.C.", pais: "Perú",
    cliente: "Atradius Iberia", idioma: "Español", traductor: "Sofía Herrera Paz", fechaAprobacion: fechaRelativa(-24 * 200),
    idInformeBase: null, esUltimaVersion: true,
  },
  {
    idInforme: 8104, idCompania: 4003, tipo: "informe", investigado: "Pesquera Austral S.A.", pais: "Perú",
    cliente: "Allianz Trade", idioma: "Portugués", traductor: "Ana Torres Vega", fechaAprobacion: fechaRelativa(-24 * 365),
    idInformeBase: null, esUltimaVersion: false,
  },
  {
    idInforme: 8105, idCompania: 4003, tipo: "informe", investigado: "Pesquera Austral S.A.", pais: "Perú",
    cliente: "Crédito y Caución", idioma: "Inglés", traductor: "Martín Salas Cruz", fechaAprobacion: fechaRelativa(-24 * 90),
    idInformeBase: null, esUltimaVersion: true,
  },
  {
    idInforme: 8106, idCompania: 4004, tipo: "informe", investigado: "Energía Solar Atacama SpA", pais: "Chile",
    cliente: "Crédito y Caución", idioma: "Inglés", traductor: "Ana Torres Vega", fechaAprobacion: fechaRelativa(-24 * 45),
    idInformeBase: null, esUltimaVersion: true,
  },
  {
    idInforme: 8107, idCompania: 4005, tipo: "informe", investigado: "Laboratorios Vida Sana S.A.", pais: "Bolivia",
    cliente: "Atradius Iberia", idioma: "Inglés", traductor: "Sofía Herrera Paz", fechaAprobacion: fechaRelativa(-24 * 15),
    idInformeBase: null, esUltimaVersion: true,
  },
];

export const COMPLEMENTOS_SIMULADOS: Complemento[] = [
  {
    idComplemento: 8201, idCompania: 4002, investigado: "Textiles San Miguel S.A.C.", pais: "Perú",
    idInformeBase: 8103, tipoInformeBase: "informe", clienteBase: "Atradius Iberia",
    idClienteDestino: 305, clienteDestino: "Euler Hermes Perú", idioma: "Español",
    idUsuarioTraductor: 601, traductor: "Ana Torres Vega", estado: "en-proceso",
    fechaCreacion: fechaRelativa(-30), fechaModificacion: fechaRelativa(-2), idInforme: null, codigo: null, idPlantilla: null,
  },
  {
    idComplemento: 8202, idCompania: 4004, investigado: "Energía Solar Atacama SpA", pais: "Chile",
    idInformeBase: 8106, tipoInformeBase: "informe", clienteBase: "Crédito y Caución",
    idClienteDestino: 301, clienteDestino: "Coface Chile", idioma: "Inglés",
    idUsuarioTraductor: 602, traductor: "Martín Salas Cruz", estado: "pendiente-aprobacion",
    fechaCreacion: fechaRelativa(-72), fechaModificacion: fechaRelativa(-5), idInforme: null, codigo: null, idPlantilla: null,
  },
  {
    idComplemento: 8203, idCompania: 4001, investigado: "Viñedos del Maule S.A.", pais: "Chile",
    idInformeBase: 8102, tipoInformeBase: "complemento", clienteBase: "Allianz Trade",
    idClienteDestino: 302, clienteDestino: "Atradius Iberia", idioma: "Inglés",
    idUsuarioTraductor: 603, traductor: "Sofía Herrera Paz", estado: "rechazado",
    fechaCreacion: fechaRelativa(-100), fechaModificacion: fechaRelativa(-8), idInforme: null, codigo: null, idPlantilla: null,
  },
];
