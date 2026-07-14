import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Eye, Image as IconoImagen, Trash2, Upload, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { CustomModalConfirmacionEliminacion } from "@maximilian/components/common/CustomModalConfirmacionEliminacion";
import { SelectorMaestroConAltaInvestigacionAnalista } from "@maximilian/components/investigacion/ControlesInforme";
import { servicioTablaMaestra } from "@maximilian/services/tabla-maestra.service";
import { servicioInformeLocalImagen } from "@maximilian/services/informe-local-imagen.service";
import type { RegistroImagenLocalAnalista, RegistroLocalAnalista } from "@maximilian/shared/types/investigacion.type";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import { traducirOpcionesTablaMaestra } from "@maximilian/shared/utils/tabla-maestra-idioma.util";
import {
  seleccionarTextoCampoEditable,
  seleccionarTextoEditableEnContenedor,
} from "@maximilian/shared/utils/formato-monto.util";

interface PropsCustomModalLocalAnalista {
  estaAbierto: boolean;
  registroInicial?: RegistroLocalAnalista | null;
  soloLectura?: boolean;
  idIdioma?: number;
  onCerrar: () => void;
  onGuardar: (registro: RegistroLocalAnalista) => void;
}

function obtenerTextoLocal(valor: unknown) {
  return valor == null ? "" : String(valor);
}

export function CustomModalLocalAnalista({
  estaAbierto,
  registroInicial,
  soloLectura = false,
  idIdioma,
  onCerrar,
  onGuardar,
}: PropsCustomModalLocalAnalista) {
  const [tipoLocal, setTipoLocal] = useState(() => obtenerTextoLocal(registroInicial?.tipoLocal));
  const [direccion, setDireccion] = useState(() => obtenerTextoLocal(registroInicial?.direccion));
  const [comentario, setComentario] = useState(() => obtenerTextoLocal(registroInicial?.comentario));
  const [indiceImagenAEliminar, setIndiceImagenAEliminar] = useState<number | null>(null);
  const [indiceImagenVisualizando, setIndiceImagenVisualizando] = useState<number | null>(null);
  const [imagenes, setImagenes] = useState<RegistroImagenLocalAnalista[]>(() => {
    if (registroInicial?.imagenes?.length) return registroInicial.imagenes;
    if (registroInicial?.imagen) {
      return [
        {
          nombre: registroInicial.imagen,
          url: registroInicial.imagenUrl,
          tipo: registroInicial.imagenTipo,
        },
      ];
    }
    return [];
  });
  const inputArchivoRef = useRef<HTMLInputElement>(null);
  const blobUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!estaAbierto) return;
    setTipoLocal(obtenerTextoLocal(registroInicial?.tipoLocal));
    setDireccion(obtenerTextoLocal(registroInicial?.direccion));
    setComentario(obtenerTextoLocal(registroInicial?.comentario));
    setIndiceImagenAEliminar(null);
    setIndiceImagenVisualizando(null);
    setImagenes(
      registroInicial?.imagenes?.length
        ? registroInicial.imagenes
        : registroInicial?.imagen
          ? [{ nombre: registroInicial.imagen, url: registroInicial.imagenUrl, tipo: registroInicial.imagenTipo }]
          : [],
    );
    blobUrlsRef.current = [];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estaAbierto, registroInicial]);

  useEffect(() => {
    if (!estaAbierto) return;

    const imagenesIniciales = registroInicial?.imagenes?.length
      ? registroInicial.imagenes
      : registroInicial?.imagen
        ? [{ nombre: registroInicial.imagen, url: registroInicial.imagenUrl, tipo: registroInicial.imagenTipo }]
        : [];

    const idsSinUrl = imagenesIniciales
      .filter((img) => img.idInformeLocalImagen && !img.url && !img.esNueva)
      .map((img) => img.idInformeLocalImagen!);

    if (idsSinUrl.length === 0) return;

    let cancelado = false;

    servicioInformeLocalImagen.obtenerUrls(idsSinUrl).then((urlsObtenidas) => {
      if (cancelado) return;
      const mapaUrls = new Map(urlsObtenidas.map((u) => [u.idInformeLocalImagen, u.url]));
      setImagenes((anterior) =>
        anterior.map((img) =>
          img.idInformeLocalImagen && mapaUrls.has(img.idInformeLocalImagen)
            ? { ...img, url: mapaUrls.get(img.idInformeLocalImagen) }
            : img,
        ),
      );
    }).catch(() => {});

    return () => { cancelado = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estaAbierto, registroInicial]);

  const { data: opcionesTipoLocalBase } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.TIPO_LOCAL],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.TIPO_LOCAL),
    staleTime: Infinity,
  });
  const opcionesTipoLocal = useMemo(() => traducirOpcionesTablaMaestra(opcionesTipoLocalBase, idIdioma), [idIdioma, opcionesTipoLocalBase]);

  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  if (!estaAbierto) return null;

  const manejarGuardar = () => {
    const tipoLocalNormalizado = obtenerTextoLocal(tipoLocal).trim();
    const idTipoLocal = opcionesTipoLocal?.find(
      (opcion) => opcion.string1 === tipoLocalNormalizado || String(opcion.num1 ?? "") === tipoLocalNormalizado,
    )?.num1 ?? registroInicial?.idTipoLocal;

    onGuardar({
      idTipoLocal: idTipoLocal ?? undefined,
      tipoLocal: tipoLocalNormalizado,
      direccion: obtenerTextoLocal(direccion).trim(),
      comentario: obtenerTextoLocal(comentario).trim(),
      imagen: imagenes.length === 0 ? "" : imagenes.length === 1 ? imagenes[0].nombre : `${imagenes.length} imágenes adjuntas`,
      imagenUrl: imagenes[0]?.url,
      imagenTipo: imagenes[0]?.tipo,
      imagenes,
    });
  };

  const manejarSeleccionImagen = (archivos?: FileList | null) => {
    if (!archivos?.length) return;

    const nombresUsados = new Set(imagenes.map((img) => img.nombre));

    const nuevasImagenes = Array.from(archivos).map((archivo) => {
      const url = URL.createObjectURL(archivo);
      blobUrlsRef.current.push(url);

      let nombreFinal = archivo.name;
      if (nombresUsados.has(nombreFinal)) {
        const punto = archivo.name.lastIndexOf(".");
        const sinExt = punto >= 0 ? archivo.name.slice(0, punto) : archivo.name;
        const ext = punto >= 0 ? archivo.name.slice(punto) : "";
        let sufijo = 1;
        while (nombresUsados.has(`${sinExt} (${sufijo})${ext}`)) sufijo++;
        nombreFinal = `${sinExt} (${sufijo})${ext}`;
      }
      nombresUsados.add(nombreFinal);

      return { nombre: nombreFinal, tipo: archivo.type, url, esNueva: true, archivo };
    });

    setImagenes((anterior) => [...anterior, ...nuevasImagenes]);

    if (inputArchivoRef.current) {
      inputArchivoRef.current.value = "";
    }
  };

  const abrirImagenAdjunta = (indice: number) => {
    if (!imagenes[indice]?.url) return;
    setIndiceImagenVisualizando(indice);
  };

  const eliminarImagenAdjunta = (indiceImagen: number) => {
    setImagenes((anterior) => {
      const imagen = anterior[indiceImagen];
      if (imagen?.esNueva && imagen.url) {
        URL.revokeObjectURL(imagen.url);
        blobUrlsRef.current = blobUrlsRef.current.filter((u) => u !== imagen.url);
      }
      return anterior.filter((_, indice) => indice !== indiceImagen);
    });
  };

  const etiquetaImagenes =
    imagenes.length === 0 ? "Sin imagen adjunta" : `${imagenes.length} ${imagenes.length === 1 ? "imagen adjunta" : "imágenes adjuntas"}`;

  const puedeAgregarMasImagenes = true;

  const renderizarGaleriaImagenes = () => {
    if (imagenes.length === 0) {
      return (
        <div className="flex min-h-28 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#d8e0ef] bg-[#fbfcfe] text-center">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-[#8ea0c0]">
            <IconoImagen size={16} />
          </span>
          <span className="text-sm font-semibold text-slate-500">Sin imágenes</span>
        </div>
      );
    }

    return (
      <div className="overflow-hidden rounded-2xl border border-gray-100">
        <div className="flex items-center gap-3 border-b border-gray-100 bg-slate-50 px-4 py-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
            <IconoImagen size={16} />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-700">Imágenes del local</p>
            <p className="text-xs text-slate-400">{etiquetaImagenes}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3">
          {imagenes.map((imagen, indice) => (
            <button
              key={`${imagen.nombre}-${indice}`}
              type="button"
              onClick={() => abrirImagenAdjunta(indice)}
              disabled={!imagen.url}
              className="group relative aspect-square overflow-hidden rounded-xl border border-gray-100 bg-slate-50"
            >
              {imagen.url ? (
                <img src={imagen.url} alt={imagen.nombre} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-300">
                  <IconoImagen size={24} />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                <div className="rounded-full bg-black/50 p-2">
                  <Eye size={14} className="text-white" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 truncate bg-gradient-to-t from-black/60 to-transparent px-2 py-1 text-xs text-white">
                {imagen.nombre}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderizarListaImagenes = () => {
    if (imagenes.length === 0) {
      return (
        <button
          type="button"
          onClick={() => inputArchivoRef.current?.click()}
          className="flex min-h-28 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#d8e0ef] bg-[#fbfcfe] px-5 py-6 text-center"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-[#8ea0c0]">
            <Upload size={16} />
          </span>
          <span className="text-sm font-semibold text-slate-500">
            Haga clic para subir una o varias imágenes
          </span>
        </button>
      );
    }

    return (
      <div className="overflow-hidden rounded-2xl border border-gray-100">
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
              <IconoImagen size={16} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-700">Imágenes del local</p>
              <p className="text-xs text-slate-400">{etiquetaImagenes}</p>
            </div>
          </div>
          {puedeAgregarMasImagenes ? (
            <CustomButton
              variant="secondary"
              size="sm"
              onClick={() => inputArchivoRef.current?.click()}
            >
              <Upload size={14} />
              Agregar
            </CustomButton>
          ) : null}
        </div>

        <div className="max-h-56 space-y-3 overflow-y-auto p-4">
          {imagenes.map((imagen, indice) => (
            <div
              key={`${imagen.nombre}-${indice}`}
              className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3"
            >
              {imagen.url ? (
                <img
                  src={imagen.url}
                  alt={imagen.nombre}
                  className="h-14 w-14 shrink-0 rounded-xl border border-gray-100 object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-slate-50 text-slate-400">
                  <IconoImagen size={16} />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-700">{imagen.nombre}</p>
                <p className="text-xs text-slate-400">{imagen.tipo || "Imagen adjunta"}</p>
              </div>

              <div className="flex shrink-0 gap-2">
                <CustomButton
                  variant="ghost"
                  size="icon"
                  onClick={() => abrirImagenAdjunta(indice)}
                  disabled={!imagen.url}
                  title="Ver imagen"
                  aria-label="Ver imagen"
                  className="text-slate-500"
                >
                  <Eye size={16} />
                </CustomButton>
                <CustomButton
                  variant="ghost"
                  size="icon"
                  onClick={() => setIndiceImagenAEliminar(indice)}
                  title="Eliminar imagen"
                  aria-label="Eliminar imagen"
                  className="text-red-500 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </CustomButton>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm" onFocusCapture={seleccionarTextoEditableEnContenedor}>
      <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8ea0c0]">Registro de locales</p>
            <h2 className="mt-2 text-xl font-bold text-brand-black">
              {soloLectura ? "Detalle de Local" : registroInicial ? "Editar Local" : "Nuevo Local"}
            </h2>
          </div>
          <CustomButton variant="ghost" size="icon" onClick={onCerrar}>
            <X size={20} className="text-[#8ea0c0]" />
          </CustomButton>
        </div>

        <div className="space-y-5 overflow-y-auto px-6 py-5">
          <div className="space-y-2">
            <SelectorMaestroConAltaInvestigacionAnalista
              etiqueta="Tipo de Local"
              valor={tipoLocal}
              soloLectura={soloLectura}
              opcionesTablaMaestra={opcionesTipoLocal}
              idMaestro={TablaMaestraId.TIPO_LOCAL}
              permiteAltaNueva={!soloLectura}
              marcador="Seleccione tipo de local"
              onChange={setTipoLocal}
            />
          </div>

          <div className="space-y-2">
            <CustomLabel>Dirección</CustomLabel>
            <input
              value={direccion}
              onChange={(event) => setDireccion(event.target.value)}
              onFocus={seleccionarTextoCampoEditable}
              disabled={soloLectura}
              placeholder="Ej. Av. Industrial 456, Planta 2..."
              className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none transition-all placeholder:text-gray-300 focus:border-brand-black focus:ring-2 focus:ring-brand-black/5 disabled:cursor-default disabled:bg-slate-50"
            />
          </div>

          <div className="space-y-2">
            <CustomLabel>Comentario</CustomLabel>
            <textarea
              value={comentario}
              onChange={(event) => setComentario(event.target.value)}
              onFocus={seleccionarTextoCampoEditable}
              disabled={soloLectura}
              placeholder="Describa brevemente las características del local..."
              rows={4}
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-slate-600 outline-none transition-all placeholder:text-gray-300 focus:border-brand-black focus:ring-2 focus:ring-brand-black/5 disabled:cursor-default disabled:bg-slate-50"
            />
          </div>

          <div className="space-y-2">
            <CustomLabel>Imágenes del Local</CustomLabel>
            {!soloLectura && (
              <input
                ref={inputArchivoRef}
                type="file"
                accept=".jpg,.jpeg,.png"
                multiple
                className="hidden"
                onChange={(event) => manejarSeleccionImagen(event.target.files)}
              />
            )}
            {soloLectura ? renderizarGaleriaImagenes() : renderizarListaImagenes()}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
          {soloLectura ? (
            <CustomButton variant="secondary" size="sm" onClick={onCerrar}>
              Cerrar
            </CustomButton>
          ) : (
            <>
              <CustomButton variant="secondary" size="sm" onClick={onCerrar}>
                Cancelar
              </CustomButton>
              <CustomButton size="sm" onClick={manejarGuardar}>
                Guardar
              </CustomButton>
            </>
          )}
        </div>
      </div>

      <CustomModalConfirmacionEliminacion
        isOpen={indiceImagenAEliminar !== null}
        onClose={() => setIndiceImagenAEliminar(null)}
        onConfirm={() => {
          if (indiceImagenAEliminar == null) return;
          eliminarImagenAdjunta(indiceImagenAEliminar);
          setIndiceImagenAEliminar(null);
        }}
        title="Eliminar imagen"
      >
        <p><span className="font-bold">Archivo:</span> {indiceImagenAEliminar != null ? imagenes[indiceImagenAEliminar]?.nombre ?? "-" : "-"}</p>
      </CustomModalConfirmacionEliminacion>
    </div>

    {indiceImagenVisualizando !== null && createPortal(
      <div
        className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 backdrop-blur-sm"
        onClick={() => setIndiceImagenVisualizando(null)}
      >
        <button
          type="button"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          onClick={() => setIndiceImagenVisualizando(null)}
        >
          <X size={18} />
        </button>

        {imagenes.length > 1 && (
          <>
            <button
              type="button"
              className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                setIndiceImagenVisualizando((anterior) => (anterior! - 1 + imagenes.length) % imagenes.length);
              }}
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                setIndiceImagenVisualizando((anterior) => (anterior! + 1) % imagenes.length);
              }}
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}

        <div className="flex max-h-[90vh] max-w-[90vw] flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <img
            src={imagenes[indiceImagenVisualizando]?.url}
            alt={imagenes[indiceImagenVisualizando]?.nombre}
            className="max-h-[80vh] max-w-[85vw] rounded-xl object-contain shadow-2xl"
          />
          <div className="flex items-center gap-3">
            <p className="text-sm text-white/80">{imagenes[indiceImagenVisualizando]?.nombre}</p>
            {imagenes.length > 1 && (
              <p className="text-xs text-white/50">{indiceImagenVisualizando + 1} / {imagenes.length}</p>
            )}
          </div>
        </div>
      </div>,
      document.body,
    )}
    </>
  );
}
