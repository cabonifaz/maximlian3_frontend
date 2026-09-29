import { CheckCheck, ListChecks, ListFilter, ListMinus, ListPlus } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { FUNCIONALIDADES_HABILITADAS } from "@maximilian/shared/constants/funcionalidades.constants";
import type { useAccionesAprobacionMigraciones } from "@maximilian/hooks/useAccionesAprobacionMigraciones";

interface PropsCustomAccionesBandejaAprobacionMigraciones {
  acciones: ReturnType<typeof useAccionesAprobacionMigraciones>;
  soloMuestra: boolean;
  totalMuestra?: number;
  onAlternarSoloMuestra: () => void;
}

export function CustomAccionesBandejaAprobacionMigraciones({
  acciones,
  soloMuestra,
  totalMuestra,
  onAlternarSoloMuestra,
}: PropsCustomAccionesBandejaAprobacionMigraciones) {
  const { cantidadSeleccionados } = acciones;
  const muestraHabilitada = FUNCIONALIDADES_HABILITADAS.muestraAprobacionMigraciones;

  return (
    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
      {muestraHabilitada ? (
        <>
          <CustomButton
            variant="secondary"
            size="sm"
            aria-pressed={soloMuestra}
            onClick={onAlternarSoloMuestra}
            className={soloMuestra ? "border-brand-black bg-brand-black text-brand-white hover:bg-brand-black" : undefined}
          >
            <ListFilter size={16} />
            Solo muestra
            {totalMuestra !== undefined ? ` (${totalMuestra})` : ""}
          </CustomButton>

          {acciones.cantidadParaQuitarMuestra > 0 ? (
            <CustomButton
              variant="secondary"
              size="sm"
              loading={acciones.estaQuitandoMuestra}
              loadingText="Quitando..."
              onClick={acciones.quitarMuestra}
            >
              <ListMinus size={16} />
              Quitar de la muestra ({acciones.cantidadParaQuitarMuestra})
            </CustomButton>
          ) : null}

          <CustomButton
            variant="secondary"
            size="sm"
            disabled={acciones.cantidadParaAgregarMuestra === 0}
            loading={acciones.estaAgregandoMuestra}
            loadingText="Agregando..."
            onClick={acciones.agregarMuestra}
          >
            <ListPlus size={16} />
            Agregar a la muestra
            {acciones.cantidadParaAgregarMuestra > 0 ? ` (${acciones.cantidadParaAgregarMuestra})` : ""}
          </CustomButton>
        </>
      ) : null}

      <CustomButton
        variant="wine"
        size="sm"
        disabled={cantidadSeleccionados === 0}
        onClick={() => acciones.abrirModal("aprobar-seleccionados")}
      >
        <ListChecks size={16} />
        Aprobar seleccionados
        {cantidadSeleccionados > 0 ? ` (${cantidadSeleccionados})` : ""}
      </CustomButton>

      {muestraHabilitada ? (
        <CustomButton
          variant="primary"
          size="sm"
          disabled={!acciones.puedeAprobarTodos}
          title={soloMuestra ? "Desactiva el filtro Solo muestra para aprobar todo." : undefined}
          onClick={() => acciones.abrirModal("aprobar-todos")}
        >
          <CheckCheck size={16} />
          Aprobar todo
        </CustomButton>
      ) : null}
    </div>
  );
}
