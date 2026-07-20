import { useState } from "react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  obtenerInicialesUsuario,
  obtenerRutaPorRol,
  obtenerSesionUsuarioGuardada,
} from "@maximilian/shared/utils/autenticacion-navegacion.util";
import { invalidarConsultasAntesDeCambiarRol } from "@maximilian/shared/utils/consultas-rol.util";
import { useCerrarSesion } from "./useCerrarSesion";

export function useEncabezado(rolInicial?: string) {
  const navigate = useNavigate();
  const clienteConsultas = useQueryClient();
  const { cerrarSesion, estaCerrandoSesion } = useCerrarSesion();
  const [estaAbiertoMenuRol, setEstaAbiertoMenuRol] = useState(false);
  const [estaCambiandoRol, setEstaCambiandoRol] = useState(false);
  const [sesionUsuario] = useState(obtenerSesionUsuarioGuardada);
  const [rolSeleccionado, setRolSeleccionado] = useState(
    () => sessionStorage.getItem("selected_role") || rolInicial || "",
  );

  const cambiarRol = async (nombreRol: string) => {
    if (nombreRol === rolSeleccionado) {
      setEstaAbiertoMenuRol(false);
      return;
    }

    setEstaCambiandoRol(true);
    setEstaAbiertoMenuRol(false);

    try {
      const rol = sesionUsuario?.roles.find(
        (rolUsuario) => rolUsuario.rol === nombreRol,
      );

      if (!rol) return;

      await invalidarConsultasAntesDeCambiarRol(clienteConsultas);

      sessionStorage.setItem("selected_role", rol.rol);
      sessionStorage.setItem("selected_role_id", rol.idRol.toString());
      setRolSeleccionado(nombreRol);
      navigate(obtenerRutaPorRol(nombreRol));
    } finally {
      setEstaCambiandoRol(false);
    }
  };

  const nombreUsuario = sesionUsuario?.nombres || "Usuario";

  return {
    cambiarRol,
    cerrarSesion,
    estaAbiertoMenuRol,
    estaCambiandoRol,
    estaCerrandoSesion,
    inicialesUsuario: obtenerInicialesUsuario(nombreUsuario),
    nombreUsuario,
    rolesDisponibles: sesionUsuario?.roles || [],
    rolSeleccionado,
    setEstaAbiertoMenuRol,
  };
}
