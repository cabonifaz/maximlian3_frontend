import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import {
  esquemaModalBancoInvestigacion,
  type DatosModalBancoInvestigacion,
  type EntradaModalBancoInvestigacion,
} from "@maximilian/schemas/investigacion.schema";
import type { BancoListaItem } from "@maximilian/shared/types/banco.type";
import type { RegistroBancoAnalista } from "@maximilian/shared/types/investigacion.type";

interface ParametrosUseModalBancoInforme {
  estaAbierto: boolean;
  registroInicial?: RegistroBancoAnalista | null;
  onGuardar: (registro: RegistroBancoAnalista) => void;
}

export function useModalBancoInforme({
  estaAbierto,
  registroInicial,
  onGuardar,
}: ParametrosUseModalBancoInforme) {
  const [estaAbiertoModalBusqueda, cambiarEstaAbiertoModalBusqueda] =
    useState(false);
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
      pais: registroInicial?.pais ?? "",
      banco: registroInicial?.banco ?? "",
      numeroCuenta: registroInicial?.numeroCuenta ?? "",
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
      pais: registroInicial?.pais ?? "",
      banco: registroInicial?.banco ?? "",
      numeroCuenta: registroInicial?.numeroCuenta ?? "",
      telefono: registroInicial?.telefono ?? "",
      sectoristaJefeCuenta: registroInicial?.sectoristaJefeCuenta ?? "",
    });
  }, [estaAbierto, registroInicial, reset]);

  const valores = useWatch({ control });
  const banco = valores.banco ?? "";
  const numeroCuenta = valores.numeroCuenta ?? "";
  const pais = valores.pais ?? "";
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

  const manejarGuardar = handleSubmit((datos) => onGuardar(datos));

  return {
    banco,
    cambiarBanco,
    cambiarEstaAbiertoModalBusqueda,
    estaAbiertoModalBusqueda,
    manejarGuardar,
    numeroCuenta,
    pais,
    sectoristaJefeCuenta,
    seleccionarBanco,
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

