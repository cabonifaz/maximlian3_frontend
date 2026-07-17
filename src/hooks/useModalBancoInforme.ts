import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  const { data: opcionesSectorBase } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.SECTOR_ECONOMICO],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.SECTOR_ECONOMICO),
    enabled: estaAbierto,
    staleTime: Infinity,
  });

  const opcionesSector = useMemo(
    () => traducirOpcionesTablaMaestra(opcionesSectorBase, idIdioma),
    [idIdioma, opcionesSectorBase],
  );

  const [idBanco, setIdBanco] = useState<number | undefined>(
    registroInicial?.idBanco,
  );
  const [idPais, setIdPais] = useState<number | undefined>(
    registroInicial?.idPais,
  );
  const [pais, setPais] = useState(registroInicial?.pais ?? "");
  const [banco, setBanco] = useState(registroInicial?.banco ?? "");
  const [idSectorSeleccionado, setIdSectorSeleccionado] = useState<
    number | undefined
  >(undefined);
  const [sector, setSector] = useState(registroInicial?.sector ?? "");
  const [telefono, setTelefono] = useState(registroInicial?.telefono ?? "");
  const [numeroCuenta, setNumeroCuenta] = useState(
    registroInicial?.numeroCuenta ?? "",
  );
  const [sectoristaJefeCuenta, setSectoristaJefeCuenta] = useState(
    registroInicial?.sectoristaJefeCuenta ?? "",
  );
  const [estaAbiertoModalBusqueda, setEstaAbiertoModalBusqueda] = useState(false);

  useEffect(() => {
    if (!estaAbierto) return;

    setIdBanco(registroInicial?.idBanco);
    setIdPais(registroInicial?.idPais);
    setPais(registroInicial?.pais ?? "");
    setBanco(registroInicial?.banco ?? "");
    setSector(registroInicial?.sector ?? "");
    setTelefono(registroInicial?.telefono ?? "");
    setNumeroCuenta(registroInicial?.numeroCuenta ?? "");
    setSectoristaJefeCuenta(registroInicial?.sectoristaJefeCuenta ?? "");
  }, [estaAbierto, registroInicial]);

  useEffect(() => {
    if (!estaAbierto || !opcionesSector) return;

    const opcionSector = registroInicial?.idSector
      ? opcionesSector.find((opcion) => opcion.num1 === registroInicial.idSector)
      : opcionesSector.find(
          (opcion) => opcion.string1 === (registroInicial?.sector ?? ""),
        );
    setIdSectorSeleccionado(opcionSector?.num1 ?? undefined);
  }, [
    estaAbierto,
    opcionesSector,
    registroInicial?.idSector,
    registroInicial?.sector,
  ]);

  const manejarCambioSector = (valor?: number) => {
    setIdSectorSeleccionado(valor);
    setSector(opcionesSector?.find((opcion) => opcion.num1 === valor)?.string1 ?? "");
  };

  const limpiarSector = () => {
    setIdSectorSeleccionado(undefined);
    setSector("");
  };

  const manejarGuardar = () => {
    const sectorSeleccionado =
      opcionesSector?.find((opcion) => opcion.num1 === idSectorSeleccionado)
        ?.string1 ?? sector;

    onGuardar({
      idInformeBanco: registroInicial?.idInformeBanco,
      idBanco,
      idPais,
      pais: pais.trim() || undefined,
      banco: banco.trim(),
      sector: sectorSeleccionado.trim(),
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
    idSectorSeleccionado,
    limpiarSector,
    manejarCambioSector,
    manejarGuardar,
    numeroCuenta,
    opcionesSector,
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
