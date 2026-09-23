import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { esquemaModalOperacionInvestigacion } from "@maximilian/schemas/investigacion.schema";
import { servicioTablaMaestra } from "@maximilian/services/tabla-maestra.service";
import type { RegistroImportacionExportacionAnalista } from "@maximilian/shared/types/investigacion.type";
import { TablaMaestraId, type EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";
import {
  normalizarMontoDosDecimales,
} from "@maximilian/shared/utils/formato-monto.util";
import { traducirOpcionesTablaMaestra } from "@maximilian/shared/utils/tabla-maestra-idioma.util";

interface ParametrosUseModalOperacionInforme {
  registroInicial?: RegistroImportacionExportacionAnalista | null;
  idIdioma?: number;
  onGuardar: (registro: RegistroImportacionExportacionAnalista) => void;
}

function sanitizarEntero(valor: string) {
  return valor.replace(/\D/g, "");
}

export function useModalOperacionInforme({
  registroInicial,
  idIdioma,
  onGuardar,
}: ParametrosUseModalOperacionInforme) {
  const [anio, setAnio] = useState(registroInicial?.anio ?? "2025");
  const [idMesInicio, setIdMesInicio] = useState<number | undefined>(registroInicial?.idMesInicio);
  const [idMesFin, setIdMesFin] = useState<number | undefined>(
    registroInicial?.idMesFin ?? registroInicial?.idMesInicio,
  );
  const [idMoneda, setIdMoneda] = useState<number | undefined>(registroInicial?.idMoneda);
  const [monto, setMonto] = useState(registroInicial?.monto ?? "");
  const [paises, setPaises] = useState(registroInicial?.paises ?? "");
  const [productos, setProductos] = useState(registroInicial?.productos ?? "");
  const [operaciones, setOperaciones] = useState(registroInicial?.operaciones ?? "");

  const { data: opcionesMesesBase } = useQuery<EntradaTablaMaestra[]>({
    queryKey: ["masterTable", TablaMaestraId.MES],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.MES),
    staleTime: Infinity,
  });
  const { data: opcionesMonedaBase } = useQuery<EntradaTablaMaestra[]>({
    queryKey: ["masterTable", TablaMaestraId.MONEDA],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.MONEDA),
    staleTime: Infinity,
  });

  const opcionesMeses = useMemo(
    () => traducirOpcionesTablaMaestra(opcionesMesesBase, idIdioma),
    [idIdioma, opcionesMesesBase],
  );
  const opcionesMoneda = useMemo(
    () => traducirOpcionesTablaMaestra(opcionesMonedaBase, idIdioma),
    [idIdioma, opcionesMonedaBase],
  );
  const opcionesMesesOrdenadas = useMemo(
    () => [...(opcionesMeses ?? [])].sort((a, b) => (a.num1 ?? 0) - (b.num1 ?? 0)),
    [opcionesMeses],
  );
  const idMesInicioActual = idMesInicio
    ?? opcionesMesesOrdenadas.find((opcion) => opcion.string1 === registroInicial?.mes)?.num1
    ?? undefined;
  const idMesFinActual = idMesFin ?? idMesInicioActual;
  const mesInicioActual = opcionesMesesOrdenadas.find((opcion) => opcion.num1 === idMesInicioActual)?.string1
    ?? registroInicial?.mes
    ?? "";
  const mesFinActual = opcionesMesesOrdenadas.find((opcion) => opcion.num1 === idMesFinActual)?.string1
    ?? mesInicioActual;
  const monedaActual = opcionesMoneda?.find((opcion) => opcion.num1 === idMoneda)?.string1
    ?? registroInicial?.moneda
    ?? "";

  const manejarGuardar = () => {
    const resultado = esquemaModalOperacionInvestigacion.safeParse({
      idMesInicio: idMesInicioActual,
      idMesFin: idMesFinActual,
      idMoneda,
      anio: anio.trim(),
      mes: mesInicioActual.trim(),
      moneda: monedaActual.trim(),
      paises: paises.trim(),
      productos: productos.trim(),
      monto: normalizarMontoDosDecimales(monto),
      operaciones: sanitizarEntero(operaciones),
    });
    if (!resultado.success) return;

    onGuardar(resultado.data);
  };

  return {
    anio,
    setAnio,
    idMesInicioActual,
    setIdMesInicio,
    idMesFinActual,
    setIdMesFin,
    mesInicioActual,
    mesFinActual,
    idMoneda,
    setIdMoneda,
    monto,
    setMonto,
    paises,
    setPaises,
    productos,
    setProductos,
    operaciones,
    setOperaciones,
    opcionesMesesOrdenadas,
    opcionesMoneda,
    monedaActual,
    manejarGuardar,
    sanitizarEntero,
  };
}
