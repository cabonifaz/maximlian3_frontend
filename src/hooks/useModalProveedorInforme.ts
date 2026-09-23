import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { esquemaModalProveedorInvestigacion } from "@maximilian/schemas/investigacion.schema";
import { servicioTablaMaestra } from "@maximilian/services/tabla-maestra.service";
import type { RegistroProveedorAnalista } from "@maximilian/shared/types/investigacion.type";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import { traducirOpcionesTablaMaestra } from "@maximilian/shared/utils/tabla-maestra-idioma.util";

interface ParametrosUseModalProveedorInforme {
  registroInicial?: RegistroProveedorAnalista | null;
  idIdioma?: number;
  onGuardar: (registro: RegistroProveedorAnalista) => void;
}

function obtenerIdSeleccion(opciones: { num1: number | null; string1: string | null }[] | undefined, valor: string) {
  const texto = valor.trim();
  const opcionCoincidente = opciones?.find(
    (opcion) => opcion.string1?.trim().toLowerCase() === texto.toLowerCase(),
  );
  if (opcionCoincidente?.num1 != null) return opcionCoincidente.num1;

  const numero = Number.parseInt(texto, 10);
  return Number.isFinite(numero) && numero > 0 ? numero : undefined;
}

export function useModalProveedorInforme({
  registroInicial,
  idIdioma,
  onGuardar,
}: ParametrosUseModalProveedorInforme) {
  const [tipoProveedor, setTipoProveedor] = useState(registroInicial?.tipoProveedor ?? "");
  const [nombreEmpresa, setNombreEmpresa] = useState(registroInicial?.nombreEmpresa ?? "");
  const [pais, setPais] = useState(registroInicial?.pais ?? "");
  const [taxIdType, setTaxIdType] = useState(registroInicial?.taxIdType ?? "");
  const [taxIdNumber, setTaxIdNumber] = useState(registroInicial?.taxIdNumber ?? "");
  const [contacto, setContacto] = useState(registroInicial?.contacto ?? "");
  const [telefono, setTelefono] = useState(registroInicial?.telefono ?? "");
  const [tieneReferenciaComercial, setTieneReferenciaComercial] = useState(
    registroInicial?.esTieneReferenciaComercial ?? registroInicial?.tieneReferenciaComercial ?? false,
  );
  const [comienzoNegociaciones, setComienzoNegociaciones] = useState(registroInicial?.comienzoNegociaciones ?? "");
  const [operacionCambioMoneda, setOperacionCambioMoneda] = useState(registroInicial?.operacionCambioMoneda ?? "");
  const [tipoCambio, setTipoCambio] = useState(registroInicial?.tipoCambio ?? "");
  const [limiteCredito, setLimiteCredito] = useState(registroInicial?.limiteCredito ?? "");
  const [promedioMensual, setPromedioMensual] = useState(registroInicial?.promedioMensual ?? "");
  const [plazoCredito, setPlazoCredito] = useState(registroInicial?.plazoCredito ?? "");
  const [idTiempoCreditoSeleccionado, setIdTiempoCreditoSeleccionado] = useState<number | undefined>(
    registroInicial?.idTiempoCredito ?? registroInicial?.idPlazoCredito,
  );
  const [idCalificacion, setIdCalificacion] = useState<number | undefined>(registroInicial?.idCalificacion);
  const [comentarios, setComentarios] = useState(registroInicial?.comentarios ?? "");

  const { data: opcionesTipoProveedorBase } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.TIPO_PROVEEDOR],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.TIPO_PROVEEDOR),
    staleTime: Infinity,
  });
  const { data: opcionesPaisBase } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.PAIS],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.PAIS),
    staleTime: Infinity,
  });
  const { data: opcionesTaxIdBase } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.TIPO_DOCUMENTO_INVESTIGACION],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.TIPO_DOCUMENTO_INVESTIGACION),
    staleTime: Infinity,
  });
  const { data: opcionesMonedaBase } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.MONEDA],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.MONEDA),
    staleTime: Infinity,
  });
  const { data: opcionesLimiteCreditoBase } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.LIMITE_CREDITO_PROVEEDOR],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.LIMITE_CREDITO_PROVEEDOR),
    staleTime: Infinity,
  });

  const { data: opcionesPlazoCreditoBase } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.PLAZO_CREDITO_PROVEEDOR],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.PLAZO_CREDITO_PROVEEDOR),
    staleTime: Infinity,
  });
  const { data: opcionesCalificacion } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.CALIFICACION_PROVEEDOR],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.CALIFICACION_PROVEEDOR),
    staleTime: Infinity,
  });

  const opcionesTipoProveedor = useMemo(
    () => traducirOpcionesTablaMaestra(opcionesTipoProveedorBase, idIdioma),
    [idIdioma, opcionesTipoProveedorBase],
  );
  const opcionesPais = useMemo(() => traducirOpcionesTablaMaestra(opcionesPaisBase, idIdioma), [idIdioma, opcionesPaisBase]);
  const opcionesTaxId = useMemo(() => traducirOpcionesTablaMaestra(opcionesTaxIdBase, idIdioma), [idIdioma, opcionesTaxIdBase]);
  const opcionesMoneda = useMemo(() => traducirOpcionesTablaMaestra(opcionesMonedaBase, idIdioma), [idIdioma, opcionesMonedaBase]);
  const opcionesLimiteCredito = useMemo(
    () => traducirOpcionesTablaMaestra(opcionesLimiteCreditoBase, idIdioma),
    [idIdioma, opcionesLimiteCreditoBase],
  );

  const opcionesPlazoCredito = useMemo(
    () => traducirOpcionesTablaMaestra(opcionesPlazoCreditoBase, idIdioma),
    [idIdioma, opcionesPlazoCreditoBase],
  );

  const idLimiteCreditoActual = obtenerIdSeleccion(opcionesLimiteCredito, limiteCredito)
    ?? registroInicial?.idLimiteCredito;
  const promedioMensualHabilitado = idLimiteCreditoActual === 1;

  const manejarGuardar = () => {
    const idTipoProveedor = obtenerIdSeleccion(opcionesTipoProveedor, tipoProveedor) || registroInicial?.idTipoProveedor;
    const idPais = obtenerIdSeleccion(opcionesPais, pais) || registroInicial?.idPais;
    const idTipoDocumento = obtenerIdSeleccion(opcionesTaxId, taxIdType) || registroInicial?.idTipoDocumento;
    const idMoneda = obtenerIdSeleccion(opcionesMoneda, operacionCambioMoneda) || registroInicial?.idMoneda;
    const idLimiteCredito = obtenerIdSeleccion(opcionesLimiteCredito, limiteCredito)
      ?? registroInicial?.idLimiteCredito;
    const idTiempoCredito = idTiempoCreditoSeleccionado
      ?? obtenerIdSeleccion(opcionesPlazoCredito, plazoCredito)
      ?? registroInicial?.idTiempoCredito
      ?? registroInicial?.idPlazoCredito;

    const resultado = esquemaModalProveedorInvestigacion.safeParse({
      idInformeProveedor: registroInicial?.idInformeProveedor,
      idTipoProveedor: idTipoProveedor ?? undefined,
      nombreEmpresa: nombreEmpresa.trim(),
      contacto: contacto.trim(),
      tipoProveedor,
      telefono: telefono.trim(),
      tipoPersona: registroInicial?.tipoPersona ?? "Juridica",
      idPais: idPais ?? undefined,
      pais,
      idTipoDocumento: idTipoDocumento ?? undefined,
      taxIdType,
      taxIdNumber: taxIdNumber.trim(),
      tieneReferenciaComercial,
      esTieneReferenciaComercial: tieneReferenciaComercial,
      comienzoNegociaciones: tieneReferenciaComercial ? comienzoNegociaciones.trim() : "",
      idMoneda: tieneReferenciaComercial ? idMoneda ?? undefined : undefined,
      operacionCambioMoneda: tieneReferenciaComercial ? operacionCambioMoneda : "",
      tipoCambio: tieneReferenciaComercial ? tipoCambio.trim() : "",
      idLimiteCredito: tieneReferenciaComercial ? idLimiteCredito ?? undefined : undefined,
      limiteCredito: tieneReferenciaComercial ? limiteCredito : "",
      idPlazoCredito: tieneReferenciaComercial ? idTiempoCredito ?? undefined : undefined,
      idTiempoCredito: tieneReferenciaComercial ? idTiempoCredito ?? undefined : undefined,
      plazoCredito: tieneReferenciaComercial ? plazoCredito : "",
      promedioMensual: tieneReferenciaComercial && idLimiteCredito === 1 ? promedioMensual.trim() : "",
      idCalificacion: tieneReferenciaComercial ? idCalificacion : undefined,
      comentarios: tieneReferenciaComercial ? comentarios.trim() : "",
      productos: registroInicial?.productos ?? "",
    });
    if (!resultado.success) return;

    onGuardar(resultado.data);
  };

  return {
    tipoProveedor,
    setTipoProveedor,
    nombreEmpresa,
    setNombreEmpresa,
    pais,
    setPais,
    taxIdType,
    setTaxIdType,
    taxIdNumber,
    setTaxIdNumber,
    contacto,
    setContacto,
    telefono,
    setTelefono,
    tieneReferenciaComercial,
    setTieneReferenciaComercial,
    comienzoNegociaciones,
    setComienzoNegociaciones,
    operacionCambioMoneda,
    setOperacionCambioMoneda,
    tipoCambio,
    setTipoCambio,
    limiteCredito,
    setLimiteCredito,
    promedioMensual,
    setPromedioMensual,
    plazoCredito,
    setPlazoCredito,
    setIdTiempoCreditoSeleccionado,
    idCalificacion,
    setIdCalificacion,
    comentarios,
    setComentarios,
    opcionesTipoProveedor,
    opcionesPais,
    opcionesTaxId,
    opcionesMoneda,
    opcionesLimiteCredito,
    promedioMensualHabilitado,
    opcionesPlazoCredito,
    opcionesCalificacion,
    manejarGuardar,
  };
}
