import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import pagedJsUrl from "../../../node_modules/pagedjs/dist/paged.polyfill.js?url";
import type {
  DocumentoInformeGenerado,
  FooterCell,
  PlantillaDocumentoConfig,
  PlantillaSeccion,
} from "@maximilian/shared/types/informe.type";
import type { DatosInvestigacionAnalista } from "@maximilian/shared/types/investigacion.type";

interface PropsCustomVisorDocumentoInforme {
  documento: DocumentoInformeGenerado;
  datosInvestigacion?: DatosInvestigacionAnalista;
  encabezado?: {
    pais: string;
    fecha: string;
    tipoSolicitud: string;
    analista: string;
    traductor: string;
  };
}

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

    case "inline": {
      const runs = (seccion.runs ?? []).map((r) =>
        r.style
          ? `<span style="${r.style}">${escaparHtml(r.text)}</span>`
          : escaparHtml(r.text)
      ).join("");
      return `<div${secStyle}>${runs}</div>`;
    }

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
    ${config.firstPageFooter ? `@page :first { @bottom-center { content: element(pie-pagina-p1); vertical-align: ${config.footer?.marginBottom ? "bottom" : "top"}; } }` : ""}

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
      ${config.footer?.layout === "table" ? "" : `text-align: ${footerAlign};`}
      ${config.footer?.containerStyle ? config.footer.containerStyle + ";" : ""}
      ${config.footer?.footerExtend ? `margin-left:-${config.footer.footerExtend};margin-right:-${config.footer.footerExtend};` : ""}
      white-space: pre-line;
      padding-left: ${fiL};
      padding-right: ${fiR};
      padding-top: ${footerGapBefore};
      padding-bottom: ${footerMarginBottom};
      box-sizing: border-box;
    }

    ${config.firstPageFooter ? `
    .sr-pie-pagina-p1 {
      position: running(pie-pagina-p1);
      font-size: ${pieTamano};
      line-height: 1.0;
      font-family: ${fuente};
      ${config.firstPageFooter.containerStyle ? config.firstPageFooter.containerStyle + ";" : ""}
      ${config.firstPageFooter.footerExtend ? `margin-left:-${config.firstPageFooter.footerExtend};margin-right:-${config.firstPageFooter.footerExtend};` : ""}
      padding-top: ${config.firstPageFooter.gapBefore ?? "0"};
      box-sizing: border-box;
    }` : ""}

    ${config.footer?.layout === "table" ? `
    .sr-pie-tabla {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }
    .sr-pie-pagnum {
      width: ${config.footer?.pageColWidth ?? "auto"};
      ${config.footer?.pageBgColor ? `background-color: ${config.footer.pageBgColor};` : ""}
      ${config.footer?.pageColor ? `color: ${config.footer.pageColor};` : ""}
      text-align: center;
      vertical-align: middle;
      font-size: ${pieTamano};
      padding: 2pt 4pt;
    }
    .sr-pie-pagnum::after {
      content: "${escaparHtml(config.footer?.pageLabel ?? "Page")} " counter(page)${config.footer?.pageTotal ? ` " ${escaparHtml(config.footer?.pageTotalLabel ?? "of")} " counter(pages)` : ""};
    }` : `
    ${config.footer?.showPageNumber !== false ? `
    .sr-pie-pagina::after {
      content: "${escaparHtml(config.footer?.pageLabel ?? "Page")} " counter(page);
      ${config.footer?.pageStyle ? config.footer.pageStyle + ";" : ""}
      ${config.footer?.pageFontSize ? `font-size: ${config.footer.pageFontSize};` : ""}
      ${config.footer?.pageColor ? `color: ${config.footer.pageColor};` : ""}
      ${config.footer?.pageGapBefore ? `margin-top: ${config.footer.pageGapBefore};` : ""}
    }` : ""}
    .sr-pie-texto {
      ${pieTexto ? "" : "display: none;"}
    }`}

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

    tr {
      break-inside: avoid;
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

  const renderFooterCell = (cell: FooterCell): string => {
    const attrs = [
      cell.class ? `class="${cell.class}"` : "",
      cell.style ? `style="${cell.style}"` : "",
      cell.colspan ? `colspan="${cell.colspan}"` : "",
    ].filter(Boolean).join(" ");
    let content = "";
    if (cell.rows) {
      content = `<table style="width:100%;border-collapse:collapse;table-layout:fixed"><tbody>${cell.rows.map(r => `<tr>${r.cells.map(renderFooterCell).join("")}</tr>`).join("")}</tbody></table>`;
    } else if (cell.image) {
      content = `<img src="${cell.image}" style="width:${cell.imageWidth ?? "auto"};height:${cell.imageHeight ?? "auto"};object-fit:contain;" />`;
    } else {
      content = escaparHtml(cell.text ?? "");
    }
    return `<td${attrs ? ` ${attrs}` : ""}>${content}</td>`;
  };
  const pie = config.footer?.layout === "table"
    ? `<div class="sr-pie-pagina"><table class="sr-pie-tabla"><tbody>${(config.footer.rows ?? []).map(row => `<tr>${row.cells.map(renderFooterCell).join("")}</tr>`).join("")}</tbody></table></div>`
    : `<div class="sr-pie-pagina"><span class="sr-pie-texto">${escaparHtml(pieTexto)}</span></div>`;

  const pieP1 = config.firstPageFooter?.layout === "table" && config.firstPageFooter.rows
    ? `<div class="sr-pie-pagina-p1"><table class="sr-pie-tabla"><tbody>${config.firstPageFooter.rows.map(row => `<tr>${row.cells.map(renderFooterCell).join("")}</tr>`).join("")}</tbody></table></div>`
    : config.firstPageFooter
    ? `<div class="sr-pie-pagina-p1"></div>`
    : "";

  const cuerpo = secciones.map(renderizarSeccion).join("\n");

  return `${encabezado}${pie}${pieP1}<div class="sr-contenido">${cuerpo}</div>`;
}

export function CustomVisorDocumentoInforme({
  documento,
}: PropsCustomVisorDocumentoInforme) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [estaPaginando, setEstaPaginando] = useState(false);
  const [alturaIframe, setAlturaIframe] = useState(600);
  const [error, setError] = useState<string | null>(null);
  const [srcdoc, setSrcdoc] = useState<string>("");

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

  useEffect(() => {
    if (!documentoKey || !documento.sections || !documento.document) return;

    setEstaPaginando(true);
    setError(null);

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

  if (documento.sections && documento.document) {
    return (
      <div className="overflow-x-auto pb-4">
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
        <iframe
          ref={iframeRef}
          title="Vista previa del documento"
          srcDoc={srcdoc}
          scrolling="no"
          onLoad={manejarCargaIframe}
          style={{
            width: "100%",
            height: `${alturaIframe}px`,
            border: "none",
            display: estaPaginando ? "none" : "block",
          }}
        />
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
    <div className="overflow-x-auto pb-4">
      <div
        className="mx-auto min-w-190"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
