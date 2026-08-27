export const ESTADO_CLIENTE_ACCION = {
  ACTIVAR: 1,
  DESACTIVAR: 2,
} as const;

export const CLIENT_COLUMNS = [
  { label: "Nombre", width: "24%" },
  { label: "País", width: "12%" },
  { label: "Tipo de Persona", width: "14%" },
  { label: "Teléfono", width: "13%" },
  { label: "Correo", width: "22%" },
  { label: "Estado", width: "9%" },
  { label: "Acciones", className: "text-right", width: "6%" },
];
