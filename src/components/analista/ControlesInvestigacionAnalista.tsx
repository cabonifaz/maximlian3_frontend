import type { ReactNode } from "react";
import { Briefcase, Building2, Check, Eye, FileText, Landmark, LibraryBig, Lock, Paperclip, Sparkles, User, Users } from "lucide-react";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import type { IdSeccionInvestigacionAnalista, ResumenInvestigacionAnalista } from "@maximilian/shared/types/analista.type";

const clasesEtiquetaCampoInvestigacion =
  "text-sm font-bold text-gray-700";

const marcadoresPorEtiqueta: Record<string, string> = {
  "Nombre de la Empresa": "Ingrese el nombre legal de la empresa",
  "Nombre Comercial": "Ingrese el nombre comercial",
  "Operaciones de Cambio": "Describa las operaciones de cambio",
  "Tipo de Identificación Fiscal": "Ingrese el tipo de identificación fiscal",
  "Número de Identificación Fiscal": "Ingrese el número de identificación fiscal",
  "Dirección Principal": "Ingrese la dirección principal",
  "Ciudad/Estado/Provincia": "Ingrese la ciudad, estado o provincia",
  "Número de Teléfono": "Ej. +51 2 1234567",
  "Número de Fax": "Ej. +51 2 1234568",
  "Correo Electrónico": "Ej. contacto@empresa.com",
  "Página Web": "Ej. www.empresa.com",
  "Estado Actual": "Describa el estado actual",
  "Datos Adicionales": "Ingrese datos adicionales relevantes",
  "Tipo de Empresa": "Ingrese el tipo de empresa",
  "Fecha de Constitución": "Ej. 31/12/2020",
  "Ciudad de Registro": "Ingrese la ciudad de registro",
  Notaría: "Ingrese la notaría correspondiente",
  Notario: "Ingrese el nombre del notario",
  Registro: "Ingrese el número o detalle de registro",
  Condiciones: "Describa las condiciones registrales o legales",
  "Operaciones de Cambio Divisas": "Describa las operaciones de cambio de divisas",
  "Capital Inicial": "Ej. 100000",
  "Capital Desembolsado": "Ej. 75000",
  "Última Ampliación": "Detalle la última ampliación de capital",
  "Patrimonio Neto": "Ej. 250000",
  "Tipo de Acciones": "Describa el tipo de acciones",
  "Valor de las Acciones": "Ej. 10.00",
  "Obligación en Bolsa": "Indique si cotiza o tiene obligación en bolsa",
  "Tipo de Cambio": "Ej. 6.96",
  Antecedentes: "Ingrese los antecedentes relevantes",
  "Aspectos Legales": "Describa los aspectos legales relevantes",
  "Comentarios sobre Empresas Relacionadas": "Ingrese comentarios sobre las empresas relacionadas",
  Sector: "Ingrese el sector económico",
  Actividad: "Ingrese la actividad económica",
  "Categoría CIIU": "Ej. Categoría C",
  "Clase CIIU": "Ej. 2811",
  "Actividad Principal": "Describa la actividad principal",
  "Ventas al Contado (%)": "Ej. 25%",
  "Detalle Ventas al Contado": "Describa cómo se realizan las ventas al contado",
  "Ventas a Crédito (%)": "Ej. 75%",
  "Detalle Ventas a Crédito": "Describa cómo se realizan las ventas a crédito",
  "Territorio de Ventas": "Ej. Nacional",
  "Detalle Territorio": "Detalle las zonas o mercados de venta",
  "(%) Ventas en el Extranjero": "Ej. 30%",
  "Detalle Ventas Extranjero": "Detalle las ventas realizadas en el extranjero",
  "(%) Compras Nacionales": "Ej. 65%",
  "Detalle Compras Nacionales": "Detalle las compras realizadas en el mercado nacional",
  "(%) Compras en el Extranjero": "Ej. 35%",
  "Detalle Compras Extranjero": "Detalle las compras realizadas en el extranjero",
  "N. de Empleados": "Ej. 120",
  "Detalle Empleados": "Describa la distribución o tipo de empleados",
  "Comentarios sobre las Operaciones": "Ingrese comentarios sobre las operaciones",
  Contenido: "Describa el contenido de la información financiera",
  "Comentarios Financieros": "Ingrese comentarios sobre la situación financiera",
  "Activos": "Describa los activos relevantes",
  Seguros: "Detalle las pólizas o coberturas de seguro",
  "Comentarios de los Proveedores": "Ingrese comentarios obtenidos de los proveedores",
  "Referencias de Bancos": "Ingrese las referencias bancarias consultadas",
  Litigios: "Describa litigios o procesos legales vigentes",
  "Riesgo Principal": "Describa el riesgo principal identificado",
  Superintendencia: "Ingrese información de la superintendencia o ente regulador",
  "Información General": "Ingrese la información general de la empresa",
  "Opinión de Crédito": "Redacte la opinión de crédito",
};

function obtenerMarcadorInvestigacion(etiqueta: string) {
  const marcador = marcadoresPorEtiqueta[etiqueta];
  if (marcador) return marcador;

  const etiquetaNormalizada = etiqueta.toLowerCase();

  if (etiquetaNormalizada.includes("correo")) return "Ej. usuario@empresa.com";
  if (etiquetaNormalizada.includes("página web")) return "Ej. www.empresa.com";
  if (etiquetaNormalizada.includes("telefono") || etiquetaNormalizada.includes("fax")) return "Ej. +51 2 1234567";
  if (etiquetaNormalizada.includes("fecha")) return "Ej. 31/12/2025";
  if (etiquetaNormalizada.includes("%")) return "Ej. 25%";
  if (etiquetaNormalizada.includes("monto") || etiquetaNormalizada.includes("capital") || etiquetaNormalizada.includes("valor")) {
    return "Ej. 100000";
  }
  if (
    etiquetaNormalizada.includes("comentario") ||
    etiquetaNormalizada.includes("detalle") ||
    etiquetaNormalizada.includes("descripción") ||
    etiquetaNormalizada.includes("información")
  ) {
    return `Ingrese ${etiquetaNormalizada}`;
  }

  return `Ingrese ${etiquetaNormalizada}`;
}

interface PropsCampoInvestigacionAnalista {
  etiqueta: string;
  valor: string;
  soloLectura: boolean;
  marcador?: string;
  className?: string;
  onChange?: (valor: string) => void;
}

interface PropsAreaInvestigacionAnalista extends PropsCampoInvestigacionAnalista {
  filas?: number;
}

interface PropsPestanasInvestigacionAnalista {
  opciones: Array<{ id: string; etiqueta: string; disabled?: boolean; tooltip?: string }>;
  valorActivo: string;
  onChange: (valor: string) => void;
}

interface PropsContenedorSeccionInvestigacionAnalista {
  numero: number;
  titulo: string;
  children: ReactNode;
  botonExtra?: ReactNode;
}

interface PropsMenuSeccionesInvestigacionAnalista {
  idSeccionActiva: IdSeccionInvestigacionAnalista;
  onSeleccionar: (id: IdSeccionInvestigacionAnalista) => void;
  estadoSecciones?: Partial<Record<IdSeccionInvestigacionAnalista, "borrador" | "completado">>;
  secciones: Array<{
    id: IdSeccionInvestigacionAnalista;
    titulo: string;
  }>;
}

interface PropsResumenPedidoInvestigacionAnalista {
  resumen: ResumenInvestigacionAnalista;
  esSoloLectura: boolean;
  mostrarBotonFinalizar: boolean;
  onFinalizarInvestigacion?: () => void;
  onExtraerInformacion?: () => void;
  onAbrirArchivos?: () => void;
}

export function CampoInvestigacionAnalista({
  etiqueta,
  valor,
  soloLectura,
  marcador,
  className,
  onChange,
}: PropsCampoInvestigacionAnalista) {
  const marcadorFinal = marcador ?? obtenerMarcadorInvestigacion(etiqueta);

  return (
    <label className={`space-y-2 ${className ?? ""}`}>
      <CustomLabel as="p" className={clasesEtiquetaCampoInvestigacion}>
        {etiqueta}
      </CustomLabel>
      <input
        value={valor}
        readOnly={soloLectura}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={marcadorFinal}
        className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-slate-600 outline-none transition-all focus:border-brand-black focus:ring-2 focus:ring-brand-black/5 read-only:bg-slate-50 read-only:text-slate-400"
      />
    </label>
  );
}

export function AreaInvestigacionAnalista({
  etiqueta,
  valor,
  soloLectura,
  marcador,
  filas = 4,
  className,
  onChange,
}: PropsAreaInvestigacionAnalista) {
  const marcadorFinal = marcador ?? obtenerMarcadorInvestigacion(etiqueta);

  return (
    <label className={`space-y-2 ${className ?? ""}`}>
      <CustomLabel as="p" className={clasesEtiquetaCampoInvestigacion}>
        {etiqueta}
      </CustomLabel>
      <textarea
        value={valor}
        readOnly={soloLectura}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={marcadorFinal}
        rows={filas}
        className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-600 outline-none transition-all focus:border-brand-black focus:ring-2 focus:ring-brand-black/5 read-only:bg-slate-50 read-only:text-slate-400"
      />
    </label>
  );
}

export function PestanasInvestigacionAnalista({
  opciones,
  valorActivo,
  onChange,
}: PropsPestanasInvestigacionAnalista) {
  return (
    <div className="flex flex-wrap gap-6 border-b border-gray-100">
      {opciones.map((opcion) => {
        const activa = opcion.id === valorActivo;

        return (
          <div key={opcion.id} className="group relative">
            <button
              type="button"
              disabled={opcion.disabled}
              onClick={() => {
                if (opcion.disabled) return;
                onChange(opcion.id);
              }}
              className={`border-b-2 pb-3 text-xs font-bold uppercase tracking-[0.12em] transition-colors ${
                opcion.disabled
                  ? "cursor-not-allowed border-transparent text-slate-200"
                  : activa
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-300 hover:text-slate-500"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                {opcion.disabled ? <Lock size={12} /> : null}
                {opcion.etiqueta}
              </span>
            </button>
            {opcion.disabled && opcion.tooltip ? (
              <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-56 -translate-x-1/2 rounded-lg bg-brand-black px-3 py-2 text-center text-xs font-medium text-white shadow-lg group-hover:block">
                {opcion.tooltip}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function ContenedorSeccionInvestigacionAnalista({
  numero,
  titulo,
  children,
  botonExtra,
}: PropsContenedorSeccionInvestigacionAnalista) {
  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-red-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-red-400">
            Sección {numero}/8
          </span>
          <h2 className="text-2xl font-bold text-brand-black">{titulo}</h2>
        </div>
        {botonExtra}
      </div>
      {children}
    </section>
  );
}

export function MenuSeccionesInvestigacionAnalista({
  idSeccionActiva,
  onSeleccionar,
  estadoSecciones,
  secciones,
}: PropsMenuSeccionesInvestigacionAnalista) {
  const iconos = {
    identificacion: <User size={14} />,
    "aspectos-legales": <Briefcase size={14} />,
    "ramo-operaciones": <Sparkles size={14} />,
    "informacion-financiera": <LibraryBig size={14} />,
    balances: <FileText size={14} />,
    "bancos-proveedores": <Landmark size={14} />,
    "datos-generales": <Building2 size={14} />,
    "directorio-ejecutivo": <Users size={14} />,
  };

  return (
    <aside className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
        Secciones del Reporte
      </p>
      <div className="space-y-3">
        {secciones.map((seccion) => {
          const estaActiva = seccion.id === idSeccionActiva;
          const estadoSeccion = estadoSecciones?.[seccion.id];

          return (
            <div key={seccion.id} className="group relative">
              <button
                type="button"
                onClick={() => onSeleccionar(seccion.id)}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-all ${
                  estaActiva
                    ? "bg-[#eb5b53] text-white shadow-sm"
                    : "bg-slate-50 text-slate-500 hover:scale-[1.02] hover:bg-brand-wine/8 hover:text-brand-wine hover:shadow-sm active:scale-[0.98]"
                }`}
              >
                {iconos[seccion.id]}
                <span className="flex-1">{seccion.titulo}</span>
                {estadoSeccion === "completado" ? <Check size={16} className={estaActiva ? "text-white" : "text-emerald-500"} /> : null}
                {estadoSeccion === "borrador" ? <Eye size={16} className={estaActiva ? "text-white" : "text-amber-500"} /> : null}
              </button>
              {estadoSeccion === "borrador" ? (
                <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-52 -translate-x-1/2 rounded-lg bg-brand-black px-3 py-2 text-center text-xs font-medium text-white shadow-lg group-hover:block">
                  Te quedaste aquí. Guardamos esta sección como borrador para que la retomes cuando quieras.
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

export function ResumenPedidoInvestigacionAnalista({
  resumen,
  esSoloLectura,
  mostrarBotonFinalizar,
  onFinalizarInvestigacion,
  onExtraerInformacion,
  onAbrirArchivos,
}: PropsResumenPedidoInvestigacionAnalista) {
  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5">
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300">
            Datos del Pedido
          </p>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="border-l-[4px] border-brand-black pl-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300">
                ID
              </p>
              <p className="mt-1 text-sm font-bold text-slate-900">{resumen.codigo}</p>
            </div>
            <div className="xl:border-l xl:border-gray-100 xl:pl-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300">Nombre Solicitado</p>
              <p className="mt-1 text-sm font-bold text-slate-900">{resumen.nombreSolicitado}</p>
            </div>
            <div className="xl:border-l xl:border-gray-100 xl:pl-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300">País</p>
              <p className="mt-1 text-sm font-bold text-slate-900">🇲🇽 {resumen.pais}</p>
            </div>
            <div className="xl:border-l xl:border-gray-100 xl:pl-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300">Prioridad</p>
              <p className="mt-1 text-sm font-bold uppercase text-blue-500">{resumen.prioridad}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={onAbrirArchivos} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-slate-500">
            <Paperclip size={14} />
            Archivos
          </button>
          <CustomButton
            size="sm"
            disabled={esSoloLectura}
            className="bg-[#2563eb] text-white hover:bg-[#1d4ed8] shadow-md shadow-blue-500/20"
            onClick={onExtraerInformacion}
          >
            <Sparkles size={14} />
            Extraer Información
          </CustomButton>
          {mostrarBotonFinalizar ? (
            <CustomButton size="sm" onClick={onFinalizarInvestigacion}>Finalizar Investigación</CustomButton>
          ) : null}
        </div>
      </div>
    </section>
  );
}
