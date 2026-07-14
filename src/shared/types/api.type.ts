export const MessageType = {
  BUSINESS_RULE_VIOLATION: 1,
  SUCCESS: 2,
  ERROR: 3,
} as const;

export type MessageType = (typeof MessageType)[keyof typeof MessageType];

export type ApiResponse<T> = {
  idTipoMensaje: MessageType;
  mensaje: string;
  result: T;
};

export class ErrorRespuestaApi<T = unknown> extends Error {
  readonly respuesta: ApiResponse<T>;

  constructor(respuesta: ApiResponse<T>) {
    super(respuesta.mensaje);
    this.name = "ErrorRespuestaApi";
    this.respuesta = respuesta;
  }

  get idTipoMensaje(): MessageType {
    return this.respuesta.idTipoMensaje;
  }
}

export function esErrorRespuestaApi(error: unknown): error is ErrorRespuestaApi {
  return error instanceof ErrorRespuestaApi;
}
