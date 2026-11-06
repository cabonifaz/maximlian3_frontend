export const ETIQUETA_HORAS_OFICINA_COMENTARIO = "Horas de oficina:";

export const anexarHorasOficinaAComentario = (
  comentariosOperaciones: string,
  horasOficina: string,
): string => {
  const horas = horasOficina.trim();
  if (!horas) return comentariosOperaciones;

  const lineaHoras = `${ETIQUETA_HORAS_OFICINA_COMENTARIO} ${horas}`;
  if (!comentariosOperaciones.trim()) return lineaHoras;

  return `${comentariosOperaciones}\n${lineaHoras}`;
};
