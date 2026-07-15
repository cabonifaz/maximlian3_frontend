import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { servicioAutenticacion } from "@maximilian/services/autenticacion.service";
import { limpiarSesionLocal } from "@maximilian/shared/utils/autenticacion-navegacion.util";

export function useGuardiaAutenticacion() {
  const navigate = useNavigate();
  const [estaVerificando, setEstaVerificando] = useState(true);
  const [tieneAcceso, setTieneAcceso] = useState(false);

  useEffect(() => {
    const verificarAutenticacion = async () => {
      try {
        const sesion = await servicioAutenticacion.getSession();
        if (!sesion.tokens?.accessToken) {
          navigate("/iniciar-sesion", { replace: true });
          return;
        }

        setTieneAcceso(true);
      } catch {
        limpiarSesionLocal();
        navigate("/iniciar-sesion", { replace: true });
        return;
      } finally {
        setEstaVerificando(false);
      }
    };

    void verificarAutenticacion();
  }, [navigate]);

  return {
    estaVerificando,
    tieneAcceso,
  };
}
