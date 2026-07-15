import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { valoresPorDefecto } from "@maximilian/shared/constants/components/administrador/modal-usuario.constants";
import { esquemaUsuario, type DatosFormularioUsuario } from "@maximilian/schemas";
import { servicioTablaMaestra } from "@maximilian/services/tabla-maestra.service";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";

type TabUsuario = "info" | "roles";

interface ParametrosUseModalUsuario {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (datosUsuario: DatosFormularioUsuario, reset: () => void) => void;
  modo: "crear" | "editar";
  datosIniciales?: DatosFormularioUsuario | null;
}

export function useModalUsuario({
  isOpen,
  onClose,
  onConfirm,
  modo,
  datosIniciales = null,
}: ParametrosUseModalUsuario) {
  const [tabActiva, setTabActiva] = useState<TabUsuario>("info");
  const esModoEdicion = modo === "editar";

  const formulario = useForm<DatosFormularioUsuario>({
    resolver: zodResolver(esquemaUsuario),
    defaultValues: valoresPorDefecto,
  });
  const {
    setValue,
    watch,
    formState: { errors },
    reset,
  } = formulario;

  useEffect(() => {
    if (!isOpen) return;
    setTabActiva("info");
    reset(esModoEdicion && datosIniciales ? datosIniciales : valoresPorDefecto);
  }, [datosIniciales, esModoEdicion, isOpen, reset]);

  const {
    data: rolesData,
    isLoading: isLoadingRoles,
    isError: isErrorRoles,
    refetch: refetchRoles,
  } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.ROLES],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.ROLES),
    enabled: isOpen,
    staleTime: Infinity,
    retry: 1,
  });

  const {
    data: idiomasData,
    isLoading: isLoadingLanguages,
    isError: isErrorLanguages,
    refetch: refetchLanguages,
  } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.IDIOMA],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.IDIOMA),
    enabled: isOpen,
    staleTime: Infinity,
    retry: 1,
  });

  const nombres = watch("nombres");
  const apellidoPaterno = watch("apellidoPaterno");
  const rolesSeleccionados = (watch("roles") || []) as (string | number)[];
  const idiomasSeleccionados = (watch("idiomas") || []) as (string | number)[];

  useEffect(() => {
    if (esModoEdicion) return;
    if (!nombres && !apellidoPaterno) {
      setValue("usuarioCreacion", "", { shouldValidate: true });
      return;
    }

    const primeraLetra = nombres?.charAt(0) ?? "";
    const apellido = apellidoPaterno?.replace(/\s+/g, "") ?? "";
    setValue("usuarioCreacion", `${primeraLetra}${apellido}`.toLowerCase(), {
      shouldValidate: true,
    });
  }, [esModoEdicion, nombres, apellidoPaterno, setValue]);

  const cerrar = () => {
    reset(valoresPorDefecto);
    setTabActiva("info");
    onClose();
  };

  const alternarSeleccion = (
    campo: "roles" | "idiomas",
    valor: string | number,
    valoresActuales: (string | number)[],
  ) => {
    const estaSeleccionado = valoresActuales.includes(valor);
    const nuevosValores = estaSeleccionado
      ? valoresActuales.filter((valorActual) => valorActual !== valor)
      : [...valoresActuales, valor];

    setValue(campo, nuevosValores, { shouldValidate: true });

    if (campo === "roles" && estaSeleccionado) {
      const rol = rolesData?.find((item) => item.num1 === valor);
      if (rol?.string1?.toUpperCase() === "TRADUCTOR") {
        setValue("idiomas", [], { shouldValidate: true });
      }
    }
  };

  const enviar = (datosUsuario: DatosFormularioUsuario) => {
    onConfirm(datosUsuario, () => reset(valoresPorDefecto));
  };

  const estaSeleccionadoTraductor = rolesSeleccionados.some((valorRol) => {
    const rol = rolesData?.find((item) => item.num1 === valorRol);
    return rol?.string1?.toUpperCase() === "TRADUCTOR";
  });

  const tieneErroresInfo = Boolean(
    errors.nombres ||
      errors.apellidoPaterno ||
      errors.apellidoMaterno ||
      errors.usuarioCreacion ||
      errors.correo ||
      errors.activo,
  );
  const tieneErroresRoles = Boolean(errors.roles || errors.idiomas);

  return {
    alternarSeleccion,
    cerrar,
    enviar,
    errores: errors,
    esModoEdicion,
    estaSeleccionadoTraductor,
    formulario,
    idiomasData,
    idiomasSeleccionados,
    isErrorLanguages,
    isErrorRoles,
    isLoadingLanguages,
    isLoadingRoles,
    refetchLanguages,
    refetchRoles,
    rolesData,
    rolesSeleccionados,
    setTabActiva,
    tabActiva,
    tieneErroresInfo,
    tieneErroresRoles,
  };
}
