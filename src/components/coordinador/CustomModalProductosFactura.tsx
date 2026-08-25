import { useState } from "react";
import { createPortal } from "react-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, PackagePlus, Plus, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { CustomModalConfirmacionAccion } from "@maximilian/components/common/CustomModalConfirmacionAccion";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
import { MultiCustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscableMultiple";
import { CustomSelectorMes } from "@maximilian/components/common/CustomSelectorMes";
import { useProductosFacturables } from "@maximilian/hooks/useProductosFacturables";
import {
  esquemaLineaAgrupadaFactura,
  type DatosFormularioLineaAgrupadaFactura,
} from "@maximilian/schemas";
import { ESTILOS_TIPO_PRODUCTO_FACTURABLE } from "@maximilian/shared/constants/components/coordinador/facturacion.constants";
import type { EntradaLineaAgrupadaFacturaApi } from "@maximilian/shared/types/facturacion.type";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import { formatearFechaIsoADdMmYyyy } from "@maximilian/shared/utils/fecha.util";
import { formatearMontoDosDecimales } from "@maximilian/shared/utils/formato-monto.util";

interface CustomModalProductosFacturaProps {
  abierto: boolean;
  idCliente: number;
  idDocumentoElectronico: number | null;
  onCerrar: () => void;
  onLineaCreada: (linea: EntradaLineaAgrupadaFacturaApi) => void;
}

export function CustomModalProductosFactura({
  abierto,
  idCliente,
  idDocumentoElectronico,
  onCerrar,
  onLineaCreada,
}: CustomModalProductosFacturaProps) {
  const {
    cambiarMes,
    cambiarMoneda,
    cambiarPais,
    cambiarTipoTramite,
    crearLinea,
    creandoLinea,
    estaCargando,
    filtrosCompletos,
    hayError,
    idMoneda,
    idsPais,
    idTipoTramite,
    mesSeleccionado,
    productos,
    recargar,
    reiniciarFiltros,
  } = useProductosFacturables(idCliente, idDocumentoElectronico, abierto);
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<DatosFormularioLineaAgrupadaFactura>({
    resolver: zodResolver(esquemaLineaAgrupadaFactura),
    mode: "onTouched",
    defaultValues: { codigo: "", descripcion: "" },
  });
  const [datosPendientes, setDatosPendientes] =
    useState<DatosFormularioLineaAgrupadaFactura | null>(null);

  const cerrar = () => {
    reset({ codigo: "", descripcion: "" });
    reiniciarFiltros();
    setDatosPendientes(null);
    onCerrar();
  };

  const solicitarConfirmacion = handleSubmit((datos) => {
    setDatosPendientes(datos);
  });

  const confirmarCreacionLinea = async () => {
    if (!datosPendientes) return;
    const linea = await crearLinea(datosPendientes);
    reset({ codigo: "", descripcion: "" });
    setDatosPendientes(null);
    onLineaCreada(linea);
  };

  if (!abierto) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl shadow-slate-950/25">
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-white to-brand-wine/5 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-wine/10 text-brand-wine">
              <PackagePlus size={17} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-brand-black">Pedidos a facturar</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Filtra los pedidos y agrégalos a la factura como una sola línea.
              </p>
            </div>
          </div>
          <CustomButton variant="ghost" size="icon" onClick={cerrar} aria-label="Cerrar pedidos">
            <X size={16} className="text-slate-400" />
          </CustomButton>
        </div>

        <div className="space-y-4 bg-slate-50/60 px-6 py-4">
          <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
            <CustomSelectorBuscable
              label="Tipo de trámite"
              required
              idMaster={TablaMaestraId.TIPO_TRAMITE}
              value={idTipoTramite}
              onChange={cambiarTipoTramite}
              onClear={() => cambiarTipoTramite(undefined)}
              obtenerEtiquetaOpcion={(opcion) => opcion.string2 ?? opcion.string1 ?? ""}
            />
            <CustomSelectorMes
              label="Mes"
              required
              value={mesSeleccionado}
              onChange={cambiarMes}
            />
            <MultiCustomSelectorBuscable
              label="País"
              optional
              idMaster={TablaMaestraId.PAIS}
              value={idsPais}
              onChange={cambiarPais}
              resumirSelecciones
            />
            <CustomSelectorBuscable
              label="Moneda"
              optional
              idMaster={TablaMaestraId.MONEDA_SUNAT}
              value={idMoneda}
              onChange={cambiarMoneda}
              onClear={() => cambiarMoneda(undefined)}
            />
          </div>

          <div className="max-h-[260px] max-w-full overflow-x-auto overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[900px] text-left text-xs">
              <thead className="sticky top-0 z-10 bg-slate-50 text-[10px] font-bold text-slate-500">
                <tr>
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">Investigado</th>
                  <th className="px-3 py-2">País</th>
                  <th className="px-3 py-2 text-center">Aplica penalidad</th>
                  <th className="px-3 py-2 text-center">Tipo</th>
                  <th className="px-3 py-2 text-center">Fecha</th>
                  <th className="px-3 py-2 text-center">Moneda</th>
                  <th className="px-3 py-2 text-right">Precio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {!filtrosCompletos ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-4 text-center text-sm italic text-slate-400">
                      Selecciona tipo de trámite y mes para buscar pedidos.
                    </td>
                  </tr>
                ) : estaCargando ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-4 text-center text-slate-400">
                      <Loader2 className="mx-auto animate-spin" size={20} />
                    </td>
                  </tr>
                ) : hayError ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-4 text-center">
                      <p className="mb-3 text-sm text-red-500">No se pudieron cargar los pedidos.</p>
                      <CustomButton type="button" variant="secondary" size="sm" onClick={() => void recargar()}>
                        Reintentar
                      </CustomButton>
                    </td>
                  </tr>
                ) : productos.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-4 text-center text-sm italic text-slate-400">
                      No hay pedidos disponibles para facturar.
                    </td>
                  </tr>
                ) : productos.map((producto) => {
                  const tipo = ESTILOS_TIPO_PRODUCTO_FACTURABLE[producto.tipo];

                  return (
                    <tr key={producto.idProductoFacturable} className="hover:bg-slate-50">
                      <td className="px-3 py-2 font-bold text-slate-700">{producto.codigo}</td>
                      <td className="px-3 py-2 text-slate-600">{producto.investigado}</td>
                      <td className="px-3 py-2 text-slate-600">{producto.pais}</td>
                      <td className="px-3 py-2 text-center text-slate-600">
                        {producto.aplicaPenalidad ? "Sí" : "No"}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${tipo.clase}`}>
                          {tipo.texto}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center text-slate-600">
                        {formatearFechaIsoADdMmYyyy(producto.fecha)}
                      </td>
                      <td className="px-3 py-2 text-center text-slate-600">{producto.moneda}</td>
                      <td className="px-3 py-2 text-right font-medium text-slate-700">
                        {formatearMontoDosDecimales(producto.precio)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:grid-cols-3">
            <div className="space-y-1.5">
              <CustomLabel htmlFor="linea-agrupada-codigo" optional>
                Código
              </CustomLabel>
              <input
                id="linea-agrupada-codigo"
                maxLength={30}
                {...register("codigo")}
                className={`w-full rounded-xl border bg-brand-white px-3 py-2 text-sm outline-none transition-all focus:border-brand-wine focus:ring-4 focus:ring-brand-wine/10 ${
                  errors.codigo ? "border-red-500" : "border-gray-200"
                }`}
              />
              {errors.codigo ? (
                <p className="text-xs font-medium text-red-500">{errors.codigo.message}</p>
              ) : null}
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <CustomLabel htmlFor="linea-agrupada-descripcion" required>
                Descripción
              </CustomLabel>
              <input
                id="linea-agrupada-descripcion"
                maxLength={500}
                {...register("descripcion")}
                className={`w-full rounded-xl border bg-brand-white px-3 py-2 text-sm outline-none transition-all focus:border-brand-wine focus:ring-4 focus:ring-brand-wine/10 ${
                  errors.descripcion ? "border-red-500" : "border-gray-200"
                }`}
              />
              {errors.descripcion ? (
                <p className="text-xs font-medium text-red-500">{errors.descripcion.message}</p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 bg-white px-6 py-3">
          <p className="text-xs font-medium text-slate-400">
            {productos.length} pedido{productos.length === 1 ? "" : "s"} en el filtro actual
          </p>
          <CustomButton
            type="button"
            variant="primary"
            size="compact"
            onClick={() => void solicitarConfirmacion()}
            disabled={productos.length === 0}
          >
            <Plus size={14} />
            Crear línea
          </CustomButton>
        </div>
      </div>

      <CustomModalConfirmacionAccion
        isOpen={datosPendientes !== null}
        onClose={() => setDatosPendientes(null)}
        onConfirm={() => void confirmarCreacionLinea()}
        title="Crear línea"
        descripcion="¿Deseas crear la línea agrupada con los pedidos filtrados? Esta acción no se puede deshacer."
        isSubmitting={creandoLinea}
        textoConfirmar="Crear línea"
        textoCargandoConfirmar="Creando..."
        varianteConfirmar="wine"
        zIndexClassName="z-[90]"
      >
        <p>
          <span className="font-bold">Código:</span> {datosPendientes?.codigo}
        </p>
        <p>
          <span className="font-bold">Descripción:</span> {datosPendientes?.descripcion}
        </p>
        <p>
          <span className="font-bold">Pedidos incluidos:</span> {productos.length}
        </p>
      </CustomModalConfirmacionAccion>
    </div>,
    document.body,
  );
}
