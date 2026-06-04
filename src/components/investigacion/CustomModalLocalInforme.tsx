import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Eye, Image as IconoImagen, Trash2, Upload, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { CustomModalConfirmacionEliminacion } from "@maximilian/components/common/CustomModalConfirmacionEliminacion";
import { SelectorMaestroConAltaInvestigacionAnalista } from "@maximilian/components/investigacion/ControlesInforme";
import { servicioTablaMaestra } from "@maximilian/services/tablaMaestra.service";
import type { RegistroImagenLocalAnalista, RegistroLocalAnalista } from "@maximilian/shared/types/investigacion.type";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import {
  seleccionarTextoCampoEditable,
  seleccionarTextoEditableEnContenedor,
} from "@maximilian/shared/utils/formato-monto.util";

interface PropsCustomModalLocalAnalista {
  estaAbierto: boolean;
  registroInicial?: RegistroLocalAnalista | null;
  onCerrar: () => void;
  onGuardar: (registro: RegistroLocalAnalista) => void;
}

export function CustomModalLocalAnalista({
  estaAbierto,
  registroInicial,
  onCerrar,
  onGuardar,
}: PropsCustomModalLocalAnalista) {
  const [tipoLocal, setTipoLocal] = useState(registroInicial?.tipoLocal ?? "");
  const [direccion, setDireccion] = useState(registroInicial?.direccion ?? "");
  const [comentario, setComentario] = useState(registroInicial?.comentario ?? "");
  const [indiceImagenAEliminar, setIndiceImagenAEliminar] = useState<number | null>(null);
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
  const { data: opcionesTipoLocal } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.TIPO_LOCAL],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.TIPO_LOCAL),
    staleTime: Infinity,
  });

  useEffect(() => {
    return () => {
      imagenes.forEach((imagen) => {
        if (imagen.esNueva && imagen.url) {
          URL.revokeObjectURL(imagen.url);
        }
      });
    };
  }, [imagenes]);

  if (!estaAbierto) return null;

  const manejarGuardar = () => {
    onGuardar({
      tipoLocal: tipoLocal.trim(),
      direccion: direccion.trim(),
      comentario: comentario.trim(),
      imagen: imagenes.length === 0 ? "" : imagenes.length === 1 ? imagenes[0].nombre : `${imagenes.length} imágenes adjuntas`,
      imagenUrl: imagenes[0]?.url,
      imagenTipo: imagenes[0]?.tipo,
      imagenes,
    });
  };

  const manejarSeleccionImagen = (archivos?: FileList | null) => {
    if (!archivos?.length) return;

    const nuevasImagenes = Array.from(archivos).map((archivo) => ({
      nombre: archivo.name,
      tipo: archivo.type,
      url: URL.createObjectURL(archivo),
      esNueva: true,
    }));

    setImagenes((anterior) => [...anterior, ...nuevasImagenes]);

    if (inputArchivoRef.current) {
      inputArchivoRef.current.value = "";
    }
  };

  const abrirImagenAdjunta = (url?: string) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const eliminarImagenAdjunta = (indiceImagen: number) => {
    setImagenes((anterior) => {
      const imagen = anterior[indiceImagen];
      if (imagen?.esNueva && imagen.url) {
        URL.revokeObjectURL(imagen.url);
      }
      return anterior.filter((_, indice) => indice !== indiceImagen);
    });
  };

  const etiquetaImagenes =
    imagenes.length === 0 ? "Sin imagen adjunta" : `${imagenes.length} ${imagenes.length === 1 ? "imagen adjunta" : "imágenes adjuntas"}`;

  const puedeAgregarMasImagenes = true;

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
                  onClick={() => abrirImagenAdjunta(imagen.url)}
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
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm" onFocusCapture={seleccionarTextoEditableEnContenedor}>
      <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8ea0c0]">Registro de locales</p>
            <h2 className="mt-2 text-xl font-bold text-brand-black">{registroInicial ? "Editar Local" : "Nuevo Local"}</h2>
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
              soloLectura={false}
              opcionesTablaMaestra={opcionesTipoLocal}
              idMaestro={TablaMaestraId.TIPO_LOCAL}
              permiteAltaNueva
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
              placeholder="Ej. Av. Industrial 456, Planta 2..."
              className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm text-slate-600 outline-none transition-all placeholder:text-gray-300 focus:border-brand-black focus:ring-2 focus:ring-brand-black/5"
            />
          </div>

          <div className="space-y-2">
            <CustomLabel>Comentario</CustomLabel>
            <textarea
              value={comentario}
              onChange={(event) => setComentario(event.target.value)}
              onFocus={seleccionarTextoCampoEditable}
              placeholder="Describa brevemente las características del local..."
              rows={4}
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-slate-600 outline-none transition-all placeholder:text-gray-300 focus:border-brand-black focus:ring-2 focus:ring-brand-black/5"
            />
          </div>

          <div className="space-y-2">
            <CustomLabel>Imagen del Local</CustomLabel>
            <input
              ref={inputArchivoRef}
              type="file"
              accept=".jpg,.jpeg,.png"
              multiple
              className="hidden"
              onChange={(event) => manejarSeleccionImagen(event.target.files)}
            />
            {renderizarListaImagenes()}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
          <CustomButton variant="secondary" size="sm" onClick={onCerrar}>
            Cancelar
          </CustomButton>
          <CustomButton size="sm" onClick={manejarGuardar}>
            Guardar
          </CustomButton>
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
  );
}
