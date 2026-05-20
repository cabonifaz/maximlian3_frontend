import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { servicioAutenticacion } from "@maximilian/services/autenticacion.service";
import PantallaCarga from "@maximilian/components/common/PantallaCarga";
import type { UserSession } from "@maximilian/shared/types/autenticacion.type";

interface PropsGuardiaRol {
  children: React.ReactNode;
  rolRequerido: string;
}

function obtenerSesionUsuario() {
  const sesionGuardada = sessionStorage.getItem("user_session");

  if (!sesionGuardada) {
    return null;
  }

  try {
    return JSON.parse(sesionGuardada) as UserSession;
  } catch {
    return null;
  }
}

export function GuardiaRol({ children, rolRequerido }: PropsGuardiaRol) {
  const navigate = useNavigate();
  const [estaVerificando, setEstaVerificando] = useState(true);
  const [tieneAcceso, setTieneAcceso] = useState(false);

  useEffect(() => {
    const verificarAcceso = async () => {
      try {
        const usuario = await servicioAutenticacion.getCurrentUser();
        if (!usuario) {
          navigate("/iniciar-sesion", { replace: true });
          return;
        }

        const sesionUsuario = obtenerSesionUsuario();
        const rolSeleccionado = sessionStorage.getItem("selected_role");

        if (!sesionUsuario || !rolSeleccionado) {
          navigate("/seleccionar-rol", { replace: true });
          return;
        }

        const rolRequeridoNormalizado = rolRequerido.toUpperCase();
        const rolSeleccionadoNormalizado = rolSeleccionado.toUpperCase();
        const usuarioTieneRol = sesionUsuario.roles.some(
          (rol) => rol.rol.toUpperCase() === rolSeleccionadoNormalizado,
        );

        if (!usuarioTieneRol) {
          sessionStorage.removeItem("selected_role");
          sessionStorage.removeItem("selected_role_id");
          navigate("/seleccionar-rol", { replace: true });
          return;
        }

        if (rolSeleccionadoNormalizado !== rolRequeridoNormalizado) {
          navigate("/seleccionar-rol", { replace: true });
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

    void verificarAcceso();
  }, [navigate, rolRequerido]);

  if (estaVerificando) {
    return <PantallaCarga />;
  }

  if (!tieneAcceso) {
    return null;
  }

  return <>{children}</>;
}
