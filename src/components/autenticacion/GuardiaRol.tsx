import PantallaCarga from "@maximilian/components/common/PantallaCarga";
import { useGuardiaRol } from "@maximilian/hooks/useGuardiaRol";

interface PropsGuardiaRol {
  children: React.ReactNode;
  rolRequerido: string;
}

export function GuardiaRol({ children, rolRequerido }: PropsGuardiaRol) {
  const { estaVerificando, tieneAcceso } = useGuardiaRol(rolRequerido);

  if (estaVerificando) {
    return <PantallaCarga />;
  }

  if (!tieneAcceso) {
    return null;
  }

  return <>{children}</>;
}
