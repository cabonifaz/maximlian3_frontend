import { useSyncExternalStore } from "react";
import { Save, TriangleAlert, Trash2 } from "lucide-react";
import {
  DESCRIPCION_MODAL_CAMBIOS_SIN_GUARDAR,
  TITULO_MODAL_CAMBIOS_SIN_GUARDAR,
} from "@maximilian/shared/constants/utils/proteccion-cambios.constants";
import {
  obtenerEstadoSolicitudCambios,
  responderSolicitudCambios,
  suscribirseSolicitudCambios,
} from "@maximilian/shared/utils/proteccion-cambios.util";
import { CustomButton } from "./CustomButton";

export function CustomModalCambiosSinGuardar() {
  const { estaAbierta, estaGuardando } = useSyncExternalStore(
    suscribirseSolicitudCambios,
    obtenerEstadoSolicitudCambios,
  );

  if (!estaAbierta) return null;

  return (
    <div
      className="fixed left-0 top-0 z-[200] flex h-[100dvh] w-[100dvw] items-center justify-center overflow-hidden bg-slate-900/45 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-cambios-sin-guardar"
    >
      <div className="w-full max-w-[26rem] overflow-hidden rounded-[28px] bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center px-8 pb-2 pt-9 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 ring-8 ring-amber-50/60">
            <TriangleAlert size={28} className="text-amber-500" />
          </span>
          <h2
            id="titulo-cambios-sin-guardar"
            className="mt-6 text-xl font-bold text-brand-black"
          >
            {TITULO_MODAL_CAMBIOS_SIN_GUARDAR}
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            {DESCRIPCION_MODAL_CAMBIOS_SIN_GUARDAR}
          </p>
        </div>

        <div className="flex flex-col gap-3 px-8 pb-8 pt-6">
          <CustomButton
            variant="primary"
            size="md"
            className="w-full justify-center"
            onClick={() => responderSolicitudCambios("guardar")}
            loading={estaGuardando}
            loadingText="Guardando..."
          >
            <Save size={16} />
            Guardar y salir
          </CustomButton>
          <div className="grid grid-cols-2 gap-3">
            <CustomButton
              variant="secondary"
              size="md"
              className="w-full justify-center"
              onClick={() => responderSolicitudCambios("cancelar")}
              disabled={estaGuardando}
            >
              Seguir editando
            </CustomButton>
            <CustomButton
              variant="danger"
              size="md"
              className="w-full justify-center"
              onClick={() => responderSolicitudCambios("descartar")}
              disabled={estaGuardando}
            >
              <Trash2 size={16} />
              Descartar
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
}
