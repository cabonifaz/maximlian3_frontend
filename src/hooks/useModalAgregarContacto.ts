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
  const { areaTrabajo, tipoContacto, tipoContactoNuevo } = args[0];
  if (tipoContacto === 0 && !tipoContactoNuevo?.trim()) {
    resultado.errors = {
      ...resultado.errors,
      tipoContacto: { type: "custom", message: "El tipo de contacto es requerido" },
    };
  }
  if (areaTrabajo === 0) {
    resultado.errors = {
      ...resultado.errors,
      areaTrabajo: { type: "custom", message: "Espere mientras se agrega el área de trabajo" },
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

  const crearOpcionTablaMaestra = async (termino: string, idMaestro: number) => {
    const terminoLimpio = termino.trim();
    const claveConsulta = ["masterTable", idMaestro];
    const opcionesActuales = await queryClient.fetchQuery<EntradaTablaMaestra[]>({
      queryKey: claveConsulta,
      queryFn: () => servicioTablaMaestra.list(idMaestro),
      staleTime: 0,
    });
    const payload: TablaMaestraCrearRequest = {
      idMaestro,
      descripcion: obtenerDescripcionTablaMaestra(idMaestro),
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
    await queryClient.invalidateQueries({ queryKey: claveConsulta });
    const opcionesActualizadas = await queryClient.fetchQuery<EntradaTablaMaestra[]>({
      queryKey: claveConsulta,
      queryFn: () => servicioTablaMaestra.list(idMaestro),
      staleTime: 0,
    });

    const terminoNormalizado = terminoLimpio.toLowerCase();
    return opcionesActualizadas.find(
      (opcion) => (opcion.string1 ?? "").trim().toLowerCase() === terminoNormalizado,
    );
  };

  const crearTipoContactoMutation = useMutation({
    mutationFn: (termino: string) => crearOpcionTablaMaestra(termino, TablaMaestraId.TIPO_CONTACTO),
  });

  const crearAreaTrabajoMutation = useMutation({
    mutationFn: (termino: string) => crearOpcionTablaMaestra(termino, TablaMaestraId.AREA_TRABAJO),
  });

  useEffect(() => {
    reset(defaultValues ?? ({ enviarCorreo: false } as DatosFormularioContacto));
  }, [defaultValues, isOpen, reset]);

  const tipoPersona = watch("tipoPersona");
  const tipoContacto = watch("tipoContacto");
  const tipoContactoNuevo = watch("tipoContactoNuevo");
  const areaTrabajo = watch("areaTrabajo");
  const areaTrabajoNuevo = watch("areaTrabajoNuevo");

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

  const agregarAreaTrabajo = (termino: string) => {
    setValue("areaTrabajo", 0, { shouldValidate: true });
    setValue("areaTrabajoNuevo", termino);
    void crearAreaTrabajoMutation.mutateAsync(termino).then((opcion) => {
      if (!opcion?.num1) return;
      setValue("areaTrabajo", opcion.num1, { shouldValidate: true });
      setValue("areaTrabajoNuevo", undefined);
    });
  };

  const cambiarAreaTrabajo = (valor: number) => {
    setValue("areaTrabajo", valor, { shouldValidate: true });
    setValue("areaTrabajoNuevo", undefined);
  };

  return {
    agregarAreaTrabajo,
    agregarTipoContacto,
    areaTrabajo,
    areaTrabajoNuevo,
    cambiarAreaTrabajo,
    cambiarTipoContacto,
    confirmar,
    formulario,
    tipoContacto,
    tipoContactoNuevo,
    tipoPersona,
  };
}
