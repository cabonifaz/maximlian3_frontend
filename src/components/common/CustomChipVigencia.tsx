import { CustomChipEstado } from "@maximilian/components/common/CustomChipEstado";

interface PropsCustomChipVigencia {
  texto?: string | number | null;
  colorTexto?: string;
  colorFondo?: string;
}

export function CustomChipVigencia({
  texto: valor,
  colorTexto,
  colorFondo,
}: PropsCustomChipVigencia) {
  const texto = String(valor || "-").trim();
  const esVencido = texto.toLowerCase().includes("venc");
  const esConcluido = texto.toLowerCase().includes("conclu");
  const dias = texto.match(/\d+/)?.[0];
  const esVencimientoInmediato = !esVencido && !esConcluido && dias != null && Number(dias) <= 1;
  const colorCalculado = esConcluido
    ? "#2563eb"
    : colorTexto || (esVencido ? "#dc2626" : esVencimientoInmediato ? "#b45309" : "#166534");
  const fondoCalculado = esConcluido
    ? "#eff6ff"
    : colorFondo || (esVencido ? "#fef2f2" : esVencimientoInmediato ? "#fffbeb" : "#ecfdf5");

  return (
    <CustomChipEstado
      colorTexto={colorCalculado}
      colorFondo={fondoCalculado}
      forma="tarjeta"
      tamano="amplio"
      className="min-w-24 flex-col justify-center text-center font-semibold"
    >
      <span>{esVencido ? "Vencido" : texto}</span>
      {esVencido && dias ? (
        <span className="text-[11px] font-medium opacity-80">
          {dias} {dias === "1" ? "día" : "días"}
        </span>
      ) : null}
    </CustomChipEstado>
  );
}
