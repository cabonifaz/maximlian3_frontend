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
  const dias = texto.match(/\d+/)?.[0];
  const esVencimientoInmediato = !esVencido && dias != null && Number(dias) <= 1;
  const colorCalculado = colorTexto
    || (esVencido ? "#dc2626" : esVencimientoInmediato ? "#b45309" : "#166534");
  const fondoCalculado = colorFondo
    || (esVencido ? "#fef2f2" : esVencimientoInmediato ? "#fffbeb" : "#ecfdf5");

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
