import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { esquemaTarifa, type DatosFormularioTarifa } from "@maximilian/schemas";

interface ParametrosUseModalAgregarTarifa {
  estaAbierto: boolean;
  valoresIniciales?: DatosFormularioTarifa;
  onCerrar: () => void;
  onConfirmar: (datos: DatosFormularioTarifa) => void;
}

export function useModalAgregarTarifa({
  estaAbierto,
  valoresIniciales,
  onCerrar,
  onConfirmar,
}: ParametrosUseModalAgregarTarifa) {
  const formulario = useForm<DatosFormularioTarifa>({
    resolver: zodResolver(esquemaTarifa),
    mode: "onTouched",
  });

  const {
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
    trigger,
    watch,
  } = formulario;

  useEffect(() => {
    reset(valoresIniciales ?? ({} as DatosFormularioTarifa));
  }, [valoresIniciales, estaAbierto, reset]);

  const confirmar = (datos: DatosFormularioTarifa) => {
    onConfirmar(datos);
    reset();
    onCerrar();
  };

  return {
    confirmarSubmit: handleSubmit(confirmar),
    errors,
    register: formulario.register,
    setValue,
    trigger,
    valores: {
      moneda: watch("moneda"),
      pais: watch("pais"),
      producto: watch("producto"),
      tramite: watch("tramite"),
    },
  };
}
