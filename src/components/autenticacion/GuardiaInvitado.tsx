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
    const checkAuth = async () => {
      try {
        const user = await servicioAutenticacion.getCurrentUser();
        if (user) {
          // Si el usuario ya está autenticado, regresa o usa la ruta protegida por defecto.
          if (window.history.length > 1) {
            navigate(-1);
          } else {
            navigate("/seleccionar-rol", { replace: true });
          }
        }
      } catch {
        // Not authenticated, allow access to guest pages
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (isChecking) {
    return <PantallaCarga />;
  }

  return <>{children}</>;
}
