import { useState } from "react";
import { X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
import type { RegistroImportacionExportacionAnalista } from "@maximilian/shared/types/investigacion.type";
import type { EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";

function crearOpcionTablaMaestra(num1: number, string1: string): EntradaTablaMaestra {
  return {
    idEmpresa: 0,
    idTablaMaestra: null,
    idMaestro: 0,
    descripcion: "",
    num1,
    num2: null,
    num3: null,
    string1,
    string2: null,
    string3: null,
    date1: null,
    date2: null,
    date3: null,
  };
}

function normalizarMontoDosDecimales(valor: string) {
  const valorLimpio = valor.trim().replace(",", ".");
  if (!valorLimpio) return "";

  const numero = Number.parseFloat(valorLimpio);
  if (Number.isNaN(numero)) return valor;

  return numero.toFixed(2);
}

function sanitizarMontoDosDecimales(valor: string) {
  const valorNormalizado = valor.replace(",", ".").replace(/[^0-9.]/g, "");
  const partes = valorNormalizado.split(".");
  const entero = partes[0] ?? "";
  const decimal = partes[1] ?? "";
  return partes.length > 1 ? `${entero}.${decimal.slice(0, 2)}` : entero;
}

function sanitizarEntero(valor: string) {
  return valor.replace(/\D/g, "");
}

interface PropsCustomModalOperacionAnalista {
  estaAbierto: boolean;
  titulo: string;
  subtitulo: string;
  registroInicial?: RegistroImportacionExportacionAnalista | null;
  onCerrar: () => void;
  onGuardar: (registro: RegistroImportacionExportacionAnalista) => void;
}

const opcionesMeses: EntradaTablaMaestra[] = [
  crearOpcionTablaMaestra(1, "Enero"),
  crearOpcionTablaMaestra(2, "Febrero"),
  crearOpcionTablaMaestra(3, "Marzo"),
  crearOpcionTablaMaestra(4, "Abril"),
  crearOpcionTablaMaestra(5, "Mayo"),
  crearOpcionTablaMaestra(6, "Junio"),
  crearOpcionTablaMaestra(7, "Julio"),
  crearOpcionTablaMaestra(8, "Agosto"),
  crearOpcionTablaMaestra(9, "Septiembre"),
  crearOpcionTablaMaestra(10, "Octubre"),
  crearOpcionTablaMaestra(11, "Noviembre"),
  crearOpcionTablaMaestra(12, "Diciembre"),
];

const opcionesMoneda: EntradaTablaMaestra[] = [
  crearOpcionTablaMaestra(1, "US Dollar"),
  crearOpcionTablaMaestra(2, "Euro"),
  crearOpcionTablaMaestra(3, "Sol"),
];

export function CustomModalOperacionAnalista({
  estaAbierto,
  titulo,
  subtitulo,
  registroInicial,
  onCerrar,
  onGuardar,
}: PropsCustomModalOperacionAnalista) {
  const [anio, setAnio] = useState(registroInicial?.anio ?? "2025");
  const [mes, setMes] = useState(registroInicial?.mes ?? "");
  const [idMoneda, setIdMoneda] = useState<number | undefined>(
    opcionesMoneda.find((opcion) => opcion.string1 === registroInicial?.moneda)?.num1 ?? undefined,
  );
  const [monto, setMonto] = useState(registroInicial?.monto ?? "");
  const [paises, setPaises] = useState(registroInicial?.paises ?? "");
  const [productos, setProductos] = useState(registroInicial?.productos ?? "");
  const [operaciones, setOperaciones] = useState(registroInicial?.operaciones ?? "");

  const monedaActual =
    opcionesMoneda.find((opcion) => opcion.num1 === idMoneda)?.string1 ?? registroInicial?.moneda ?? "";

  if (!estaAbierto) return null;

  const manejarGuardar = () => {
    if (!anio.trim() || !monedaActual.trim() || !monto.trim() || !paises.trim() || !productos.trim() || !operaciones.trim()) {
      return;
    }

    onGuardar({
      anio: anio.trim(),
      mes: mes.trim(),
      moneda: monedaActual.trim(),
      paises: paises.trim(),
      productos: productos.trim(),
      monto: normalizarMontoDosDecimales(monto),
      operaciones: sanitizarEntero(operaciones),
    });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm">
      <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-[22px] bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5 md:px-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8ea0c0]">{subtitulo}</p>
            <h2 className="mt-1 text-[18px] font-bold text-slate-800">{titulo}</h2>
          </div>
          <CustomButton variant="ghost" size="icon" onClick={onCerrar}>
            <X size={18} className="text-[#c2cad8]" />
          </CustomButton>
        </div>

        <div className="grid gap-5 overflow-y-auto px-6 py-5 md:grid-cols-2 md:px-8 md:py-7">
          <div className="space-y-2">
            <CustomLabel>Año</CustomLabel>
            <input
              value={anio}
              onChange={(event) => setAnio(event.target.value.replace(/\D/g, "").slice(0, 4))}
              inputMode="numeric"
              placeholder="2025"
              className="h-11 w-full rounded-xl border border-[#dbe4f0] px-4 text-sm text-slate-700 outline-none transition-all focus:border-brand-black focus:ring-2 focus:ring-brand-black/5"
            />
          </div>

          <CustomSelectorBuscable
            label="Mes"
            options={opcionesMeses}
            value={opcionesMeses.find((opcion) => opcion.string1 === mes)?.num1 ?? undefined}
            displayValue={mes}
            onChange={(valor) => setMes(opcionesMeses.find((opcion) => opcion.num1 === valor)?.string1 ?? "")}
            placeholder="Seleccione mes"
          />

          <CustomSelectorBuscable
            label="Operaciones de Cambio"
            options={opcionesMoneda}
            value={idMoneda ?? undefined}
            displayValue={monedaActual}
            onChange={setIdMoneda}
          />

          <div className="space-y-2">
            <CustomLabel>Monto</CustomLabel>
            <input
              value={monto}
              onChange={(event) => setMonto(sanitizarMontoDosDecimales(event.target.value))}
              onBlur={(event) => setMonto(normalizarMontoDosDecimales(event.target.value))}
              placeholder="0.00"
              className="h-11 w-full rounded-xl border border-[#dbe4f0] px-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-300 focus:border-brand-black focus:ring-2 focus:ring-brand-black/5"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <CustomLabel>Países</CustomLabel>
            <input
              value={paises}
              onChange={(event) => setPaises(event.target.value)}
              placeholder="Ingrese los países de exportación"
              className="h-11 w-full rounded-xl border border-[#dbe4f0] px-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-300 focus:border-brand-black focus:ring-2 focus:ring-brand-black/5"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <CustomLabel>Productos</CustomLabel>
            <input
              value={productos}
              onChange={(event) => setProductos(event.target.value)}
              placeholder="Especifique los productos"
              className="h-11 w-full rounded-xl border border-[#dbe4f0] px-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-300 focus:border-brand-black focus:ring-2 focus:ring-brand-black/5"
            />
          </div>

          <div className="space-y-2 md:max-w-[220px]">
            <CustomLabel>Operaciones</CustomLabel>
            <input
              value={operaciones}
              onChange={(event) => setOperaciones(sanitizarEntero(event.target.value))}
              inputMode="numeric"
              placeholder="Ej. 1"
              className="h-11 w-full rounded-xl border border-[#dbe4f0] px-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-300 focus:border-brand-black focus:ring-2 focus:ring-brand-black/5"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-5 md:px-8">
          <CustomButton variant="secondary" size="sm" onClick={onCerrar}>
            Cancelar
          </CustomButton>
          <CustomButton size="sm" onClick={manejarGuardar}>
            Guardar
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
