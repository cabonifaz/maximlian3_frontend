import { useState } from "react";
import { X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
import type { RegistroImportacionExportacionAnalista } from "@maximilian/shared/types/analista.type";
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
  const [idMes, setIdMes] = useState<number | undefined>(undefined);
  const [idMoneda, setIdMoneda] = useState<number | undefined>(undefined);
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
      moneda: monedaActual.trim(),
      paises: paises.trim(),
      productos: productos.trim(),
      monto: monto.trim(),
      operaciones: operaciones.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-8 py-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8ea0c0]">{subtitulo}</p>
            <h2 className="mt-2 text-xl font-bold text-brand-black">{titulo}</h2>
          </div>
          <CustomButton variant="ghost" size="icon" onClick={onCerrar}>
            <X size={20} className="text-[#8ea0c0]" />
          </CustomButton>
        </div>

        <div className="space-y-6 px-8 py-7">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <CustomLabel>Año</CustomLabel>
              <input
                value={anio}
                onChange={(event) => setAnio(event.target.value)}
                className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none transition-all focus:border-brand-black focus:ring-2 focus:ring-brand-black/5"
              />
            </div>
            <CustomSelectorBuscable
              label="Meses"
              options={opcionesMeses}
              value={idMes}
              onChange={setIdMes}
              placeholder="Seleccione mes"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <CustomSelectorBuscable
              label="Operaciones de Cambio"
              options={opcionesMoneda}
              value={idMoneda}
              displayValue={monedaActual}
              onChange={setIdMoneda}
            />
            <div className="space-y-2">
              <CustomLabel>Monto</CustomLabel>
              <input
                value={monto}
                onChange={(event) => setMonto(event.target.value)}
                placeholder="$ .00"
                className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none transition-all placeholder:text-gray-300 focus:border-brand-black focus:ring-2 focus:ring-brand-black/5"
              />
            </div>
          </div>

          <div className="space-y-2">
            <CustomLabel>Países</CustomLabel>
            <input
              value={paises}
              onChange={(event) => setPaises(event.target.value)}
              placeholder="Ingrese los países de exportación"
              className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none transition-all placeholder:text-gray-300 focus:border-brand-black focus:ring-2 focus:ring-brand-black/5"
            />
          </div>

          <div className="space-y-2">
            <CustomLabel>Productos</CustomLabel>
            <input
              value={productos}
              onChange={(event) => setProductos(event.target.value)}
              placeholder="Especifique los productos"
              className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none transition-all placeholder:text-gray-300 focus:border-brand-black focus:ring-2 focus:ring-brand-black/5"
            />
          </div>

          <div className="max-w-[200px] space-y-2">
            <CustomLabel>Operaciones</CustomLabel>
            <input
              value={operaciones}
              onChange={(event) => setOperaciones(event.target.value)}
              placeholder="Ej. 1"
              className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none transition-all placeholder:text-gray-300 focus:border-brand-black focus:ring-2 focus:ring-brand-black/5"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-8 py-5">
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
