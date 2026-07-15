import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { servicioInformeLocalImagen } from "@maximilian/services/informe-local-imagen.service";
import { servicioTablaMaestra } from "@maximilian/services/tabla-maestra.service";
import type {
  RegistroImagenLocalAnalista,
  RegistroLocalAnalista,
} from "@maximilian/shared/types/investigacion.type";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import { traducirOpcionesTablaMaestra } from "@maximilian/shared/utils/tabla-maestra-idioma.util";

interface ParametrosUseModalLocalInforme {
  estaAbierto: boolean;
  idIdioma?: number;
  onGuardar: (registro: RegistroLocalAnalista) => void;
  registroInicial?: RegistroLocalAnalista | null;
}

function obtenerTextoLocal(valor: unknown) {
  return valor == null ? "" : String(valor);
}

function obtenerImagenesIniciales(registroInicial?: RegistroLocalAnalista | null) {
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
}

export function useModalLocalInforme({
  estaAbierto,
  idIdioma,
  onGuardar,
  registroInicial,
}: ParametrosUseModalLocalInforme) {
  const [tipoLocal, setTipoLocal] = useState(() =>
    obtenerTextoLocal(registroInicial?.tipoLocal),
  );
  const [direccion, setDireccion] = useState(() =>
    obtenerTextoLocal(registroInicial?.direccion),
  );
  const [comentario, setComentario] = useState(() =>
    obtenerTextoLocal(registroInicial?.comentario),
  );
  const [indiceImagenAEliminar, setIndiceImagenAEliminar] = useState<number | null>(
    null,
  );
  const [indiceImagenVisualizando, setIndiceImagenVisualizando] = useState<
    number | null
  >(null);
  const [imagenes, setImagenes] = useState<RegistroImagenLocalAnalista[]>(() =>
    obtenerImagenesIniciales(registroInicial),
  );
  const inputArchivoRef = useRef<HTMLInputElement>(null);
  const blobUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!estaAbierto) return;
    setTipoLocal(obtenerTextoLocal(registroInicial?.tipoLocal));
    setDireccion(obtenerTextoLocal(registroInicial?.direccion));
    setComentario(obtenerTextoLocal(registroInicial?.comentario));
    setIndiceImagenAEliminar(null);
    setIndiceImagenVisualizando(null);
    setImagenes(obtenerImagenesIniciales(registroInicial));
    blobUrlsRef.current = [];
  }, [estaAbierto, registroInicial]);

  useEffect(() => {
    if (!estaAbierto) return;

    const idsSinUrl = obtenerImagenesIniciales(registroInicial)
      .filter((imagen) => imagen.idInformeLocalImagen && !imagen.url && !imagen.esNueva)
      .map((imagen) => imagen.idInformeLocalImagen!);

    if (idsSinUrl.length === 0) return;

    let cancelado = false;

    servicioInformeLocalImagen
      .obtenerUrls(idsSinUrl)
      .then((urlsObtenidas) => {
        if (cancelado) return;
        const mapaUrls = new Map(
          urlsObtenidas.map((url) => [url.idInformeLocalImagen, url.url]),
        );
        setImagenes((anterior) =>
          anterior.map((imagen) =>
            imagen.idInformeLocalImagen &&
            mapaUrls.has(imagen.idInformeLocalImagen)
              ? { ...imagen, url: mapaUrls.get(imagen.idInformeLocalImagen) }
              : imagen,
          ),
        );
      })
      .catch(() => {});

    return () => {
      cancelado = true;
    };
  }, [estaAbierto, registroInicial]);

  const { data: opcionesTipoLocalBase } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.TIPO_LOCAL],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.TIPO_LOCAL),
    staleTime: Infinity,
  });

  const opcionesTipoLocal = useMemo(
    () => traducirOpcionesTablaMaestra(opcionesTipoLocalBase, idIdioma),
    [idIdioma, opcionesTipoLocalBase],
  );

  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const manejarGuardar = () => {
    const tipoLocalNormalizado = obtenerTextoLocal(tipoLocal).trim();
    const idTipoLocal =
      opcionesTipoLocal?.find(
        (opcion) =>
          opcion.string1 === tipoLocalNormalizado ||
          String(opcion.num1 ?? "") === tipoLocalNormalizado,
      )?.num1 ?? registroInicial?.idTipoLocal;

    onGuardar({
      idTipoLocal: idTipoLocal ?? undefined,
      tipoLocal: tipoLocalNormalizado,
      direccion: obtenerTextoLocal(direccion).trim(),
      comentario: obtenerTextoLocal(comentario).trim(),
      imagen:
        imagenes.length === 0
          ? ""
          : imagenes.length === 1
            ? imagenes[0].nombre
            : `${imagenes.length} imagenes adjuntas`,
      imagenUrl: imagenes[0]?.url,
      imagenTipo: imagenes[0]?.tipo,
      imagenes,
    });
  };

  const manejarSeleccionImagen = (archivos?: FileList | null) => {
    if (!archivos?.length) return;

    const nombresUsados = new Set(imagenes.map((imagen) => imagen.nombre));

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

      return {
        nombre: nombreFinal,
        tipo: archivo.type,
        url,
        esNueva: true,
        archivo,
      };
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
        blobUrlsRef.current = blobUrlsRef.current.filter((url) => url !== imagen.url);
      }
      return anterior.filter((_, indice) => indice !== indiceImagen);
    });
  };

  const etiquetaImagenes =
    imagenes.length === 0
      ? "Sin imagen adjunta"
      : `${imagenes.length} ${
          imagenes.length === 1 ? "imagen adjunta" : "imagenes adjuntas"
        }`;

  return {
    abrirImagenAdjunta,
    comentario,
    direccion,
    eliminarImagenAdjunta,
    etiquetaImagenes,
    imagenes,
    indiceImagenAEliminar,
    indiceImagenVisualizando,
    inputArchivoRef,
    manejarGuardar,
    manejarSeleccionImagen,
    opcionesTipoLocal,
    setComentario,
    setDireccion,
    setIndiceImagenAEliminar,
    setIndiceImagenVisualizando,
    setTipoLocal,
    tipoLocal,
  };
}
