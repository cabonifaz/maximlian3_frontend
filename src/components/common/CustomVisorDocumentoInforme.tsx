import { useEffect, useMemo } from "react";
import { Hand, MousePointer2, Minus, Plus, RotateCcw } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { usePanZoomInforme } from "@maximilian/hooks/usePanZoomInforme";
import { useRenderizadoDocumentoPaginado } from "@maximilian/hooks/useRenderizadoDocumentoPaginado";
import type { DocumentoInformeGenerado } from "@maximilian/shared/types/informe.type";
import type { DatosInvestigacionAnalista } from "@maximilian/shared/types/investigacion.type";
import { convertirLongitudCssAPx } from "@maximilian/shared/utils/visor-documento-informe/convertirLongitudCssAPx";

interface PropsCustomVisorDocumentoInforme {
  documento: DocumentoInformeGenerado;
  datosInvestigacion?: DatosInvestigacionAnalista;
  ocuparAltoDisponible?: boolean;
  tituloBarra?: string;
  subtituloBarra?: string;
  onEstadoRenderizacionChange?: (estaRenderizando: boolean) => void;
  encabezado?: {
    pais: string;
    fecha: string;
    tipoSolicitud: string;
    analista: string;
    traductor: string;
  };
}

export function CustomVisorDocumentoInforme({
  documento,
  ocuparAltoDisponible = false,
  tituloBarra,
  subtituloBarra,
  onEstadoRenderizacionChange,
}: PropsCustomVisorDocumentoInforme) {
  const anchoPaginaPx = useMemo(
    () => convertirLongitudCssAPx(documento.document?.pageSize?.width),
    [documento.document?.pageSize?.width],
  );

  const {
    contenedorScrollRef,
    zoomInforme,
    zoomModificadoPorUsuario,
    zoomAjustadoInforme,
    restablecerZoomNoModificado,
    estaArrastrandoInforme,
    setModoInteraccionInforme,
    estaModoArrastrarInforme,
    porcentajeZoom,
    puedeAlejar,
    puedeAcercar,
    acercarInforme,
    alejarInforme,
    restablecerZoomInforme,
    iniciarArrastreInforme,
    moverArrastreInforme,
    terminarArrastreInforme,
  } = usePanZoomInforme(anchoPaginaPx);

  const {
    iframeRef,
    estaPaginando,
    alturaIframe,
    error,
    srcdoc,
    tokenRenderDocumento,
    manejarCargaIframe,
  } = useRenderizadoDocumentoPaginado(documento, onEstadoRenderizacionChange);

  useEffect(() => {
    if (tokenRenderDocumento) restablecerZoomNoModificado();
  }, [tokenRenderDocumento, restablecerZoomNoModificado]);

  const classNameContenedorVisor = `flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm ${
    ocuparAltoDisponible ? "h-full min-h-0" : "h-[min(72vh,760px)]"
  }`;
  const classNameContenedorScroll = `min-h-0 flex-1 overflow-auto px-2 py-4 sm:px-4 ${
    estaModoArrastrarInforme
      ? estaArrastrandoInforme
        ? "cursor-grabbing select-none"
        : "cursor-grab select-none"
      : "cursor-text"
  }`;

  const controlesZoom = (
    <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white/95 px-3 py-2 backdrop-blur sm:px-4">
      <div className="min-w-0">
        {tituloBarra ? (
          <>
            <p className="truncate text-[11px] font-bold uppercase tracking-[0.18em] text-slate-600">
              {tituloBarra}
            </p>
            {subtituloBarra ? (
              <p className="mt-0.5 truncate text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                ({subtituloBarra})
              </p>
            ) : null}
          </>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <CustomButton
            type="button"
            variant="ghost"
            size="icon"
            className={`h-9 w-9 rounded-none ${
              estaModoArrastrarInforme
                ? "bg-slate-900 text-white hover:bg-slate-800"
                : "text-slate-600 hover:bg-slate-100"
            }`}
            onClick={() => setModoInteraccionInforme("arrastrar")}
            aria-label="Mover informe arrastrando"
            title="Mover"
          >
            <Hand size={16} />
          </CustomButton>
          <CustomButton
            type="button"
            variant="ghost"
            size="icon"
            className={`h-9 w-9 rounded-none border-l border-slate-200 ${
              !estaModoArrastrarInforme
                ? "bg-slate-900 text-white hover:bg-slate-800"
                : "text-slate-600 hover:bg-slate-100"
            }`}
            onClick={() => setModoInteraccionInforme("seleccionar")}
            aria-label="Seleccionar texto del informe"
            title="Seleccionar texto"
          >
            <MousePointer2 size={16} />
          </CustomButton>
        </div>
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
              key={tokenRenderDocumento}
              ref={iframeRef}
              title="Vista previa del documento"
              srcDoc={srcdoc}
              scrolling="no"
              onLoad={manejarCargaIframe}
              style={{
                width: `${anchoPaginaPx}px`,
                height: `${alturaIframe}px`,
                border: "none",
                display: "block",
                visibility: estaPaginando ? "hidden" : "visible",
                transform: `scale(${zoomInforme})`,
                transformOrigin: "top left",
                pointerEvents: estaModoArrastrarInforme ? "none" : "auto",
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
          className={`mx-auto min-w-190 origin-top ${estaModoArrastrarInforme ? "select-none" : "select-text"}`}
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
