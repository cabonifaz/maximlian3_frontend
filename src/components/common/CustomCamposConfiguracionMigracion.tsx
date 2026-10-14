import { Controller, type Control, type FieldErrors } from "react-hook-form";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
import { MAESTROS_CONFIGURACION_MIGRACION } from "@maximilian/shared/constants/components/common/migracion-informe.constants";
import type { DatosAltaMigracionInforme } from "@maximilian/schemas/informe-migracion.schema";
import type { RolMigracionInforme } from "@maximilian/shared/types/informe-migracion.type";
import { obtenerEtiquetaFormatoFechaInforme } from "@maximilian/shared/utils/formato-fecha-informe.util";

interface PropsCustomCamposConfiguracionMigracion {
  control: Control<DatosAltaMigracionInforme>;
  errores: FieldErrors<DatosAltaMigracionInforme>;
  rol: RolMigracionInforme;
}

export function CustomCamposConfiguracionMigracion({ control, errores, rol }: PropsCustomCamposConfiguracionMigracion) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Controller
        name="idPlantilla"
        control={control}
        render={({ field }) => (
          <CustomSelectorBuscable label="Plantilla" required idMaster={MAESTROS_CONFIGURACION_MIGRACION.plantilla} value={field.value} onChange={field.onChange} error={errores.idPlantilla?.message} />
        )}
      />
      <Controller
        name="idFormatoFecha"
        control={control}
        render={({ field }) => (
          <CustomSelectorBuscable label="Formato de fecha" required idMaster={MAESTROS_CONFIGURACION_MIGRACION.formatoFecha} value={field.value} onChange={field.onChange} error={errores.idFormatoFecha?.message} obtenerEtiquetaOpcion={obtenerEtiquetaFormatoFechaInforme} placeholder="Seleccione formato" />
        )}
      />
      <Controller
        name="idIdiomaOrigen"
        control={control}
        render={({ field }) => (
          <CustomSelectorBuscable label="Idioma de origen" required idMaster={MAESTROS_CONFIGURACION_MIGRACION.idioma} value={field.value} onChange={field.onChange} error={errores.idIdiomaOrigen?.message} />
        )}
      />
      {rol === "traductor" ? (
        <Controller
          name="idIdiomaDestino"
          control={control}
          render={({ field }) => (
            <CustomSelectorBuscable label="Idioma de destino" required idMaster={MAESTROS_CONFIGURACION_MIGRACION.idioma} value={field.value} onChange={field.onChange} error={errores.idIdiomaDestino?.message} />
          )}
        />
      ) : null}
    </div>
  );
}
