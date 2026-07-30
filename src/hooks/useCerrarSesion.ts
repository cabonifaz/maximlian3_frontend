import { useState } from "react";
import { useNavigate } from "react-router";
import { servicioAutenticacion } from "@maximilian/services/autenticacion.service";

export function useCerrarSesion() {
  const navigate = useNavigate();
  const [estaCerrandoSesion, setEstaCerrandoSesion] = useState(false);

  const cerrarSesion = async () => {
    setEstaCerrandoSesion(true);
    try {
      await servicioAutenticacion.logout();
      await new Promise((resolve) => setTimeout(resolve, 800));
      navigate("/iniciar-sesion");
    } catch (error) {
      console.error("Error al cerrar sesion", error);
      setEstaCerrandoSesion(false);
    }
  };

  return {
    cerrarSesion,
    estaCerrandoSesion,
  };
}
