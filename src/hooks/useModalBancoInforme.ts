import { useEffect, useState } from "react";
import type { BancoListaItem } from "@maximilian/shared/types/banco.type";
import type { RegistroBancoAnalista } from "@maximilian/shared/types/investigacion.type";

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
  const [idBanco, setIdBanco] = useState<number | undefined>(
    registroInicial?.idBanco,
  );
  const [idPais, setIdPais] = useState<number | undefined>(
    registroInicial?.idPais,
  );
  const [pais, setPais] = useState(registroInicial?.pais ?? "");
  const [banco, setBanco] = useState(registroInicial?.banco ?? "");
  const [telefono, setTelefono] = useState(registroInicial?.telefono ?? "");
  const [numeroCuenta, setNumeroCuenta] = useState(
    registroInicial?.numeroCuenta ?? "",
  );
  const [sectoristaJefeCuenta, setSectoristaJefeCuenta] = useState(
    registroInicial?.sectoristaJefeCuenta ?? "",
  );
  const [estaAbiertoModalBusqueda, setEstaAbiertoModalBusqueda] = useState(false);

  const manejarGuardar = () => {
    onGuardar({
      idInformeBanco: registroInicial?.idInformeBanco,
      idBanco,
      idPais,
      pais: pais.trim() || undefined,
      banco: banco.trim(),
      telefono: telefono.trim(),
      numeroCuenta: numeroCuenta.trim(),
      sectoristaJefeCuenta: sectoristaJefeCuenta.trim(),
    });
  };

  const seleccionarBanco = (resultado: BancoListaItem) => {
    setIdBanco(resultado.idBanco);
    setIdPais(resultado.idPais);
    setPais(resultado.pais);
    setBanco(resultado.nombre);
    setTelefono(resultado.telefono);
    setEstaAbiertoModalBusqueda(false);
  };

  return {
    banco,
    estaAbiertoModalBusqueda,
    manejarGuardar,
    numeroCuenta,
    pais,
    sectoristaJefeCuenta,
    seleccionarBanco,
    setBanco,
    setEstaAbiertoModalBusqueda,
    setNumeroCuenta,
    setSectoristaJefeCuenta,
    setTelefono,
    telefono,
  };
}

