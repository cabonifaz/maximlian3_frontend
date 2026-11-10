// SRC-F1-065 (asignaciones_cambios.sql). FUNCIONALIDADES_HABILITADAS.datosSimuladosFlujoInforme vuelve a
// los datos simulados en memoria si hace falta trabajar sin el backend.
export const ENDPOINTS_FLUJO_INFORME = {
  listarPorEtapa: "/api/Asignacion/listarPorEtapa",
  asignarRol: "/api/Asignacion/asignarRol",
  listarRepositorio: "/api/Informe/listarRepositorio",
  listarComplementos: "/api/InformeComplemento/listar",
  crearComplemento: "/api/InformeComplemento/crear",
  enviarAprobacionComplemento: "/api/InformeComplemento/enviarAprobacion",
  listarClientesDestino: "/api/InformeComplemento/listarClientesDestino",
} as const;
