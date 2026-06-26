import { useMemo, useState, type ReactNode } from "react";
import {
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Filter,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";

interface NoticiaBancoInformacion {
  id: number;
  empresa: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  autor: string;
  adjuntos: ArchivoAdjuntoNoticia[];
}

interface ArchivoAdjuntoNoticia {
  id: number;
  nombre: string;
  tipo: string;
  tamano: string;
}

const noticiasMock: NoticiaBancoInformacion[] = [
  {
    id: 1,
    empresa: "Global Bank Corp",
    titulo: "Analisis de volatilidad en mercados emergentes",
    descripcion:
      "Un estudio detallado sobre las fluctuaciones recientes en las divisas de LATAM y Asia-Pacifico. Se identifican patrones de riesgo asociados a cambios en politica monetaria global y su impacto directo en carteras de inversion diversificadas.",
    fecha: "12 OCT 2023",
    autor: "Equipo de Riesgo Global",
    adjuntos: [
      { id: 1, nombre: "reporte_estabilidad_financiera_q3.pdf", tipo: "PDF", tamano: "2.4 MB" },
      { id: 2, nombre: "anexo_metodologia_riesgo.xlsx", tipo: "Excel", tamano: "1.2 MB" },
    ],
  },
  {
    id: 2,
    empresa: "EuroTax Solutions",
    titulo: "Nuevas regulaciones tributarias en la UE",
    descripcion:
      "La Comision Europea ha publicado el borrador final para la directiva de transparencia fiscal digital. Las instituciones financieras deben preparar sus sistemas para el reporte automatico de transacciones transfronterizas antes del Q1 2024.",
    fecha: "10 OCT 2023",
    autor: "Legal Compliance",
    adjuntos: [
      { id: 1, nombre: "directiva_tributaria_ue.pdf", tipo: "PDF", tamano: "890 KB" },
    ],
  },
  {
    id: 3,
    empresa: "Capital Financial Group",
    titulo: "Reporte de solvencia bancaria Q3",
    descripcion:
      "Los indicadores de liquidez muestran una tendencia positiva en el sector bancario nacional. El ratio de cobertura de liquidez promedio ha superado el 120%, fortaleciendo la posicion ante posibles escenarios de estres financiero.",
    fecha: "08 OCT 2023",
    autor: "Analisis Financiero",
    adjuntos: [
      { id: 1, nombre: "reporte_solvencia_bancaria_q3.pdf", tipo: "PDF", tamano: "3.1 MB" },
      { id: 2, nombre: "anexo_ratios_q3.xlsx", tipo: "Excel", tamano: "720 KB" },
    ],
  },
];

const archivosInicialesModal: ArchivoAdjuntoNoticia[] = [
  { id: 1, nombre: "REPORTE_TECNICO_V1.PDF", tipo: "PDF", tamano: "2.4 MB" },
];

export default function BancoInformacionCoordinador() {
  const [busqueda, setBusqueda] = useState("");
  const [noticiaDetalle, setNoticiaDetalle] = useState<NoticiaBancoInformacion | null>(null);
  const [estaAbiertoModalAgregar, setEstaAbiertoModalAgregar] = useState(false);

  const noticiasFiltradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return noticiasMock;

    return noticiasMock.filter((noticia) =>
      [noticia.titulo, noticia.empresa, noticia.descripcion, noticia.autor]
        .some((valor) => valor.toLowerCase().includes(termino)),
    );
  }, [busqueda]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">Banco de Informacion</h1>
        <CustomButton size="sm" onClick={() => setEstaAbiertoModalAgregar(true)}>
          <Plus size={14} />
          Agregar Noticia
        </CustomButton>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
          <input
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            className="h-12 w-full rounded-xl border border-slate-100 bg-white pl-11 pr-4 text-sm text-slate-600 outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
            placeholder="Buscar noticias, reportes o articulos..."
          />
        </label>
        <CustomButton variant="secondary" size="sm" className="h-12 rounded-xl bg-white text-slate-600">
          <Filter size={14} />
          Filtros
        </CustomButton>
      </div>

      <section className="space-y-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-300">Noticias recientes</p>

        <div className="space-y-4">
          {noticiasFiltradas.map((noticia) => (
            <article key={noticia.id} className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
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
                <CustomButton size="sm" className="shrink-0" onClick={() => setNoticiaDetalle(noticia)}>
                  Ver Detalle
                </CustomButton>
              </div>
            </article>
          ))}
        </div>
      </section>

      <CustomPaginacion texto={`Mostrando ${noticiasFiltradas.length} de 24 noticias`} />

      <CustomModalDetalleNoticia noticia={noticiaDetalle} onCerrar={() => setNoticiaDetalle(null)} />
      <CustomModalAgregarNoticia estaAbierto={estaAbiertoModalAgregar} onCerrar={() => setEstaAbiertoModalAgregar(false)} />
    </div>
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
            <p className="mt-4 text-sm leading-7 text-slate-500">
              Las proyecciones para el proximo trimestre sugieren un enfoque conservador en la concesion de creditos comerciales.
            </p>
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
              <div key={`${adjunto.id}-${adjunto.nombre}`} className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                    <FileText size={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-700">{adjunto.nombre}</p>
                    <p className="text-[11px] text-slate-400">{adjunto.tamano}</p>
                  </div>
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
  const [archivos, setArchivos] = useState<ArchivoAdjuntoNoticia[]>(archivosInicialesModal);

  if (!estaAbierto) return null;

  const etiquetaArchivos =
    archivos.length === 0 ? "Sin archivos adjuntos" : `${archivos.length} ${archivos.length === 1 ? "archivo adjunto" : "archivos adjuntos"}`;

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
            className="min-h-32 w-full resize-none rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-300"
            placeholder="Detalle la informacion de la noticia o reporte aqui..."
          />
        </label>
        <CampoTextoMock etiqueta="Seleccionar Empresa" marcador="Seleccione una empresa..." />
        <div className="space-y-2">
          <EtiquetaFormulario texto="Archivos adjuntos" />
          <div className="overflow-hidden rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
                  <FileText size={16} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-700">Documentos de la noticia</p>
                  <p className="text-xs text-slate-400">{etiquetaArchivos}</p>
                </div>
              </div>
              <CustomButton
                variant="secondary"
                size="sm"
                onClick={() =>
                  setArchivos((anteriores) => [
                    ...anteriores,
                    {
                      id: Date.now(),
                      nombre: `ANEXO_NOTICIA_${anteriores.length + 1}.PDF`,
                      tipo: "PDF",
                      tamano: "1.0 MB",
                    },
                  ])
                }
              >
                <Upload size={14} />
                Agregar
              </CustomButton>
            </div>
            <button
              type="button"
              onClick={() =>
                setArchivos((anteriores) => [
                  ...anteriores,
                  {
                    id: Date.now(),
                    nombre: `DOCUMENTO_ADJUNTO_${anteriores.length + 1}.PDF`,
                    tipo: "PDF",
                    tamano: "900 KB",
                  },
                ])
              }
              className="flex min-h-28 w-full cursor-pointer flex-col items-center justify-center gap-3 border-b border-dashed border-[#d8e0ef] bg-[#fbfcfe] px-5 py-6 text-center"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-[#8ea0c0]">
                <Upload size={16} />
              </span>
              <span className="text-sm font-semibold text-slate-500">Haga clic para subir uno o varios archivos</span>
              <span className="text-xs text-slate-400">Soporta PDF, DOCX, JPG (Max 10MB)</span>
            </button>
            <div className="max-h-56 space-y-3 overflow-y-auto p-4">
              {archivos.map((archivo) => (
                <div
                  key={`${archivo.id}-${archivo.nombre}`}
                  className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-slate-50 text-slate-400">
                    <FileText size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-700">{archivo.nombre}</p>
                    <p className="text-xs text-slate-400">{archivo.tamano} - Completado</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <CustomButton variant="ghost" size="icon" title="Ver archivo" aria-label="Ver archivo" className="text-slate-500">
                      <Eye size={16} />
                    </CustomButton>
                    <CustomButton
                      variant="ghost"
                      size="icon"
                      title="Eliminar archivo"
                      aria-label="Eliminar archivo"
                      className="text-red-500 hover:bg-red-50"
                      onClick={() => setArchivos((anteriores) => anteriores.filter((item) => item.id !== archivo.id))}
                    >
                      <Trash2 size={16} />
                    </CustomButton>
                  </div>
                </div>
              ))}
            </div>
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
