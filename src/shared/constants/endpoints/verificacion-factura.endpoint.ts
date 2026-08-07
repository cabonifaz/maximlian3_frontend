export const ENDPOINTS_VERIFICACION_FACTURA = {
  obtenerFactura: (token: string) => `/api/VerificacionFactura/${token}`,
  obtenerUrlDescarga: (token: string) =>
    `/api/VerificacionFactura/${token}/urlDescarga`,
} as const;
