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
