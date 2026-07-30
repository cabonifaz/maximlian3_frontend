import PantallaCarga from "@maximilian/components/common/PantallaCarga";
import { useGuardiaAutenticacion } from "@maximilian/hooks/useGuardiaAutenticacion";

interface PropsGuardiaAutenticacion {
  children: React.ReactNode;
}

export function GuardiaAutenticacion({ children }: PropsGuardiaAutenticacion) {
  const { estaVerificando, tieneAcceso } = useGuardiaAutenticacion();

  if (estaVerificando) {
    return <PantallaCarga />;
  }

  if (!tieneAcceso) {
    return null;
  }

  return <>{children}</>;
}
