import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { servicioAutenticacion } from "@maximilian/services/autenticacion.service";
import PantallaCarga from "@maximilian/components/common/PantallaCarga";

interface GuardiaInvitadoProps {
  children: React.ReactNode;
}

export function GuardiaInvitado({ children }: GuardiaInvitadoProps) {
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerRutaRolSeleccionado = () => {
      const rolSeleccionado = sessionStorage.getItem("selected_role");
      const rolNormalizado = rolSeleccionado?.toUpperCase();

      if (rolNormalizado === "ADMINISTRADOR") return "/administrador";
      if (rolNormalizado === "ANALISTA") return "/analista";
      if (rolNormalizado === "TRADUCTOR") return "/traductor";
      if (rolNormalizado === "COORDINADOR") return "/coordinador";

      return "/seleccionar-rol";
    };

    const checkAuth = async () => {
      try {
        const user = await servicioAutenticacion.getCurrentUser();
        if (user) {
          navigate(obtenerRutaRolSeleccionado(), { replace: true });
          return;
        }
      } catch {
        // Not authenticated, allow access to guest pages
        setIsChecking(false);
      }
    };

    void checkAuth();
  }, [navigate]);

  if (isChecking) {
    return <PantallaCarga />;
  }

  return <>{children}</>;
}
