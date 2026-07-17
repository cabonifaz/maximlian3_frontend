import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { servicioAutenticacion } from "@maximilian/services/autenticacion.service";
import type { Role } from "@maximilian/shared/types/autenticacion.type";
import { obtenerRutaPorRol } from "@maximilian/shared/utils/autenticacion-navegacion.util";
import { useCerrarSesion } from "./useCerrarSesion";

export function useSeleccionRol() {
  const navigate = useNavigate();
  const { cerrarSesion, estaCerrandoSesion } = useCerrarSesion();

  const {
    data: datosUsuario,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["userRoles"],
    queryFn: () => servicioAutenticacion.getUserRoles(),
    retry: 1,
  });

  const seleccionarRol = (rol: Role) => {
    sessionStorage.setItem("selected_role", rol.rol);
    sessionStorage.setItem("selected_role_id", rol.idRol.toString());
    sessionStorage.setItem("user_session", JSON.stringify(datosUsuario));

    navigate(obtenerRutaPorRol(rol.rol));
  };

  return {
    cerrarSesion,
    datosUsuario,
    error,
    estaCerrandoSesion,
    isError,
    isLoading,
    seleccionarRol,
  };
}
