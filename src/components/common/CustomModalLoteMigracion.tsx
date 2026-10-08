import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Upload, X } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
import { esquemaLoteMigracionInforme, type DatosLoteMigracionInforme } from "@maximilian/schemas/informe-migracion.schema";
import { CANTIDAD_MAXIMA_ARCHIVOS_LOTE_MIGRACION, MAESTROS_CONFIGURACION_MIGRACION } from "@maximilian/shared/constants/components/common/migracion-informe.constants";
import type { RolMigracionInforme } from "@maximilian/shared/types/informe-migracion.type";
import { obtenerEtiquetaFormatoFechaInforme } from "@maximilian/shared/utils/formato-fecha-informe.util";

interface PropsCustomModalLoteMigracion {
  abierto: boolean;
  cargando: boolean;
  rol: RolMigracionInforme;
  onCerrar: () => void;
  onCrear: (datos: DatosLoteMigracionInforme) => Promise<void>;
}

export function CustomModalLoteMigracion({ abierto, cargando, rol, onCerrar, onCrear }: PropsCustomModalLoteMigracion) {
  const { control, formState: { errors }, handleSubmit, register, reset, setError, setValue } = useForm<DatosLoteMigracionInforme>({
    resolver: zodResolver(esquemaLoteMigracionInforme),
    mode: "onTouched",
    defaultValues: { nombre: "", archivos: [] },
  });
  const archivos = useWatch({ control, name: "archivos" });

  if (!abierto) return null;

  const cerrar = () => {
    reset();
    onCerrar();
  };

  const enviar = async (datos: DatosLoteMigracionInforme) => {
    if (rol === "traductor" && !datos.idIdiomaDestino) {
      setError("idIdiomaDestino", { message: "El idioma de destino es requerido" });
      return;
    }
    await onCrear(datos);
    cerrar();
  };

  return (
    <div className="fixed inset-0 z-50 flex min-h-dvh items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div><h2 className="text-xl font-bold text-brand-black">Migrar documentos en lote</h2><p className="mt-1 text-sm text-gray-500">Hasta {CANTIDAD_MAXIMA_ARCHIVOS_LOTE_MIGRACION} documentos DOCX por lote.</p></div>
          <CustomButton variant="ghost" size="icon" onClick={cerrar}><X size={20} /></CustomButton>
        </div>
        <form onSubmit={handleSubmit(enviar)}>
          <div className="max-h-[70vh] space-y-6 overflow-y-auto p-6">
            <div><CustomLabel required>Nombre del lote</CustomLabel><input {...register("nombre")} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand-wine" placeholder="Ej. Informes históricos octubre" />{errors.nombre ? <p className="mt-1 text-xs text-red-500">{errors.nombre.message}</p> : null}</div>
            <div className="grid gap-5 md:grid-cols-2">
              <Controller name="idPlantilla" control={control} render={({ field }) => <CustomSelectorBuscable label="Plantilla" required idMaster={MAESTROS_CONFIGURACION_MIGRACION.plantilla} value={field.value} onChange={field.onChange} error={errors.idPlantilla?.message} />} />
              <Controller name="idFormatoFecha" control={control} render={({ field }) => <CustomSelectorBuscable label="Formato de fecha" required idMaster={MAESTROS_CONFIGURACION_MIGRACION.formatoFecha} value={field.value} onChange={field.onChange} error={errors.idFormatoFecha?.message} obtenerEtiquetaOpcion={obtenerEtiquetaFormatoFechaInforme} placeholder="Seleccione formato" />} />
              <Controller name="idIdiomaOrigen" control={control} render={({ field }) => <CustomSelectorBuscable label="Idioma de origen" required idMaster={MAESTROS_CONFIGURACION_MIGRACION.idioma} value={field.value} onChange={field.onChange} error={errors.idIdiomaOrigen?.message} />} />
              {rol === "traductor" ? <Controller name="idIdiomaDestino" control={control} render={({ field }) => <CustomSelectorBuscable label="Idioma de destino" required idMaster={MAESTROS_CONFIGURACION_MIGRACION.idioma} value={field.value} onChange={field.onChange} error={errors.idIdiomaDestino?.message} />} /> : null}
            </div>
            <div>
              <CustomLabel required>Documentos</CustomLabel>
              <label className="mt-2 flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-gray-200 px-6 py-8 text-center transition hover:border-brand-wine/40 hover:bg-brand-wine/5">
                <Upload className="text-brand-wine" size={28} /><span className="mt-3 text-sm font-semibold">Seleccione los documentos DOCX</span><span className="mt-1 text-xs text-gray-400">La carga comenzará después de validar la configuración.</span>
                <input type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" multiple className="hidden" onChange={(evento) => setValue("archivos", Array.from(evento.target.files ?? []), { shouldValidate: true, shouldDirty: true })} />
              </label>
              {errors.archivos ? <p className="mt-1 text-xs text-red-500">{errors.archivos.message}</p> : null}
              {archivos.length ? <div className="mt-3 max-h-36 space-y-2 overflow-y-auto">{archivos.map((archivo, indice) => <div key={`${archivo.name}-${archivo.size}`} className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2 text-sm"><FileText size={16} className="text-gray-400" /><span className="min-w-0 flex-1 truncate">{archivo.name}</span><button type="button" aria-label={`Quitar ${archivo.name}`} onClick={() => setValue("archivos", archivos.filter((_, posicion) => posicion !== indice), { shouldValidate: true, shouldDirty: true })}><X size={15} /></button></div>)}</div> : null}
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4"><CustomButton type="button" variant="secondary" onClick={cerrar}>Cancelar</CustomButton><CustomButton type="submit" loading={cargando} loadingText="Creando lote...">Crear lote</CustomButton></div>
        </form>
      </div>
    </div>
  );
}
