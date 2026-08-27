import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { esquemaTarifa, type DatosFormularioTarifa } from "@maximilian/schemas";

const resolverTarifa: Resolver<DatosFormularioTarifa> = async (...argumentos) => {
  const resultado = await zodResolver(esquemaTarifa)(...argumentos);
  const { diasMax, diasMin, penalidad, precio } = argumentos[0];

  if (
    typeof diasMax === "number"
    && Number.isFinite(diasMax)
    && typeof diasMin === "number"
    && Number.isFinite(diasMin)
    && diasMax <= diasMin
  ) {
    resultado.errors = {
      ...resultado.errors,
      diasMax: {
        type: "custom",
        message: "Días mínimos debe ser menor a días máximos",
      },
    };
  }

  if (
    typeof penalidad === "number"
    && Number.isFinite(penalidad)
    && typeof precio === "number"
    && Number.isFinite(precio)
    && penalidad > precio
  ) {
    resultado.errors = {
      ...resultado.errors,
      penalidad: {
        type: "custom",
        message: "La penalidad no debe superar al precio",
      },
    };
  }

  return resultado;
};

interface ParametrosUseModalAgregarTarifa {
  estaAbierto: boolean;
  valoresIniciales?: Partial<DatosFormularioTarifa>;
  onCerrar: () => void;
  onConfirmar: (datos: DatosFormularioTarifa) => boolean | void;
}

export function useModalAgregarTarifa({
  estaAbierto,
  valoresIniciales,
  onCerrar,
  onConfirmar,
}: ParametrosUseModalAgregarTarifa) {
  const formulario = useForm<DatosFormularioTarifa>({
    resolver: resolverTarifa,
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
    const debeCerrar = onConfirmar(datos);
    if (debeCerrar === false) return;
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
