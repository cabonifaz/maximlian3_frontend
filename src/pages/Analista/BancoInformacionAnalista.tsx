import { useMemo, useState, type ReactNode } from "react";
import {
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Filter,
  Plus,
  Search,
  UploadCloud,
  X,
} from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";

type PestanaBancoInformacion = "noticias" | "credito" | "empresas";
type PestanaDetalleCredito = "balance" | "ganancias" | "ratios";

interface NoticiaBancoInformacion {
  id: number;
  empresa: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  autor: string;
  adjuntos: string[];
}

interface ReporteCreditoBancoInformacion {
  id: number;
  empresa: string;
  pais: string;
  fecha: string;
  tipo: string;
  estado: "Vigente" | "Expirado";
}

interface EmpresaBancoInformacion {
  id: number;
  razonSocial: string;
  pais: string;
  direccion: string;
  telefono: string;
  actividadComercial: string;
  trabajadores: number;
}

const noticiasMock: NoticiaBancoInformacion[] = [
  {
    id: 1,
    empresa: "Global Bank Corp",
    titulo: "Analisis de volatilidad en mercados emergentes",
    descripcion:
      "Un estudio detallado sobre las fluctuaciones recientes en las divisas de LATAM y Asia-Pacifico. Se identifican patrones de riesgo asociados a cambios en politica monetaria global y su impacto directo en carteras de inversion diversificadas.",
    fecha: "12 OCT 2023",
    autor: "Riesgo Global",
    adjuntos: ["reporte_volatilidad_final.pdf", "anexo_metodologia_riesgo.xlsx"],
  },
  {
    id: 2,
    empresa: "EuroFin Solutions",
    titulo: "Nuevas regulaciones tributarias en la UE",
    descripcion:
      "La Comision Europea ha publicado el borrador final para la directiva de transparencia fiscal digital. Las instituciones financieras deben preparar sus sistemas para el reporte automatico de transacciones transfronterizas antes del cierre de 2024.",
    fecha: "10 OCT 2023",
    autor: "Legal Compliance",
    adjuntos: ["directiva_ue_resumen.pdf"],
  },
  {
    id: 3,
    empresa: "Credit Financial Group",
    titulo: "Reporte de solvencia bancaria Q3",
    descripcion:
      "Los indicadores de liquidez muestran una tendencia positiva en el sector bancario nacional. El ratio de cobertura de liquidez promedio ha superado el 120%, fortaleciendo la posicion ante posibles escenarios de estres financiero.",
    fecha: "08 OCT 2023",
    autor: "Analisis Financiero",
    adjuntos: ["reporte_solvencia_q3.pdf", "anexo_ratios.xlsx"],
  },
];

const reportesCreditoMock: ReporteCreditoBancoInformacion[] = [
  { id: 1, empresa: "Empresa Textilera Peruana", pais: "Peru", fecha: "30 ENE 2026", tipo: "Balance desagregado", estado: "Vigente" },
  { id: 2, empresa: "Inversiones Pacifico Sur", pais: "Chile", fecha: "25 ENE 2026", tipo: "Balance general", estado: "Vigente" },
  { id: 3, empresa: "Soluciones Logisticas S.A.", pais: "Colombia", fecha: "04 FEB 2026", tipo: "Balance bancos", estado: "Vigente" },
  { id: 4, empresa: "Importaciones Globales S.R.L.", pais: "Mexico", fecha: "13 DIC 2025", tipo: "Balance compra activos", estado: "Expirado" },
  { id: 5, empresa: "Distribuidora Alianza S.A.", pais: "Peru", fecha: "10 DIC 2025", tipo: "Balance desagregado", estado: "Expirado" },
  { id: 6, empresa: "Constructora del Norte", pais: "Ecuador", fecha: "20 DIC 2025", tipo: "Balance general", estado: "Expirado" },
];

const empresasMock: EmpresaBancoInformacion[] = [
  {
    id: 1,
    razonSocial: "Empresa Textilera Peruana S.A.C.",
    pais: "Peru",
    direccion: "Av. Industrial 450, Ate, Lima",
    telefono: "(01) 458-3900",
    actividadComercial: "Fabricacion de tejidos y articulos de punto para exportacion",
    trabajadores: 124,
  },
  {
    id: 2,
    razonSocial: "Inversiones Pacifico Sur S.A.",
    pais: "Chile",
    direccion: "Calle Las Orquideas 565, San Isidro, Piso 12",
    telefono: "(01) 221-3450",
    actividadComercial: "Actividades de holding, gestion de activos y consultoria financiera",
    trabajadores: 45,
  },
  {
    id: 3,
    razonSocial: "Soluciones Logisticas Mundiales S.A.",
    pais: "Colombia",
    direccion: "Jr. Ucayali 104, Cercado de Lima",
    telefono: "(01) 610-1200",
    actividadComercial: "Transporte de carga por carretera y servicios de aduanas",
    trabajadores: 88,
  },
  {
    id: 4,
    razonSocial: "Importaciones Globales S.R.L.",
    pais: "Mexico",
    direccion: "Av. Benavides 1245, Miraflores",
    telefono: "(01) 445-8899",
    actividadComercial: "Venta al por mayor de maquinaria pesada y repuestos industriales",
    trabajadores: 32,
  },
  {
    id: 5,
    razonSocial: "Distribuidora Alianza S.A.",
    pais: "Peru",
    direccion: "Parque Industrial Mza. D Lote 12, Callao",
    telefono: "(01) 577-3000",
    actividadComercial: "Comercio de productos alimenticios al por mayor y menor",
    trabajadores: 215,
  },
  {
    id: 6,
    razonSocial: "Constructora del Norte E.I.R.L.",
    pais: "Ecuador",
    direccion: "Av. Mansiche 1024, Urb. El Recreo",
    telefono: "(044) 218-0012",
    actividadComercial: "Construccion de edificios residenciales y obras publicas",
    trabajadores: 56,
  },
];

const etiquetasPestanas: Record<PestanaBancoInformacion, string> = {
  noticias: "Noticias",
  credito: "Inf. Crediticio",
  empresas: "Empresas",
};

const camposBalance = [
  "Total corrientes",
  "Total no corrientes",
  "Otros activos",
  "Total activos",
  "Total pasivos corrientes",
  "Total pasivos no corrientes",
  "Otros pasivos",
  "Total pasivos",
  "Patrimonio",
  "Total pasivo y patrimonio",
];

const camposGanancias = ["Ventas netas", "Utilidad / ganancia"];
const camposRatios = ["Indice de liquidez", "Capital de trabajo", "Tasa de endeudamiento", "Ratio de rentabilidad"];

export default function BancoInformacionAnalista() {
  const [pestanaActiva, setPestanaActiva] = useState<PestanaBancoInformacion>("noticias");
  const [busqueda, setBusqueda] = useState("");
  const [noticiaDetalle, setNoticiaDetalle] = useState<NoticiaBancoInformacion | null>(null);
  const [estaAbiertoModalNoticia, setEstaAbiertoModalNoticia] = useState(false);
  const [reporteDetalle, setReporteDetalle] = useState<ReporteCreditoBancoInformacion | null>(null);
  const [estaAbiertoModalExportar, setEstaAbiertoModalExportar] = useState(false);

  const noticiasFiltradas = useMemo(
    () => filtrarPorBusqueda(noticiasMock, busqueda, ["titulo", "empresa", "descripcion"]),
    [busqueda],
  );
  const reportesFiltrados = useMemo(
    () => filtrarPorBusqueda(reportesCreditoMock, busqueda, ["empresa", "pais", "tipo", "estado"]),
    [busqueda],
  );
  const empresasFiltradas = useMemo(
    () => filtrarPorBusqueda(empresasMock, busqueda, ["razonSocial", "pais", "direccion", "actividadComercial"]),
    [busqueda],
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Banco de Informacion</h1>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
          <input
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            className="h-12 w-full rounded-xl border border-slate-100 bg-white pl-11 pr-4 text-sm text-slate-600 outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
            placeholder={pestanaActiva === "empresas" ? "Buscar por Razon Social o RUC..." : "Buscar noticias, reportes o articulos..."}
          />
        </label>
        <CustomButton variant="secondary" size="sm" className="h-12 rounded-xl bg-white text-slate-600">
          <Filter size={14} />
          {pestanaActiva === "empresas" ? "Filtros Avanzados" : "Filtros"}
        </CustomButton>
      </div>

      <div className="border-b border-slate-100">
        <div className="flex gap-8">
          {(Object.keys(etiquetasPestanas) as PestanaBancoInformacion[]).map((pestana) => (
            <button
              key={pestana}
              type="button"
              onClick={() => setPestanaActiva(pestana)}
              className={`border-b-2 px-1 pb-4 text-[11px] font-bold uppercase tracking-[0.16em] transition ${
                pestanaActiva === pestana
                  ? "border-slate-950 text-slate-950"
                  : "border-transparent text-slate-400 hover:text-slate-700"
              }`}
            >
              {etiquetasPestanas[pestana]}
            </button>
          ))}
        </div>
      </div>

      {pestanaActiva === "noticias" ? (
        <SeccionNoticias
          noticias={noticiasFiltradas}
          onAgregar={() => setEstaAbiertoModalNoticia(true)}
          onVerDetalle={setNoticiaDetalle}
        />
      ) : null}
      {pestanaActiva === "credito" ? (
        <SeccionCredito reportes={reportesFiltrados} onVerDetalle={setReporteDetalle} />
      ) : null}
      {pestanaActiva === "empresas" ? (
        <SeccionEmpresas empresas={empresasFiltradas} onExportar={() => setEstaAbiertoModalExportar(true)} />
      ) : null}

      <CustomPaginacion texto={obtenerTextoPaginacion(pestanaActiva, noticiasFiltradas.length, reportesFiltrados.length, empresasFiltradas.length)} />

      <CustomModalDetalleNoticia noticia={noticiaDetalle} onCerrar={() => setNoticiaDetalle(null)} />
      <CustomModalAgregarNoticia estaAbierto={estaAbiertoModalNoticia} onCerrar={() => setEstaAbiertoModalNoticia(false)} />
      <CustomModalDetalleCredito reporte={reporteDetalle} onCerrar={() => setReporteDetalle(null)} />
      <CustomModalExportarEmpresas estaAbierto={estaAbiertoModalExportar} onCerrar={() => setEstaAbiertoModalExportar(false)} />
    </div>
  );
}

function SeccionNoticias({
  noticias,
  onAgregar,
  onVerDetalle,
}: {
  noticias: NoticiaBancoInformacion[];
  onAgregar: () => void;
  onVerDetalle: (noticia: NoticiaBancoInformacion) => void;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-300">Noticias recientes</p>
        <CustomButton size="sm" onClick={onAgregar}>
          <Plus size={14} />
          Agregar Noticia
        </CustomButton>
      </div>

      <div className="space-y-4">
        {noticias.map((noticia) => (
          <article key={noticia.id} className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 space-y-3">
                <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-400">
                  <span className="rounded-md bg-slate-50 px-2 py-1 text-slate-500">Empresa relacionada: {noticia.empresa}</span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays size={12} />
                    {noticia.fecha}
                  </span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-950">{noticia.titulo}</h2>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{noticia.descripcion}</p>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <span>Hace 2 horas</span>
                  <span>{noticia.autor}</span>
                </div>
              </div>
              <CustomButton size="sm" onClick={() => onVerDetalle(noticia)} className="shrink-0">
                Ver Detalle
              </CustomButton>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function SeccionCredito({
  reportes,
  onVerDetalle,
}: {
  reportes: ReporteCreditoBancoInformacion[];
  onVerDetalle: (reporte: ReporteCreditoBancoInformacion) => void;
}) {
  return (
    <section className="space-y-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-300">Reportes de credito actualizados</p>
      <div className="grid gap-5 lg:grid-cols-2">
        {reportes.map((reporte) => (
          <article key={reporte.id} className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <IndicadorPais pais={reporte.pais} />
                  <h2 className="text-base font-bold text-slate-950">{reporte.empresa}</h2>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                    <CalendarDays size={12} />
                    {reporte.fecha}
                  </span>
                </div>
                <span className="inline-flex rounded-md bg-slate-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  {reporte.tipo}
                </span>
                <p className="text-xs font-semibold text-slate-400">
                  Estado:{" "}
                  <span className={reporte.estado === "Vigente" ? "text-emerald-500" : "text-slate-400"}>
                    {reporte.estado}
                  </span>
                </p>
              </div>
              <CustomButton size="sm" onClick={() => onVerDetalle(reporte)} className="shrink-0">
                Ver Detalle
              </CustomButton>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function SeccionEmpresas({
  empresas,
  onExportar,
}: {
  empresas: EmpresaBancoInformacion[];
  onExportar: () => void;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-300">Listado de empresas registradas</p>
        <button
          type="button"
          onClick={onExportar}
          className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-blue-500 transition hover:text-blue-600"
        >
          <Download size={14} />
          Exportar
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              <tr>
                <th className="px-5 py-4">Razon Social</th>
                <th className="px-5 py-4">Pais</th>
                <th className="px-5 py-4">Direccion</th>
                <th className="px-5 py-4">Telefono</th>
                <th className="px-5 py-4">Actividad Comercial</th>
                <th className="px-5 py-4 text-right">Trab.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {empresas.map((empresa) => (
                <tr key={empresa.id} className="text-sm text-slate-500 transition hover:bg-slate-50">
                  <td className="px-5 py-4 font-bold text-slate-800">{empresa.razonSocial}</td>
                  <td className="px-5 py-4">
                    <IndicadorPais pais={empresa.pais} />
                  </td>
                  <td className="max-w-[220px] px-5 py-4">{empresa.direccion}</td>
                  <td className="px-5 py-4">{empresa.telefono}</td>
                  <td className="max-w-[300px] px-5 py-4">{empresa.actividadComercial}</td>
                  <td className="px-5 py-4 text-right font-semibold text-slate-700">{empresa.trabajadores}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function CustomModalDetalleNoticia({
  noticia,
  onCerrar,
}: {
  noticia: NoticiaBancoInformacion | null;
  onCerrar: () => void;
}) {
  if (!noticia) return null;

  return (
    <CustomModalBase ancho="max-w-5xl" onCerrar={onCerrar}>
      <div className="flex items-start justify-between border-b border-slate-100 px-8 py-6">
        <h2 className="text-base font-bold text-slate-950">Detalle de Noticia</h2>
        <BotonCerrar onCerrar={onCerrar} />
      </div>
      <div className="grid gap-8 px-8 py-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-7">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Titulo del articulo</p>
            <h3 className="mt-3 text-2xl font-bold leading-tight text-slate-950">{noticia.titulo}</h3>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Descripcion</p>
            <p className="mt-3 text-sm leading-7 text-slate-500">{noticia.descripcion}</p>
          </div>
          <div className="border-t border-slate-100 pt-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Empresa relacionada</p>
            <p className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-slate-800">
              <Building2 size={14} />
              {noticia.empresa}
            </p>
          </div>
        </div>
        <div>
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Documentos adjuntos</p>
          <div className="space-y-3">
            {noticia.adjuntos.map((adjunto) => (
              <div key={adjunto} className="rounded-lg border border-slate-100 bg-white p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                    <FileText size={16} />
                  </span>
                  <span className="min-w-0 truncate text-xs font-bold text-slate-700">{adjunto}</span>
                </div>
                <div className="mt-3 flex gap-4 text-[10px] font-bold uppercase tracking-wide">
                  <button className="text-slate-950" type="button">Descargar</button>
                  <button className="text-slate-400" type="button">Ver</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-end border-t border-slate-100 px-8 py-5">
        <CustomButton size="sm" onClick={onCerrar}>Cerrar</CustomButton>
      </div>
    </CustomModalBase>
  );
}

function CustomModalAgregarNoticia({
  estaAbierto,
  onCerrar,
}: {
  estaAbierto: boolean;
  onCerrar: () => void;
}) {
  if (!estaAbierto) return null;

  return (
    <CustomModalBase ancho="max-w-2xl" onCerrar={onCerrar}>
      <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6">
        <h2 className="text-lg font-bold text-slate-950">Agregar Nueva Noticia</h2>
        <BotonCerrar onCerrar={onCerrar} />
      </div>
      <div className="space-y-5 px-8 py-6">
        <CampoTextoMock etiqueta="Titulo" marcador="Ej. Actualizacion de protocolos de seguridad" obligatorio />
        <label className="block space-y-2">
          <EtiquetaFormulario texto="Descripcion" obligatorio />
          <textarea
            className="min-h-36 w-full resize-none rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-300"
            placeholder="Detalle la informacion de la noticia o reporte aqui..."
          />
        </label>
        <CampoTextoMock etiqueta="Seleccionar Empresa" marcador="Seleccione una empresa..." obligatorio />
        <div className="space-y-2">
          <EtiquetaFormulario texto="Archivos adjuntos" />
          <div className="flex min-h-36 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
              <UploadCloud size={18} />
            </span>
            <p className="mt-3 text-sm font-bold text-slate-600">Haga clic o arrastre archivos aqui</p>
            <p className="text-xs text-slate-400">Soporta PDF, DOCX, JPG (Max 10MB)</p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2 shadow-sm">
            <FileText size={16} className="text-blue-500" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-700">REPORTE_TECNICO_V1.PDF</p>
              <p className="text-[11px] text-slate-400">2.4 MB - Completado</p>
            </div>
            <button type="button" className="text-slate-300">
              <X size={14} />
            </button>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 border-t border-slate-100 px-8 py-5">
        <CustomButton variant="secondary" size="compact" onClick={onCerrar}>Cancelar</CustomButton>
        <CustomButton size="compact" onClick={onCerrar}>Guardar</CustomButton>
      </div>
    </CustomModalBase>
  );
}

function CustomModalDetalleCredito({
  reporte,
  onCerrar,
}: {
  reporte: ReporteCreditoBancoInformacion | null;
  onCerrar: () => void;
}) {
  const [pestanaActiva, setPestanaActiva] = useState<PestanaDetalleCredito>("balance");

  if (!reporte) return null;

  const campos = pestanaActiva === "balance" ? camposBalance : pestanaActiva === "ganancias" ? camposGanancias : camposRatios;

  return (
    <CustomModalBase ancho="max-w-4xl" onCerrar={onCerrar}>
      <div className="flex items-start justify-between border-b border-slate-100 px-8 py-6">
        <div>
          <h2 className="text-lg font-bold text-slate-950">
            Detalle de Inf. Credito - <IndicadorPais pais={reporte.pais} compacto /> {reporte.empresa}
          </h2>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Gestion de cuentas contables</p>
        </div>
        <BotonCerrar onCerrar={onCerrar} />
      </div>
      <div className="px-8 pt-5">
        <div className="flex gap-8 border-b border-slate-100">
          {[
            { id: "balance" as const, texto: "Balance General" },
            { id: "ganancias" as const, texto: "Estado de Ganancias y Perdidas" },
            { id: "ratios" as const, texto: "Ratios" },
          ].map((pestana) => (
            <button
              key={pestana.id}
              type="button"
              onClick={() => setPestanaActiva(pestana.id)}
              className={`border-b-2 pb-4 text-[10px] font-bold uppercase tracking-[0.14em] ${
                pestanaActiva === pestana.id ? "border-slate-950 text-slate-950" : "border-transparent text-slate-400"
              }`}
            >
              {pestana.texto}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-x-8 gap-y-5 px-8 py-7 md:grid-cols-2">
        {campos.map((campo) => (
          <CampoTextoMock key={campo} etiqueta={campo} marcador="0.00" />
        ))}
      </div>
      <div className="flex justify-end gap-3 border-t border-slate-100 px-8 py-5">
        <CustomButton variant="secondary" size="compact" onClick={onCerrar}>Cancelar</CustomButton>
        <CustomButton size="compact" onClick={onCerrar}>Guardar Cambios</CustomButton>
      </div>
    </CustomModalBase>
  );
}

function CustomModalExportarEmpresas({
  estaAbierto,
  onCerrar,
}: {
  estaAbierto: boolean;
  onCerrar: () => void;
}) {
  if (!estaAbierto) return null;

  return (
    <CustomModalBase ancho="max-w-md" onCerrar={onCerrar}>
      <div className="flex items-center justify-between border-b border-slate-100 px-7 py-5">
        <h2 className="text-base font-bold text-slate-950">Exportar Listado de Empresas</h2>
        <BotonCerrar onCerrar={onCerrar} />
      </div>
      <div className="space-y-2 px-7 py-5">
        <EtiquetaFormulario texto="Formato de archivo" />
        <select className="h-11 w-full rounded-xl border border-slate-100 bg-slate-50 px-3 text-sm font-semibold text-slate-500 outline-none">
          <option>Excel (.xlsx)</option>
          <option>CSV (.csv)</option>
          <option>PDF (.pdf)</option>
        </select>
      </div>
      <div className="flex justify-end gap-3 border-t border-slate-100 px-7 py-5">
        <CustomButton variant="secondary" size="compact" onClick={onCerrar}>Cancelar</CustomButton>
        <CustomButton size="compact" onClick={onCerrar}>Exportar Ahora</CustomButton>
      </div>
    </CustomModalBase>
  );
}

function CustomModalBase({
  children,
  ancho,
  onCerrar,
}: {
  children: ReactNode;
  ancho: string;
  onCerrar: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCerrar();
      }}
    >
      <div className={`max-h-[92vh] w-full overflow-y-auto rounded-xl bg-white shadow-2xl ${ancho}`}>
        {children}
      </div>
    </div>
  );
}

function CampoTextoMock({
  etiqueta,
  marcador,
  obligatorio = false,
}: {
  etiqueta: string;
  marcador: string;
  obligatorio?: boolean;
}) {
  return (
    <label className="block space-y-2">
      <EtiquetaFormulario texto={etiqueta} obligatorio={obligatorio} />
      <input
        className="h-11 w-full rounded-lg border border-slate-100 bg-slate-50 px-3 text-sm text-slate-600 outline-none focus:border-slate-300"
        placeholder={marcador}
      />
    </label>
  );
}

function EtiquetaFormulario({ texto, obligatorio = false }: { texto: string; obligatorio?: boolean }) {
  return (
    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
      {texto}
      {obligatorio ? <span className="text-red-500"> *</span> : null}
    </span>
  );
}

function BotonCerrar({ onCerrar }: { onCerrar: () => void }) {
  return (
    <button type="button" onClick={onCerrar} className="rounded-full p-1 text-slate-300 transition hover:bg-slate-100 hover:text-slate-500">
      <X size={18} />
    </button>
  );
}

function IndicadorPais({ pais, compacto = false }: { pais: string; compacto?: boolean }) {
  const iniciales = pais.slice(0, 3).toUpperCase();

  return (
    <span className={`inline-flex items-center gap-2 ${compacto ? "align-middle" : ""}`}>
      <span className="inline-flex h-3.5 w-5 items-center justify-center rounded-[3px] bg-slate-900 text-[7px] font-bold text-white">
        {iniciales}
      </span>
      {!compacto ? <span className="text-sm font-semibold text-slate-600">{pais}</span> : null}
    </span>
  );
}

function CustomPaginacion({ texto }: { texto: string }) {
  return (
    <div className="flex items-center justify-between pt-4 text-xs text-slate-400">
      <p>{texto}</p>
      <div className="flex items-center gap-2">
        <button type="button" className="rounded-lg p-2 text-slate-300 hover:bg-slate-100">
          <ChevronLeft size={14} />
        </button>
        {[1, 2, 3].map((pagina) => (
          <button
            key={pagina}
            type="button"
            className={`h-8 w-8 rounded-lg text-xs font-bold ${pagina === 1 ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-100" : "text-slate-400 hover:bg-slate-100"}`}
          >
            {pagina}
          </button>
        ))}
        <button type="button" className="rounded-lg p-2 text-slate-300 hover:bg-slate-100">
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

function filtrarPorBusqueda<T extends object>(registros: T[], busqueda: string, campos: Array<keyof T>) {
  const termino = busqueda.trim().toLowerCase();
  if (!termino) return registros;

  return registros.filter((registro) =>
    campos.some((campo) => String(registro[campo] ?? "").toLowerCase().includes(termino)),
  );
}

function obtenerTextoPaginacion(
  pestana: PestanaBancoInformacion,
  totalNoticias: number,
  totalReportes: number,
  totalEmpresas: number,
) {
  if (pestana === "noticias") return `Mostrando ${totalNoticias} de 24 noticias`;
  if (pestana === "credito") return `Mostrando ${totalReportes} de 24 reportes`;

  return `Mostrando ${totalEmpresas} de 342 empresas`;
}
