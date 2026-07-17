import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { servicioAutenticacion } from "@maximilian/services/autenticacion.service";
import { obtenerRutaPorRol } from "@maximilian/shared/utils/autenticacion-navegacion.util";

export function useGuardiaInvitado() {
  const navigate = useNavigate();
  const [estaVerificando, setEstaVerificando] = useState(true);

  useEffect(() => {
    const verificarAutenticacion = async () => {
      try {
        const sesion = await servicioAutenticacion.getSession();
        if (sesion.tokens?.accessToken) {
          navigate(obtenerRutaPorRol(sessionStorage.getItem("selected_role")), {
            replace: true,
          });
          return;
        }

        setEstaVerificando(false);
      } catch {
        setEstaVerificando(false);
      }
    };

    void verificarAutenticacion();
  }, [navigate]);

  return {
    estaVerificando,
  };
}
