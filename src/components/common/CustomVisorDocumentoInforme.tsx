import { useEffect, useRef, useState } from "react";
import { Previewer } from "pagedjs";
import type {
  DocumentoInformeGenerado,
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

function renderizarSeccion(seccion: PlantillaSeccion): string {
  switch (seccion.type) {
    case "heading": {
      const tag = seccion.level === 1 ? "h1" : "h2";
      const estilo = seccion.fontSize ? ` style="font-size:${seccion.fontSize}"` : "";
      return `<${tag} class="sr-title"${estilo}>${escaparHtml(seccion.text)}</${tag}>`;
    }

    case "subtitle":
      return `<div class="sr-subtitle">${escaparHtml(seccion.text)}</div>`;

    case "text":
      return `<div class="sr-text">${escaparHtml(seccion.field)}</div>`;

    case "keyValue":
      return `<table class="sr-table"><tbody>${seccion.rows
        .map(
          (f) =>
            `<tr><td class="sr-label">${escaparHtml(f.label)}</td><td>${escaparHtml(f.separator ?? "")}${escaparHtml(f.value)}</td></tr>`,
        )
        .join("")}</tbody></table>`;

    case "borderedBox": {
      const cols = seccion.rows ? 2 : 1;
      let filas = `<tr><td colspan="${cols}" class="sr-box-title">${escaparHtml(seccion.title)}</td></tr>`;
      if (seccion.content) {
        filas += `<tr><td class="sr-text">${escaparHtml(seccion.content)}</td></tr>`;
      }
      if (seccion.rows) {
        filas += seccion.rows
          .map(
            (f) =>
              `<tr><td class="sr-label">${escaparHtml(f.label)}</td><td>${escaparHtml(f.value)}</td></tr>`,
          )
          .join("");
      }
      return `<table class="sr-table sr-bordered"><tbody>${filas}</tbody></table>`;
    }

    case "referenceBox":
      return `<table class="sr-table sr-reference" style="font-size:${seccion.fontSize ?? "6pt"}"><tbody>
        <tr><td class="sr-ref-title">${escaparHtml(seccion.title)}</td></tr>
        ${seccion.items.map((item) => `<tr><td>${escaparHtml(item)}</td></tr>`).join("")}
      </tbody></table>`;

    case "dataTable":
      return `<table class="sr-table sr-data"><thead><tr>${seccion.columns
        .map((c) => `<th>${escaparHtml(c.header)}</th>`)
        .join("")}</tr></thead><tbody>${(seccion.rows ?? [])
        .map(
          (fila) =>
            `<tr>${fila.map((celda) => `<td>${escaparHtml(celda)}</td>`).join("")}</tr>`,
        )
        .join("")}</tbody></table>`;

    case "repeat":
      return seccion.sections.map(renderizarSeccion).join("");

    case "repeatDetail":
      return (seccion.items ?? [])
        .map(
          (item) =>
            `<div class="sr-subtitle">${escaparHtml(item.title)}</div><div class="sr-text">${escaparHtml(item.content)}</div>`,
        )
        .join("");

    default:
      return "";
  }
}

function construirCssPagedJs(config: PlantillaDocumentoConfig): string {
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

  const ciL = config.contentIndent?.left ?? "0";
  const ciR = config.contentIndent?.right ?? "0";
  const fiL = config.footerIndent?.left ?? "0";
  const fiR = config.footerIndent?.right ?? "0";
  const hiL = config.headingIndent?.left ?? "0";
  const hiR = config.headingIndent?.right ?? "0";

  return `
    @page {
      size: ${ancho} ${alto};
      margin: ${mt} ${mr} ${mb} ${ml};

      @top-center {
        content: element(encabezado-logo);
        vertical-align: bottom;
        text-align: center;
      }
      @bottom-center {
        content: element(pie-pagina);
        vertical-align: top;
      }
    }

    .sr-encabezado-logo {
      position: running(encabezado-logo);
      text-align: ${headerAlign};
      width: 100%;
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
      padding-left: ${fiL};
      padding-right: ${fiR};
    }

    .sr-pie-pagina::after {
      content: "Page " counter(page);
      display: block;
    }

    body, .sr-contenido {
      font-family: ${fuente};
      font-size: ${tamano};
      line-height: ${interlineado};
      color: #000;
    }

    .pagedjs_pages {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .pagedjs_page {
      margin-bottom: 20px;
    }

    .sr-title {
      text-align: center;
      font-weight: 700;
      line-height: 1.6;
      margin: 14pt 0 5pt;
      padding-left: ${hiL};
      padding-right: ${hiR};
    }

    .sr-contenido {
      padding-left: ${ciL};
      padding-right: ${ciR};
    }

    .sr-subtitle {
      padding-top: 10pt;
      padding-bottom: 5pt;
      font-weight: 700;
    }

    .sr-text {
      white-space: pre-line;
      line-height: 1.6;
    }

    .sr-table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      margin: 0.08in 0;
    }

    .sr-table td,
    .sr-table th {
      padding: 0 0.03in;
      vertical-align: top;
      text-align: left;
    }

    .sr-label {
      width: 1.94in;
      font-weight: 700;
    }

    .sr-bordered {
      border: 1px solid #000;
    }

    .sr-bordered td,
    .sr-bordered th {
      border: 1px solid #000;
    }

    .sr-box-title {
      text-align: center;
      font-weight: 700;
      border: 1px solid #000;
    }

    .sr-reference {
      border: 1px solid #000;
    }

    .sr-reference td {
      border-left: 1px solid #000;
      border-right: 1px solid #000;
      border-bottom: 0;
    }

    .sr-ref-title {
      text-align: center;
      font-weight: 700;
      border-bottom: 1px solid #000 !important;
    }

    .sr-reference tr:last-child td {
      border-bottom: 1px solid #000;
    }

    .sr-data th {
      font-weight: 700;
    }

    .sr-data th,
    .sr-data td {
      padding: 0.01in;
    }

    .pagedjs_page {
      box-shadow: 0 18px 45px rgba(15, 23, 42, 0.16);
      margin-bottom: 20px;
      background: #fff;
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

export function CustomVisorDocumentoInforme({ documento }: PropsCustomVisorDocumentoInforme) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const [estaPaginando, setEstaPaginando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewerRef = useRef<Previewer | null>(null);

  useEffect(() => {
    if (!documento.sections || !documento.document || !contenedorRef.current) return;

    const contenedor = contenedorRef.current;
    contenedor.innerHTML = "";
    setEstaPaginando(true);
    setError(null);

    const css = construirCssPagedJs(documento.document);
    const html = construirHtmlContenido(documento.document, documento.sections);

    const previewer = new Previewer();
    previewerRef.current = previewer;

    previewer
      .preview(html, [{ "inline-styles": css }], contenedor)
      .then(() => setEstaPaginando(false))
      .catch(() => {
        setError("Error al generar la vista previa.");
        setEstaPaginando(false);
      });

    return () => {
      previewerRef.current = null;
      contenedor.innerHTML = "";
    };
  }, [documento]);

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
        <div ref={contenedorRef} className="mx-auto" style={{ background: "#f1f5f9" }} />
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
        className="mx-auto min-w-[760px]"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
