import type { PlantillaDocumentoConfig } from "@maximilian/shared/types/informe.type";
import { escaparHtml } from "./escaparHtml";

export function construirCss(config: PlantillaDocumentoConfig): string {
  const ancho = config.pageSize?.width ?? "8.27in";
  const alto = config.pageSize?.height ?? "11.69in";
  const margenSuperior = config.margins?.top ?? "0.5in";
  const margenInferior = config.margins?.bottom ?? "0.85in";
  const margenIzquierdo = config.margins?.left ?? "0.5in";
  const margenDerecho = config.margins?.right ?? "0.5in";
  const fuente = config.font?.family ?? "Calibri, Arial, sans-serif";
  const tamano = config.font?.size ?? "10pt";
  const interlineado = config.font?.lineSpacing ?? 1.15;
  const pieTexto = escaparHtml(config.footer?.text ?? "");
  const pieTamano = config.footer?.fontSize ?? "7pt";
  const piePeso = config.footer?.fontWeight ?? "normal";
  const pieEstilo = config.footer?.fontStyle ?? "normal";
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
      margin: ${margenSuperior} ${margenDerecho} ${margenInferior} ${margenIzquierdo};

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
      font-weight: ${piePeso};
      font-style: ${pieEstilo};
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

    .pagedjs_page_content {
      position: relative;
      z-index: 1;
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

    ${config.firstPageWatermark?.image ? `
    .pagedjs_first_page::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url("${config.firstPageWatermark.image.replace(/"/g, '\\"')}") no-repeat;
      ${config.firstPageWatermark.width && config.firstPageWatermark.height ? `background-size: ${config.firstPageWatermark.width} ${config.firstPageWatermark.height};` : ""}
      ${config.firstPageWatermark.position ? `background-position: ${config.firstPageWatermark.position};` : ""}
      ${config.firstPageWatermark.opacity !== undefined ? `opacity: ${config.firstPageWatermark.opacity};` : ""}
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

    .sr-salto-pagina {
      display: block;
      break-before: page;
      page-break-before: always;
      height: 1px;
      line-height: 1px;
      font-size: 1px;
      color: transparent;
      overflow: hidden;
    }

  `;
}
