import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  const numero = Number.parseInt(texto, 10);
  if (Number.isFinite(numero) && numero > 0) return numero;

  return opciones?.find((opcion) => opcion.string1?.trim().toLowerCase() === texto.toLowerCase())?.num1 ?? undefined;
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
    queryKey: ["masterTable", TablaMaestraId.TIPO_REG_TRIBUTARIO],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.TIPO_REG_TRIBUTARIO),
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

  const manejarGuardar = () => {
    const idTipoProveedor = obtenerIdSeleccion(opcionesTipoProveedor, tipoProveedor) || registroInicial?.idTipoProveedor;
    const idPais = obtenerIdSeleccion(opcionesPais, pais) || registroInicial?.idPais;
    const idTipoDocumento = obtenerIdSeleccion(opcionesTaxId, taxIdType) || registroInicial?.idTipoDocumento;
    const idMoneda = obtenerIdSeleccion(opcionesMoneda, operacionCambioMoneda) || registroInicial?.idMoneda;
    const idLimiteCredito = obtenerIdSeleccion(opcionesLimiteCredito, limiteCredito)
      ?? registroInicial?.idLimiteCredito
      ?? registroInicial?.idPlazoCredito;

    onGuardar({
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
      idPlazoCredito: tieneReferenciaComercial ? idLimiteCredito ?? undefined : undefined,
      limiteCredito: tieneReferenciaComercial ? limiteCredito : "",
      promedioMensual: tieneReferenciaComercial ? promedioMensual.trim() : "",
    });
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
    opcionesTipoProveedor,
    opcionesPais,
    opcionesTaxId,
    opcionesMoneda,
    opcionesLimiteCredito,
    manejarGuardar,
  };
}
