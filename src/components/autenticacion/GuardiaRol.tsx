import PantallaCarga from "@maximilian/components/common/PantallaCarga";
import { useGuardiaRol } from "@maximilian/hooks/useGuardiaRol";

interface PropsGuardiaRol {
  children: React.ReactNode;
  idRolRequerido?: number;
  rolRequerido: string;
}

export function GuardiaRol({
  children,
  idRolRequerido,
  rolRequerido,
}: PropsGuardiaRol) {
  const { estaVerificando, tieneAcceso } = useGuardiaRol(
    rolRequerido,
    idRolRequerido,
  );

  if (estaVerificando) {
    return <PantallaCarga />;
  }

  if (!tieneAcceso) {
    return null;
  }

  return <>{children}</>;
}
