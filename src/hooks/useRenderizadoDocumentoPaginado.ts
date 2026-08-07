import { useCallback, useEffect, useRef, useState } from "react";
import pagedJsUrl from "@pagedjs-polyfill";
import type { DocumentoInformeGenerado } from "@maximilian/shared/types/informe.type";
import { construirCss } from "@maximilian/shared/utils/visor-documento-informe/construirCss";
import { construirHtmlContenido } from "@maximilian/shared/utils/visor-documento-informe/construirHtmlContenido";
import { escaparAtributo, escaparScriptJson } from "@maximilian/shared/utils/visor-documento-informe/escaparHtml";

const TIPO_MENSAJE_PAGEDJS_LISTO = "maximilian:pagedjs-listo";

export function useRenderizadoDocumentoPaginado(
  documento: DocumentoInformeGenerado,
  onEstadoRenderizacionChange?: (estaRenderizando: boolean) => void,
) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [estaPaginando, setEstaPaginando] = useState(false);
  const [alturaIframe, setAlturaIframe] = useState(600);
  const [error, setError] = useState<string | null>(null);
  const [srcdoc, setSrcdoc] = useState<string>("");
  const [tokenRenderDocumento, setTokenRenderDocumento] = useState("");

  const finalizarRenderizadoDocumento = useCallback(() => {
    setEstaPaginando(false);
    onEstadoRenderizacionChange?.(false);
  }, [onEstadoRenderizacionChange]);

  const ajustarAltura = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    try {
      const doc = iframe.contentDocument;
      if (doc) {
        const paginas = doc.querySelectorAll(".pagedjs_page");
        const contenedorPaginas = doc.querySelector(".pagedjs_pages") as HTMLElement | null;
        const altura = Math.max(
          doc.documentElement.scrollHeight,
          doc.body?.scrollHeight ?? 0,
          contenedorPaginas?.scrollHeight ?? 0,
        );
        const paginasConContenido = Array.from(paginas).some((pagina) =>
          (pagina.textContent ?? "").trim().length > 0 || Boolean(pagina.querySelector("img, table")),
        );
        if (altura > 100 && paginas.length > 0 && paginasConContenido) {
          setAlturaIframe(altura + (paginas.length > 0 ? 60 : 40));
          finalizarRenderizadoDocumento();
          return;
        }
      }
    } catch {
      /* cross-origin fallback */
    }
    setError("No se pudo calcular la altura final del informe.");
    finalizarRenderizadoDocumento();
  }, [finalizarRenderizadoDocumento]);

  useEffect(() => {
    if (!documento.sections || !documento.document) return;
    let estaActivo = true;

    const tokenRender = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

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
<script>
window.__maximilianPagedCompleto = false;
window.PagedConfig = {
  after: function () {
    window.__maximilianPagedCompleto = true;
  }
};
</script>
${contenido}
<script src="${escaparAtributo(pagedJsUrl)}"></script>
<script>
(function () {
  var token = ${escaparScriptJson(tokenRender)};
  var intentos = 0;
  var alturaAnterior = 0;
  var paginasAnteriores = 0;
  var lecturasEstables = 0;

  function obtenerAltura() {
    var paginas = document.querySelector(".pagedjs_pages");
    return Math.max(
      document.documentElement ? document.documentElement.scrollHeight : 0,
      document.body ? document.body.scrollHeight : 0,
      paginas ? paginas.scrollHeight : 0
    );
  }

  function tieneContenidoRenderizado() {
    var paginas = Array.prototype.slice.call(document.querySelectorAll(".pagedjs_page"));
    if (!paginas.length) return false;
    return paginas.every(function (pagina) {
      return (pagina.textContent || "").trim().length > 0 || Boolean(pagina.querySelector("img, table"));
    });
  }

  function imagenesListas() {
    var imagenes = Array.prototype.slice.call(document.images || []);
    return imagenes.every(function (imagen) {
      return imagen.complete && (imagen.naturalWidth > 0 || imagen.getAttribute("src") === "");
    });
  }

  function fuentesListas() {
    return !document.fonts || document.fonts.status === "loaded";
  }

  function revisar() {
    intentos += 1;
    var altura = obtenerAltura();
    var paginas = document.querySelectorAll(".pagedjs_page").length;
    var contenidoListo = tieneContenidoRenderizado();
    var recursosListos = imagenesListas() && fuentesListas();
    var pagedCompleto = Boolean(window.__maximilianPagedCompleto);

    if (Math.abs(altura - alturaAnterior) <= 2 && paginas === paginasAnteriores) {
      lecturasEstables += 1;
    } else {
      lecturasEstables = 0;
      alturaAnterior = altura;
      paginasAnteriores = paginas;
    }

    if (
      contenidoListo &&
      recursosListos &&
      altura > 100 &&
      paginas > 0 &&
      (pagedCompleto || intentos >= 80) &&
      lecturasEstables >= 8
    ) {
      window.parent.postMessage({
        tipo: ${escaparScriptJson(TIPO_MENSAJE_PAGEDJS_LISTO)},
        token: token,
        altura: altura
      }, "*");
      return;
    }

    if (intentos >= 120) {
      window.parent.postMessage({
        tipo: ${escaparScriptJson(TIPO_MENSAJE_PAGEDJS_LISTO)},
        token: token,
        altura: altura,
        forzado: true
      }, "*");
      return;
    }

    window.setTimeout(revisar, 150);
  }

  window.setTimeout(revisar, 150);
})();
</script>
</body>
</html>`;

    window.setTimeout(() => {
      if (!estaActivo) return;
      setEstaPaginando(true);
      onEstadoRenderizacionChange?.(true);
      setError(null);
      setAlturaIframe(600);
      setTokenRenderDocumento(tokenRender);
      setSrcdoc(htmlCompleto);
    }, 0);

    return () => {
      estaActivo = false;
    };
  }, [documento, onEstadoRenderizacionChange]);

  const manejarCargaIframe = useCallback(() => {
    setTimeout(ajustarAltura, 2500);
  }, [ajustarAltura]);

  useEffect(() => {
    const manejarMensaje = (event: MessageEvent) => {
      const data = event.data as {
        tipo?: string;
        token?: string;
        altura?: number;
      } | null;

      if (!data || data.tipo !== TIPO_MENSAJE_PAGEDJS_LISTO || data.token !== tokenRenderDocumento) return;

      if (typeof data.altura === "number" && data.altura > 100) {
        setAlturaIframe(data.altura + 60);
      }
      finalizarRenderizadoDocumento();
    };

    window.addEventListener("message", manejarMensaje);

    return () => {
      window.removeEventListener("message", manejarMensaje);
    };
  }, [finalizarRenderizadoDocumento, tokenRenderDocumento]);

  return {
    iframeRef,
    estaPaginando,
    alturaIframe,
    error,
    limpiarError: () => setError(null),
    srcdoc,
    tokenRenderDocumento,
    manejarCargaIframe,
  };
}
