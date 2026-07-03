import { useEffect, useRef, useState, useCallback, useMemo, type PointerEvent as ReactPointerEvent } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import pagedJsUrl from "../../../node_modules/pagedjs/dist/paged.polyfill.js?url";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import type {
  DocumentoInformeGenerado,
  PlantillaDocumentoConfig,
  PlantillaSeccion,
} from "@maximilian/shared/types/informe.type";
import type { DatosInvestigacionAnalista } from "@maximilian/shared/types/investigacion.type";

interface PropsCustomVisorDocumentoInforme {
  documento: DocumentoInformeGenerado;
  datosInvestigacion?: DatosInvestigacionAnalista;
  ocuparAltoDisponible?: boolean;
  encabezado?: {
    pais: string;
    fecha: string;
    tipoSolicitud: string;
    analista: string;
    traductor: string;
  };
}

const ZOOM_MINIMO_INFORME = 0.35;
const ZOOM_MAXIMO_INFORME = 1.6;
const PASO_ZOOM_INFORME = 0.1;
const ANCHO_PAGINA_FALLBACK_PX = 794;

function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escaparAtributo(texto: string): string {
  return escaparHtml(texto).replace(/'/g, "&#39;");
}

function convertirLongitudCssAPx(valor?: string): number {
  if (!valor) return ANCHO_PAGINA_FALLBACK_PX;

  const coincidencia = valor.trim().match(/^([\d.]+)\s*(in|cm|mm|px|pt)?$/i);
  if (!coincidencia) return ANCHO_PAGINA_FALLBACK_PX;

  const numero = Number(coincidencia[1]);
  if (!Number.isFinite(numero) || numero <= 0) return ANCHO_PAGINA_FALLBACK_PX;

  const unidad = coincidencia[2]?.toLowerCase() ?? "px";
  if (unidad === "in") return numero * 96;
  if (unidad === "cm") return (numero / 2.54) * 96;
  if (unidad === "mm") return (numero / 25.4) * 96;
  if (unidad === "pt") return (numero / 72) * 96;
  return numero;
}

function renderizarSeccion(seccion: PlantillaSeccion): string {
  const sec = seccion as Record<string, unknown>;
  const secStyle = sec.style ? ` style="${sec.style}"` : "";

  switch (seccion.type) {
    case "heading": {
      const tag = seccion.level === 1 ? "h1" : "h2";
      return `<${tag}${secStyle}>${escaparHtml(seccion.text)}</${tag}>`;
    }

    case "subtitle":
      return `<div${secStyle}>${escaparHtml(seccion.text)}</div>`;

    case "text":
      return `<div${secStyle}>${escaparHtml(seccion.field)}</div>`;

    case "keyValue": {
      const kv = seccion as Record<string, unknown>;
      const kvStyle = kv.style ? ` style="${kv.style}"` : "";
      return `<table${kvStyle}><tbody>${seccion.rows
        .map(
          (row) =>
            `<tr>${row.map((cell) => `<td${cell.style ? ` style="${cell.style}"` : ""}>${escaparHtml(cell.text)}</td>`).join("")}</tr>`,
        )
        .join("")}</tbody></table>`;
    }

    case "borderedBox": {
      const box = seccion as Record<string, unknown>;
      const boxStyle = box.style ? ` style="${box.style}"` : "";
      const lblStyle = box.labelStyle ? ` style="${box.labelStyle}"` : "";
      const valStyle = box.valueStyle ? ` style="${box.valueStyle}"` : "";
      const titleStyle = box.titleStyle ? ` style="${box.titleStyle}"` : "";
      const rows = (box.rows ?? []) as Record<string, unknown>[];
      let filas = `<tr><td colspan="2"${titleStyle}>${escaparHtml(seccion.title)}</td></tr>`;
      const cellStyle = box.cellStyle ? ` style="${box.cellStyle}"` : "";
      if (seccion.content) {
        filas += `<tr><td colspan="2"${cellStyle}>${escaparHtml(seccion.content)}</td></tr>`;
      }
      filas += rows
        .map((f) => {
          const rowLbl = f.style ? ` style="${f.style}"` : lblStyle;
          return `<tr><td${rowLbl}>${escaparHtml(String(f.label ?? ""))}</td><td${valStyle}>${escaparHtml(String(f.value ?? ""))}</td></tr>`;
        })
        .join("");
      return `<table${boxStyle}><tbody>${filas}</tbody></table>`;
    }
    // El "referenceBox" es similar al "borderedBox" pero con un diseño específico para referencias, con un título destacado y una lista de ítems debajo.
    case "referenceBox": {
      const ref = seccion as Record<string, unknown>;
      const refStyle = ref.style ? ` style="${ref.style}"` : "";
      const refTitleStyle = ref.titleStyle ? ` style="${ref.titleStyle}"` : "";
      const refCellStyle = ref.cellStyle ? ` style="${ref.cellStyle}"` : "";
      return `<table${refStyle}><tbody>
        <tr><td${refTitleStyle}>${escaparHtml(seccion.title)}</td></tr>
        ${seccion.items.map((item, i) => `<tr><td${i === seccion.items.length - 1 ? (ref.lastCellStyle ? ` style="${ref.lastCellStyle}"` : refCellStyle) : refCellStyle}>${escaparHtml(item)}</td></tr>`).join("")}
      </tbody></table>`;
    }

    case "dataTable": {
      const dtStyleAttr = seccion.style ? ` style="${seccion.style}"` : "";
      const dtCellStyle = seccion.cellStyle
        ? ` style="${seccion.cellStyle}"`
        : "";
      const dtHeaderStyle = seccion.headerStyle
        ? `;${seccion.headerStyle}`
        : "";
      const colgroup = seccion.columnWidths
        ? `<colgroup>${seccion.columnWidths.map((w) => `<col style="width:${w}">`).join("")}</colgroup>`
        : "";
      return `<table${dtStyleAttr}>${colgroup}<thead><tr>${seccion.columns
        .map(
          (c) =>
            `<th style="${(seccion.cellStyle ?? "") + dtHeaderStyle}">${escaparHtml(c.header)}</th>`,
        )
        .join("")}</tr></thead><tbody>${(seccion.rows ?? [])
        .map((fila) => {
          const celdas = Array.isArray(fila)
            ? fila
            : Object.values(fila as Record<string, unknown>).map(String);
          return `<tr>${celdas.map((celda) => `<td${dtCellStyle}>${escaparHtml(String(celda ?? ""))}</td>`).join("")}</tr>`;
        })
        .join("")}</tbody></table>`;
    }

    case "repeat":
      return seccion.sections.map(renderizarSeccion).join("");

    case "repeatDetail": {
      const rd = seccion as Record<string, unknown>;
      const rdTitleStyle = rd.titleStyle ? ` style="${rd.titleStyle}"` : "";
      const rdContentStyle = rd.contentStyle
        ? ` style="${rd.contentStyle}"`
        : "";
      return (seccion.items ?? [])
        .map(
          (item) =>
            `<div${rdTitleStyle}>${escaparHtml(item.title)}</div><div${rdContentStyle}>${escaparHtml(item.content)}</div>`,
        )
        .join("");
    }

    case "spacer":
      return `<div style="height:${seccion.height ?? "0.3in"}"></div>`;

    default:
      return "";
  }
}

function construirCss(config: PlantillaDocumentoConfig): string {
  const ancho = config.pageSize?.width ?? "8.27in";
  const alto = config.pageSize?.height ?? "11.69in";
  const mt = config.margins?.top ?? "0.5in";
  const mb = config.margins?.bottom ?? "0.85in";
  const ml = config.margins?.left ?? "0.5in";
  const mr = config.margins?.right ?? "0.5in";
  const fuente = config.font?.family ?? "Calibri, Arial, sans-serif";
  const tamano = config.font?.size ?? "10pt";
  const interlineado = config.font?.lineSpacing ?? 1.15;
  const pieTexto = escaparHtml(config.footer?.text ?? "");
  const pieTamano = config.footer?.fontSize ?? "7pt";
  const headerAlign = config.header?.align ?? "center";
  const footerAlign = config.footer?.align ?? "left";
  const headerGapAfter = config.header?.gapAfter ?? "0";
  const headerMarginTop = config.header?.marginTop ?? "0";
  const footerGapBefore = config.footer?.gapBefore ?? "0";
  const footerMarginBottom = config.footer?.marginBottom ?? "0";

  const ciL = config.contentIndent?.left ?? "0";
  const ciR = config.contentIndent?.right ?? "0";
  const fiL = config.footerIndent?.left ?? "0";
  const fiR = config.footerIndent?.right ?? "0";
  const bordePagina = config.pageBorder;

  return `
    @page {
      size: ${ancho} ${alto};
      margin: ${mt} ${mr} ${mb} ${ml};

      @top-center {
        content: element(encabezado-logo);
        vertical-align: ${config.header?.marginTop ? "top" : "bottom"};
      }
      @bottom-center {
        content: element(pie-pagina);
        vertical-align: ${config.footer?.marginBottom ? "bottom" : "top"};
      }
    }

    .sr-encabezado-logo {
      position: running(encabezado-logo);
      text-align: ${headerAlign};
      width: 100%;
      padding-top: ${headerMarginTop};
      padding-bottom: ${headerGapAfter};
      box-sizing: border-box;
    }

    .sr-encabezado-logo img {
      display: block;
      ${headerAlign === "right" ? "margin-left: auto; margin-right: 0;" : ""}
      ${headerAlign === "left" ? "margin-left: 0; margin-right: auto;" : ""}
      ${headerAlign !== "left" && headerAlign !== "right" ? "margin-left: auto; margin-right: auto;" : ""}
    }

    .sr-pie-pagina {
      position: running(pie-pagina);
      font-size: ${pieTamano};
      line-height: 1.0;
      font-family: ${fuente};
      text-align: ${footerAlign};
      white-space: pre-line;
      padding-left: ${fiL};
      padding-right: ${fiR};
      padding-top: ${footerGapBefore};
      padding-bottom: ${footerMarginBottom};
      box-sizing: border-box;
    }

    ${config.footer?.showPageNumber !== false ? `
    .sr-pie-pagina::after {
      content: "${escaparHtml(config.footer?.pageLabel ?? "Page")} " counter(page);
      display: block;
      ${config.footer?.pageFontSize ? `font-size: ${config.footer.pageFontSize};` : ""}
      ${config.footer?.pageColor ? `color: ${config.footer.pageColor};` : ""}
      ${config.footer?.pageGapBefore ? `margin-top: ${config.footer.pageGapBefore};` : ""}
    }` : ""}

    body {
      font-family: ${fuente};
      font-size: ${tamano};
      line-height: ${interlineado};
      color: #000;
      margin: 0;
      padding: 0;
      background: #f1f5f9;
    }

    .sr-contenido {
      padding-left: ${ciL};
      padding-right: ${ciR};
    }

    .pagedjs_pages {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .pagedjs_page {
      box-shadow: 0 18px 45px rgba(15, 23, 42, 0.16);
      margin-bottom: 20px;
      background: #fff;
      position: relative;
    }

    ${bordePagina ? `
    .pagedjs_page::before {
      content: "";
      position: absolute;
      top: ${bordePagina.top ?? "0"};
      bottom: ${bordePagina.bottom ?? "0"};
      left: ${bordePagina.left ?? "0"};
      right: ${bordePagina.right ?? "0"};
      border: ${bordePagina.width ?? "1pt"} solid ${bordePagina.color ?? "#000"};
      pointer-events: none;
      z-index: 1;
    }
    ` : ""}

    ${config.watermark?.image ? `
    .pagedjs_page::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url("${config.watermark.image.replace(/"/g, '\\"')}") no-repeat;
      ${config.watermark.width && config.watermark.height ? `background-size: ${config.watermark.width} ${config.watermark.height};` : ""}
      ${config.watermark.position ? `background-position: ${config.watermark.position};` : ""}
      ${config.watermark.opacity !== undefined ? `opacity: ${config.watermark.opacity};` : ""}
      pointer-events: none;
      z-index: 0;
    }
    ` : ""}

    td, th {
      padding: 0 0.03in;
      vertical-align: top;
    }

    .sr-pie-texto {
      ${pieTexto ? "" : "display: none;"}
    }
  `;
}

function construirHtmlContenido(
  config: PlantillaDocumentoConfig,
  secciones: PlantillaSeccion[],
): string {
  const logoUrl = config.header?.logo;
  const logoW = config.header?.logoWidth ?? "1.3in";
  const logoH = config.header?.logoHeight ?? "0.55in";
  const pieTexto = config.footer?.text ?? "";

  const encabezado = logoUrl
    ? `<div class="sr-encabezado-logo"><img src="${logoUrl}" style="width:${logoW};height:${logoH};object-fit:contain;" /></div>`
    : `<div class="sr-encabezado-logo"></div>`;

  const pie = `<div class="sr-pie-pagina"><span class="sr-pie-texto">${escaparHtml(pieTexto)}</span></div>`;

  const cuerpo = secciones.map(renderizarSeccion).join("\n");

  return `${encabezado}${pie}<div class="sr-contenido">${cuerpo}</div>`;
}

export function CustomVisorDocumentoInforme({
  documento,
  ocuparAltoDisponible = false,
}: PropsCustomVisorDocumentoInforme) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const contenedorScrollRef = useRef<HTMLDivElement>(null);
  const posicionArrastreRef = useRef({
    x: 0,
    y: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });
  const [estaPaginando, setEstaPaginando] = useState(false);
  const [alturaIframe, setAlturaIframe] = useState(600);
  const [error, setError] = useState<string | null>(null);
  const [srcdoc, setSrcdoc] = useState<string>("");
  const [zoomInforme, setZoomInforme] = useState(1);
  const [anchoDisponibleInforme, setAnchoDisponibleInforme] = useState(0);
  const [zoomModificadoPorUsuario, setZoomModificadoPorUsuario] = useState(false);
  const [estaArrastrandoInforme, setEstaArrastrandoInforme] = useState(false);

  const ajustarAltura = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    try {
      const doc = iframe.contentDocument;
      if (doc) {
        const altura = doc.documentElement.scrollHeight;
        if (altura > 100) {
          setAlturaIframe(altura + 40);
          setEstaPaginando(false);
          return;
        }
      }
    } catch {
      /* cross-origin fallback */
    }
    setTimeout(ajustarAltura, 300);
  }, []);

  const documentoKey = useMemo(
    () =>
      documento.sections && documento.document
        ? JSON.stringify(documento)
        : null,
    [documento],
  );

  const anchoPaginaPx = useMemo(
    () => convertirLongitudCssAPx(documento.document?.pageSize?.width),
    [documento.document?.pageSize?.width],
  );

  const zoomAjustadoInforme = useMemo(() => {
    if (anchoDisponibleInforme <= 0) return 1;
    const espacioUtil = Math.max(280, anchoDisponibleInforme - 32);
    const zoomAjustado = Math.min(1, espacioUtil / anchoPaginaPx);
    return Math.max(ZOOM_MINIMO_INFORME, Number(zoomAjustado.toFixed(2)));
  }, [anchoDisponibleInforme, anchoPaginaPx]);

  useEffect(() => {
    const contenedor = contenedorScrollRef.current;
    if (!contenedor) return;

    const actualizarAncho = () => {
      setAnchoDisponibleInforme(contenedor.clientWidth);
    };

    actualizarAncho();
    const observador = new ResizeObserver(actualizarAncho);
    observador.observe(contenedor);

    return () => observador.disconnect();
  }, []);

  useEffect(() => {
    if (!zoomModificadoPorUsuario) {
      setZoomInforme(zoomAjustadoInforme);
    }
  }, [zoomAjustadoInforme, zoomModificadoPorUsuario]);

  useEffect(() => {
    if (!documentoKey || !documento.sections || !documento.document) return;

    setEstaPaginando(true);
    setError(null);
    setZoomModificadoPorUsuario(false);

    const css = construirCss(documento.document);
    const contenido = construirHtmlContenido(
      documento.document,
      documento.sections,
    );

    const htmlCompleto = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>${css}</style>
</head>
<body>
${contenido}
<script src="${escaparAtributo(pagedJsUrl)}"></script>
</body>
</html>`;

    setSrcdoc(htmlCompleto);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentoKey]);

  const manejarCargaIframe = useCallback(() => {
    setTimeout(ajustarAltura, 800);
  }, [ajustarAltura]);

  const acercarInforme = useCallback(() => {
    setZoomModificadoPorUsuario(true);
    setZoomInforme((zoomActual) => Math.min(ZOOM_MAXIMO_INFORME, Number((zoomActual + PASO_ZOOM_INFORME).toFixed(2))));
  }, []);

  const alejarInforme = useCallback(() => {
    setZoomModificadoPorUsuario(true);
    setZoomInforme((zoomActual) => Math.max(ZOOM_MINIMO_INFORME, Number((zoomActual - PASO_ZOOM_INFORME).toFixed(2))));
  }, []);

  const restablecerZoomInforme = useCallback(() => {
    setZoomModificadoPorUsuario(false);
    setZoomInforme(zoomAjustadoInforme);
  }, [zoomAjustadoInforme]);

  const iniciarArrastreInforme = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const contenedor = contenedorScrollRef.current;
    if (!contenedor || event.pointerType !== "mouse" || event.button !== 0) return;

    const objetivo = event.target as HTMLElement;
    if (objetivo.closest("button, a, input, textarea, select")) return;

    posicionArrastreRef.current = {
      x: event.clientX,
      y: event.clientY,
      scrollLeft: contenedor.scrollLeft,
      scrollTop: contenedor.scrollTop,
    };
    setEstaArrastrandoInforme(true);
    contenedor.setPointerCapture(event.pointerId);
  }, []);

  const moverArrastreInforme = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const contenedor = contenedorScrollRef.current;
    if (!contenedor || !estaArrastrandoInforme) return;

    event.preventDefault();
    const posicionInicial = posicionArrastreRef.current;
    contenedor.scrollLeft = posicionInicial.scrollLeft - (event.clientX - posicionInicial.x);
    contenedor.scrollTop = posicionInicial.scrollTop - (event.clientY - posicionInicial.y);
  }, [estaArrastrandoInforme]);

  const terminarArrastreInforme = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const contenedor = contenedorScrollRef.current;
    if (!contenedor || !estaArrastrandoInforme) return;

    setEstaArrastrandoInforme(false);
    if (contenedor.hasPointerCapture(event.pointerId)) {
      contenedor.releasePointerCapture(event.pointerId);
    }
  }, [estaArrastrandoInforme]);

  const porcentajeZoom = Math.round(zoomInforme * 100);
  const puedeAlejar = zoomInforme > ZOOM_MINIMO_INFORME;
  const puedeAcercar = zoomInforme < ZOOM_MAXIMO_INFORME;
  const classNameContenedorVisor = `flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm ${
    ocuparAltoDisponible ? "h-full min-h-0" : "h-[min(72vh,760px)]"
  }`;
  const classNameContenedorScroll = `min-h-0 flex-1 overflow-auto px-2 py-4 sm:px-4 ${
    estaArrastrandoInforme ? "cursor-grabbing select-none" : "cursor-grab"
  }`;

  const controlesZoom = (
    <div className="sticky top-0 z-20 flex flex-wrap items-center justify-end gap-2 border-b border-slate-200 bg-white/95 px-3 py-2 backdrop-blur sm:px-4">
      <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <CustomButton
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-none text-slate-600 hover:bg-slate-100"
          onClick={alejarInforme}
          disabled={!puedeAlejar}
          aria-label="Alejar vista del informe"
          title="Alejar"
        >
          <Minus size={16} />
        </CustomButton>
        <span className="min-w-16 border-x border-slate-200 px-3 text-center text-xs font-bold tabular-nums text-slate-600">
          {porcentajeZoom}%
        </span>
        <CustomButton
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-none text-slate-600 hover:bg-slate-100"
          onClick={acercarInforme}
          disabled={!puedeAcercar}
          aria-label="Acercar vista del informe"
          title="Acercar"
        >
          <Plus size={16} />
        </CustomButton>
      </div>
      <CustomButton
        type="button"
        variant="secondary"
        size="sm"
        className="h-9 px-3 text-xs"
        onClick={restablecerZoomInforme}
        disabled={!zoomModificadoPorUsuario && zoomInforme === zoomAjustadoInforme}
        title="Ajustar al ancho"
      >
        <RotateCcw size={14} />
        Ajustar
      </CustomButton>
    </div>
  );

  if (documento.sections && documento.document) {
    return (
      <div className={classNameContenedorVisor}>
        {controlesZoom}
        {estaPaginando && (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500 shadow-sm">
            Generando vista previa...
          </div>
        )}
        {error && (
          <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
        <div
          ref={contenedorScrollRef}
          className={classNameContenedorScroll}
          onPointerDown={iniciarArrastreInforme}
          onPointerMove={moverArrastreInforme}
          onPointerUp={terminarArrastreInforme}
          onPointerCancel={terminarArrastreInforme}
        >
          <div
            className="mx-auto"
            style={{
              width: `${anchoPaginaPx * zoomInforme}px`,
              height: `${alturaIframe * zoomInforme}px`,
            }}
          >
            <iframe
              ref={iframeRef}
              title="Vista previa del documento"
              srcDoc={srcdoc}
              scrolling="no"
              onLoad={manejarCargaIframe}
              style={{
                width: `${anchoPaginaPx}px`,
                height: `${alturaIframe}px`,
                border: "none",
                display: estaPaginando ? "none" : "block",
                transform: `scale(${zoomInforme})`,
                transformOrigin: "top left",
                pointerEvents: "none",
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  const html = documento.html?.trim();
  if (!html) {
    return (
      <div className="rounded border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
        La plantilla no contiene contenido para renderizar.
      </div>
    );
  }

  return (
    <div className={classNameContenedorVisor}>
      {controlesZoom}
      <div
        ref={contenedorScrollRef}
        className={classNameContenedorScroll}
        onPointerDown={iniciarArrastreInforme}
        onPointerMove={moverArrastreInforme}
        onPointerUp={terminarArrastreInforme}
        onPointerCancel={terminarArrastreInforme}
      >
        <div
          className="mx-auto min-w-190 origin-top"
          style={{
            transform: `scale(${zoomInforme})`,
            width: `${anchoPaginaPx * zoomInforme}px`,
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
