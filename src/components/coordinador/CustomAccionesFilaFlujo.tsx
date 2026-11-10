import { CheckCircle2, CheckSquare, FlaskConical, UserPlus } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import type { FilaFlujoAsignacion, RolFlujoAsignacion } from "@maximilian/shared/types/flujo-informe.type";

interface PropsCustomAccionesFilaFlujo {
  pedido: FilaFlujoAsignacion;
  usaDatosSimulados: boolean;
  accionSimuladaPendiente: boolean;
  onAsignar: (pedido: FilaFlujoAsignacion, rol: RolFlujoAsignacion) => void;
  onRevisar: (pedido: FilaFlujoAsignacion) => void;
  onSimularFinalizacion: (idPedido: number) => void;
  onSimularEnvioTraductor: (idPedido: number) => void;
  onSimularRechazo: (idPedido: number) => void;
}

function CustomBotonSimulacion({ texto, deshabilitado, onClick }: { texto: string; deshabilitado: boolean; onClick: () => void }) {
  return (
    <CustomButton variant="secondary" size="sm" onClick={onClick} disabled={deshabilitado} title="Acción de demostración con datos simulados">
      <FlaskConical size={14} />
      {texto}
    </CustomButton>
  );
}

export function CustomAccionesFilaFlujo({
  pedido,
  usaDatosSimulados,
  accionSimuladaPendiente,
  onAsignar,
  onRevisar,
  onSimularFinalizacion,
  onSimularEnvioTraductor,
  onSimularRechazo,
}: PropsCustomAccionesFilaFlujo) {
  const acciones = {
    "sin-asignar": (
      <CustomButton variant="wine" size="sm" onClick={() => onAsignar(pedido, "analista")}>
        <UserPlus size={14} />
        Asignar analista
      </CustomButton>
    ),
    "en-analisis": (
      <>
        <CustomButton variant="secondary" size="sm" onClick={() => onAsignar(pedido, "analista")}>
          Reasignar analista
        </CustomButton>
        {usaDatosSimulados ? (
          <CustomBotonSimulacion
            texto="Simular fin de análisis"
            deshabilitado={accionSimuladaPendiente}
            onClick={() => onSimularFinalizacion(pedido.idPedido)}
          />
        ) : null}
      </>
    ),
    "listo-traduccion": (
      <CustomButton variant="wine" size="sm" onClick={() => onAsignar(pedido, "traductor")}>
        <UserPlus size={14} />
        Asignar traductor
      </CustomButton>
    ),
    "en-traduccion": (
      <>
        <CustomButton variant="secondary" size="sm" onClick={() => onAsignar(pedido, "traductor")}>
          Reasignar traductor
        </CustomButton>
        {usaDatosSimulados ? (
          <CustomBotonSimulacion
            texto="Simular envío"
            deshabilitado={accionSimuladaPendiente}
            onClick={() => onSimularEnvioTraductor(pedido.idPedido)}
          />
        ) : null}
      </>
    ),
    "por-revisar": (
      <>
        <CustomButton variant="wine" size="sm" onClick={() => onRevisar(pedido)}>
          <CheckSquare size={14} />
          Revisar
        </CustomButton>
        {usaDatosSimulados ? (
          <CustomBotonSimulacion
            texto="Simular rechazo"
            deshabilitado={accionSimuladaPendiente}
            onClick={() => onSimularRechazo(pedido.idPedido)}
          />
        ) : null}
      </>
    ),
    finalizado: (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
        <CheckCircle2 size={14} />
        Aprobado
      </span>
    ),
  } satisfies Record<FilaFlujoAsignacion["etapa"], React.ReactNode>;

  return <div className="flex flex-wrap justify-end gap-2">{acciones[pedido.etapa]}</div>;
}
