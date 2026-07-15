import PantallaCarga from "@maximilian/components/common/PantallaCarga";
import { useGuardiaInvitado } from "@maximilian/hooks/useGuardiaInvitado";

interface GuardiaInvitadoProps {
  children: React.ReactNode;
}

export function GuardiaInvitado({ children }: GuardiaInvitadoProps) {
  const { estaVerificando } = useGuardiaInvitado();

  if (estaVerificando) {
    return <PantallaCarga />;
  }

  return <>{children}</>;
}
