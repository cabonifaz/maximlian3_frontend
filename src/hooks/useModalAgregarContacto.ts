import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, type Resolver } from "react-hook-form";
import { esquemaContacto, type DatosFormularioContacto } from "@maximilian/schemas";
import { servicioTablaMaestra } from "@maximilian/services/tabla-maestra.service";
import {
  obtenerDescripcionTablaMaestra,
  obtenerSiguienteNumTablaMaestra,
  type EntradaTablaMaestra,
  type TablaMaestraCrearRequest,
  TablaMaestraId,
} from "@maximilian/shared/types/tabla-maestra.type";

const resolverContacto: Resolver<DatosFormularioContacto> = async (...args) => {
  const resultado = await zodResolver(esquemaContacto)(...args);
  const { tipoContacto, tipoContactoNuevo } = args[0];
  if (tipoContacto === 0 && !tipoContactoNuevo?.trim()) {
    resultado.errors = {
      ...resultado.errors,
      tipoContacto: { type: "custom", message: "El tipo de contacto es requerido" },
    };
  }
  return resultado;
};

interface ParametrosUseModalAgregarContacto {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: DatosFormularioContacto) => void;
  defaultValues?: DatosFormularioContacto;
}

export function useModalAgregarContacto({
  isOpen,
  onClose,
  onConfirm,
  defaultValues,
}: ParametrosUseModalAgregarContacto) {
  const formulario = useForm<DatosFormularioContacto>({
    resolver: resolverContacto,
    mode: "onTouched",
  });
  const {
    reset,
    watch,
    setValue,
  } = formulario;
  const queryClient = useQueryClient();

  const crearTipoContactoMutation = useMutation({
    mutationFn: async (termino: string) => {
      const terminoLimpio = termino.trim();
      const opcionesActuales = await queryClient.fetchQuery<EntradaTablaMaestra[]>({
        queryKey: ["masterTable", TablaMaestraId.TIPO_CONTACTO],
        queryFn: () => servicioTablaMaestra.list(TablaMaestraId.TIPO_CONTACTO),
        staleTime: 0,
      });
      const payload: TablaMaestraCrearRequest = {
        idMaestro: TablaMaestraId.TIPO_CONTACTO,
        descripcion: obtenerDescripcionTablaMaestra(TablaMaestraId.TIPO_CONTACTO),
        string1: terminoLimpio,
        num1: obtenerSiguienteNumTablaMaestra(opcionesActuales),
        num2: null,
        num3: null,
        string2: null,
        string3: null,
        date1: null,
        date2: null,
        date3: null,
      };

      await servicioTablaMaestra.crear(payload);
      await queryClient.invalidateQueries({ queryKey: ["masterTable", TablaMaestraId.TIPO_CONTACTO] });
      const opcionesActualizadas = await queryClient.fetchQuery({
        queryKey: ["masterTable", TablaMaestraId.TIPO_CONTACTO],
        queryFn: () => servicioTablaMaestra.list(TablaMaestraId.TIPO_CONTACTO),
        staleTime: 0,
      });

      const terminoNormalizado = terminoLimpio.toLowerCase();
      return opcionesActualizadas.find((opcion) => (opcion.string1 ?? "").trim().toLowerCase() === terminoNormalizado);
    },
  });

  useEffect(() => {
    reset(defaultValues ?? ({ enviarCorreo: false } as DatosFormularioContacto));
  }, [defaultValues, isOpen, reset]);

  const tipoPersona = watch("tipoPersona");
  const tipoContacto = watch("tipoContacto");
  const tipoContactoNuevo = watch("tipoContactoNuevo");
  const areaTrabajo = watch("areaTrabajo");

  const confirmar = (data: DatosFormularioContacto) => {
    onConfirm(data);
    reset();
    onClose();
  };

  const agregarTipoContacto = (termino: string) => {
    setValue("tipoContacto", 0, { shouldValidate: true });
    setValue("tipoContactoNuevo", termino, { shouldValidate: true });
    void crearTipoContactoMutation.mutateAsync(termino).then((opcion) => {
      if (!opcion?.num1) return;
      setValue("tipoContacto", opcion.num1, { shouldValidate: true });
      setValue("tipoContactoNuevo", undefined, { shouldValidate: true });
    });
  };

  const cambiarTipoContacto = (valor?: number) => {
    if (valor === undefined) return;
    setValue("tipoContacto", valor, { shouldValidate: true });
    if (valor !== 0) setValue("tipoContactoNuevo", undefined);
  };

  return {
    agregarTipoContacto,
    areaTrabajo,
    cambiarTipoContacto,
    confirmar,
    formulario,
    tipoContacto,
    tipoContactoNuevo,
    tipoPersona,
  };
}
