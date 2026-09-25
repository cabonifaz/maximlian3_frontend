import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import {
  esquemaModalBancoInvestigacion,
  type DatosModalBancoInvestigacion,
  type EntradaModalBancoInvestigacion,
} from "@maximilian/schemas/investigacion.schema";
import { servicioTablaMaestra } from "@maximilian/services/tabla-maestra.service";
import type { BancoListaItem } from "@maximilian/shared/types/banco.type";
import type { RegistroBancoAnalista } from "@maximilian/shared/types/investigacion.type";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import { traducirOpcionesTablaMaestra } from "@maximilian/shared/utils/tabla-maestra-idioma.util";

interface ParametrosUseModalBancoInforme {
  estaAbierto: boolean;
  idIdioma?: number;
  registroInicial?: RegistroBancoAnalista | null;
  onGuardar: (registro: RegistroBancoAnalista) => void;
}

export function useModalBancoInforme({
  estaAbierto,
  idIdioma,
  registroInicial,
  onGuardar,
}: ParametrosUseModalBancoInforme) {
  const [estaAbiertoModalBusqueda, cambiarEstaAbiertoModalBusqueda] =
    useState(false);
  const { data: opcionesSectorBase } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.SECTOR_ECONOMICO],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.SECTOR_ECONOMICO),
    staleTime: Infinity,
    enabled: estaAbierto,
  });
  const opcionesSector = useMemo(
    () => traducirOpcionesTablaMaestra(opcionesSectorBase, idIdioma),
    [idIdioma, opcionesSectorBase],
  );
  const {
    control,
    handleSubmit,
    reset,
    setValue,
  } = useForm<
    EntradaModalBancoInvestigacion,
    unknown,
    DatosModalBancoInvestigacion
  >({
    resolver: zodResolver(esquemaModalBancoInvestigacion),
    mode: "onTouched",
    defaultValues: {
      idInformeBanco: registroInicial?.idInformeBanco,
      idBanco: registroInicial?.idBanco,
      idPais: registroInicial?.idPais,
      idSector: registroInicial?.idSector,
      pais: registroInicial?.pais ?? "",
      banco: registroInicial?.banco ?? "",
      numeroCuenta: registroInicial?.numeroCuenta ?? "",
      sector: registroInicial?.sector ?? "",
      telefono: registroInicial?.telefono ?? "",
      sectoristaJefeCuenta: registroInicial?.sectoristaJefeCuenta ?? "",
    },
  });

  useEffect(() => {
    if (!estaAbierto) return;

    reset({
      idInformeBanco: registroInicial?.idInformeBanco,
      idBanco: registroInicial?.idBanco,
      idPais: registroInicial?.idPais,
      idSector: registroInicial?.idSector,
      pais: registroInicial?.pais ?? "",
      banco: registroInicial?.banco ?? "",
      numeroCuenta: registroInicial?.numeroCuenta ?? "",
      sector: registroInicial?.sector ?? "",
      telefono: registroInicial?.telefono ?? "",
      sectoristaJefeCuenta: registroInicial?.sectoristaJefeCuenta ?? "",
    });
  }, [estaAbierto, registroInicial, reset]);

  const valores = useWatch({ control });
  const banco = valores.banco ?? "";
  const idSector =
    typeof valores.idSector === "number" ? valores.idSector : undefined;
  const numeroCuenta = valores.numeroCuenta ?? "";
  const pais = valores.pais ?? "";
  const sector = valores.sector ?? "";
  const sectoristaJefeCuenta = valores.sectoristaJefeCuenta ?? "";
  const telefono = valores.telefono ?? "";

  const cambiarBanco = (valor: string) => {
    setValue("banco", valor, { shouldDirty: true, shouldValidate: true });
    setValue("idBanco", undefined, { shouldDirty: true });
    setValue("idPais", undefined, { shouldDirty: true });
    setValue("pais", "", { shouldDirty: true });
  };

  const seleccionarBanco = (resultado: BancoListaItem) => {
    setValue("idBanco", resultado.idBanco, { shouldDirty: true });
    setValue("idPais", resultado.idPais, { shouldDirty: true });
    setValue("pais", resultado.pais, { shouldDirty: true });
    setValue("banco", resultado.nombre, { shouldDirty: true, shouldValidate: true });
    setValue("telefono", resultado.telefono, { shouldDirty: true });
    cambiarEstaAbiertoModalBusqueda(false);
  };

  const seleccionarSector = (nuevoIdSector: number) => {
    const nuevoSector =
      opcionesSector?.find((opcion) => opcion.num1 === nuevoIdSector)?.string1 ??
      "";
    setValue("idSector", nuevoIdSector, { shouldDirty: true });
    setValue("sector", nuevoSector, { shouldDirty: true, shouldValidate: true });
  };

  const limpiarSector = () => {
    setValue("idSector", undefined, { shouldDirty: true });
    setValue("sector", "", { shouldDirty: true, shouldValidate: true });
  };

  const manejarGuardar = handleSubmit((datos) => onGuardar(datos));

  return {
    banco,
    cambiarBanco,
    cambiarEstaAbiertoModalBusqueda,
    estaAbiertoModalBusqueda,
    idSector,
    limpiarSector,
    manejarGuardar,
    numeroCuenta,
    opcionesSector,
    pais,
    sector,
    sectoristaJefeCuenta,
    seleccionarBanco,
    seleccionarSector,
    cambiarNumeroCuenta: (valor: string) =>
      setValue("numeroCuenta", valor, { shouldDirty: true, shouldValidate: true }),
    cambiarSectoristaJefeCuenta: (valor: string) =>
      setValue("sectoristaJefeCuenta", valor, {
        shouldDirty: true,
        shouldValidate: true,
      }),
    cambiarTelefono: (valor: string) =>
      setValue("telefono", valor, { shouldDirty: true, shouldValidate: true }),
    telefono,
  };
}

