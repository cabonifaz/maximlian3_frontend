import { Controller } from "react-hook-form";
import { Info, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
import { useModalNuevoComplemento } from "@maximilian/hooks/useModalNuevoComplemento";
import { DESCRIPCION_NUEVO_COMPLEMENTO } from "@maximilian/shared/constants/pages/Traductor/informes-traductor.constants";
import type { InformeRepositorio } from "@maximilian/shared/types/flujo-informe.type";
import { formatearFechaHoraCorta } from "@maximilian/shared/utils/flujo-informe.util";

interface PropsCustomModalNuevoComplemento {
  informeReferencia: InformeRepositorio;
  onCerrar: () => void;
  onCreado: () => void | Promise<void>;
}

export function CustomModalNuevoComplemento({ informeReferencia, onCerrar, onCreado }: PropsCustomModalNuevoComplemento) {
  const {
    cerrar,
    consultaClientes,
    control,
    crearMutation,
    enviar,
    errores,
    estaCargandoUltimaVersion,
    habilitarClientes,
    mensajeErrorNegocio,
    opcionesCliente,
    opcionesIdioma,
    registrarObservacion,
    ultimaVersion,
  } = useModalNuevoComplemento({ informeReferencia, onCerrar, onCreado });

  return (
    <div className="fixed left-0 top-0 z-[70] flex h-[100dvh] w-[100dvw] items-center justify-center overflow-hidden bg-black/40 p-4 backdrop-blur-sm">
      <form onSubmit={enviar} className="flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-brand-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-5 sm:px-8 sm:py-6">
          <h2 className="text-lg font-bold text-brand-black sm:text-xl">Nuevo complemento</h2>
          <CustomButton type="button" variant="ghost" size="icon" onClick={cerrar} disabled={crearMutation.isPending}>
            <X size={20} className="text-gray-400" />
          </CustomButton>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-8 sm:py-6">
          <p className="flex items-start gap-2 rounded-xl bg-blue-50 px-4 py-3 text-xs text-blue-800">
            <Info size={14} className="mt-0.5 shrink-0" />
            {DESCRIPCION_NUEVO_COMPLEMENTO}
          </p>

          <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Se creará a partir de</p>
            {estaCargandoUltimaVersion ? (
              <p className="pt-1 text-slate-400">Buscando la última versión…</p>
            ) : ultimaVersion ? (
              <>
                <p className="pt-1 font-semibold">{ultimaVersion.investigado}</p>
                <p className="text-xs text-slate-500">
                  {ultimaVersion.tipo === "complemento" ? "Complemento" : "Informe"} #{ultimaVersion.idInforme}
                  {" · "}{ultimaVersion.cliente}{" · "}aprobado {formatearFechaHoraCorta(ultimaVersion.fechaAprobacion)}
                </p>
              </>
            ) : (
              <p className="pt-1 text-red-600">No se encontró una versión aprobada de esta compañía.</p>
            )}
          </div>

          <Controller
            control={control}
            name="idClienteDestino"
            render={({ field }) => (
              <CustomSelectorBuscable
                label="Cliente destino"
                required
                options={opcionesCliente}
                value={field.value || undefined}
                onChange={field.onChange}
                onBlur={field.onBlur}
                onOpen={habilitarClientes}
                loading={consultaClientes.isFetching}
                placeholder="Seleccione el cliente"
                error={errores.idClienteDestino?.message}
                dropdownZIndexClassName="z-[120]"
                overlayZIndexClassName="z-[110]"
              />
            )}
          />

          <Controller
            control={control}
            name="idIdioma"
            render={({ field }) => (
              <CustomSelectorBuscable
                label="Idioma del complemento"
                required
                options={opcionesIdioma}
                value={field.value || undefined}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="Seleccione el idioma"
                error={errores.idIdioma?.message}
                dropdownZIndexClassName="z-[120]"
                overlayZIndexClassName="z-[110]"
              />
            )}
          />

          <div className="space-y-1">
            <CustomLabel htmlFor="observacion-complemento" optional>Observación</CustomLabel>
            <textarea
              id="observacion-complemento"
              rows={3}
              {...registrarObservacion}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-wine focus:ring-4 focus:ring-brand-wine/10"
              placeholder="Motivo o alcance del complemento"
            />
            {errores.observacion?.message ? <p className="text-xs text-red-600">{errores.observacion.message}</p> : null}
          </div>

          {mensajeErrorNegocio ? <p className="text-xs text-red-600">{mensajeErrorNegocio}</p> : null}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-5 py-5 sm:flex-row sm:justify-end sm:px-8 sm:py-6">
          <CustomButton type="button" variant="secondary" size="compact" onClick={cerrar} disabled={crearMutation.isPending}>
            Cancelar
          </CustomButton>
          <CustomButton
            type="submit"
            variant="wine"
            size="compact"
            disabled={!ultimaVersion}
            loading={crearMutation.isPending}
            loadingText="Creando..."
          >
            Crear complemento
          </CustomButton>
        </div>
      </form>
    </div>
  );
}
