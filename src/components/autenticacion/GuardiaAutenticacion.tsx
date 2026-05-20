import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { servicioAutenticacion } from "@maximilian/services/autenticacion.service";
import PantallaCarga from "@maximilian/components/common/PantallaCarga";

interface PropsGuardiaAutenticacion {
  children: React.ReactNode;
}

export function GuardiaAutenticacion({ children }: PropsGuardiaAutenticacion) {
  const navigate = useNavigate();
  const [estaVerificando, setEstaVerificando] = useState(true);
  const [tieneAcceso, setTieneAcceso] = useState(false);

  useEffect(() => {
    const verificarAutenticacion = async () => {
      try {
        const usuario = await servicioAutenticacion.getCurrentUser();
        if (!usuario) {
          navigate("/iniciar-sesion", { replace: true });
          return;
        }

        setTieneAcceso(true);
      } catch {
        sessionStorage.removeItem("selected_role");
        sessionStorage.removeItem("selected_role_id");
        sessionStorage.removeItem("user_session");
        navigate("/iniciar-sesion", { replace: true });
        return;
      } finally {
        setEstaVerificando(false);
      }
    };

    void verificarAutenticacion();
  }, [navigate]);

  if (estaVerificando) {
    return <PantallaCarga />;
  }

  if (!tieneAcceso) {
    return null;
  }

  return <>{children}</>;
}
