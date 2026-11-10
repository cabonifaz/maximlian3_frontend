import { Outlet } from "react-router";
import { useRecargaConsultasAlCambiarModulo } from "@maximilian/hooks/useRecargaConsultasAlCambiarModulo";

export function CustomRaizRutas() {
  useRecargaConsultasAlCambiarModulo();
  return <Outlet />;
}
