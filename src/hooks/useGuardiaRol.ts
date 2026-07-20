import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { servicioAutenticacion } from "@maximilian/services/autenticacion.service";
import { finalizarTransicionSolicitudesPorCambioRol } from "@maximilian/services/maximilian-service";
import {
  limpiarSesionLocal,
  obtenerSesionUsuarioGuardada,
} from "@maximilian/shared/utils/autenticacion-navegacion.util";

export function useGuardiaRol(rolRequerido: string) {
  const navigate = useNavigate();
  const [estaVerificando, setEstaVerificando] = useState(true);
  const [tieneAcceso, setTieneAcceso] = useState(false);

  useEffect(() => {
    const verificarAcceso = async () => {
      try {
        const sesion = await servicioAutenticacion.getSession();
        if (!sesion.tokens?.accessToken) {
          navigate("/iniciar-sesion", { replace: true });
          return;
        }

        const sesionUsuario = obtenerSesionUsuarioGuardada();
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
        limpiarSesionLocal();
        navigate("/iniciar-sesion", { replace: true });
        return;
      } finally {
        finalizarTransicionSolicitudesPorCambioRol();
        setEstaVerificando(false);
      }
    };

    void verificarAcceso();
  }, [navigate, rolRequerido]);

  return {
    estaVerificando,
    tieneAcceso,
  };
}
