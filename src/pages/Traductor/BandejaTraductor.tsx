import {
  CheckCircle2,
  CircleX,
  Clock3,
  Search,
  ClipboardList,
} from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomTabla } from "@maximilian/components/common/CustomTabla";
import { useBandejaInvestigacion } from "@maximilian/hooks/useBandejaInvestigacion";
import type {
  AccionBandejaAnalista,
  RegistroBandejaAnalista,
} from "@maximilian/shared/types/investigacion.type";

function obtenerIconoTarjeta(id: string) {
  if (id === "aprobado")
    return <CheckCircle2 size={18} className="text-green-500" />;
  if (id === "rechazado") return <CircleX size={18} className="text-red-500" />;
  if (id === "en-proceso")
    return <Clock3 size={18} className="text-blue-500" />;
  return <ClipboardList size={18} className="text-slate-500" />;
}

function obtenerEtiquetaAccion(accion: AccionBandejaAnalista) {
  if (accion === "iniciar") return "Iniciar Traducción";
  if (accion === "continuar") return "Continuar";
  return "Ver Detalles";
}

function esColorTransparente(color?: string) {
  const valor = color?.trim().toLowerCase();
  return (
    valor === "" ||
    valor === "transparent" ||
    valor === "#0000" ||
    valor === "#00000000" ||
    valor === "rgba(0,0,0,0)"
  );
}

function esColorBlanco(color?: string) {
  const valor = color?.trim().toLowerCase();
  return (
    valor === "#fff" ||
    valor === "#ffff" ||
    valor === "#ffffff" ||
    valor === "#ffffffff" ||
    valor === "white" ||
    valor === "rgb(255,255,255)"
  );
}

function obtenerEstiloEstado(
  estado: RegistroBandejaAnalista["estado"],
  colorLetra?: string,
  colorFondo?: string,
) {
  const estilosPorEstado: Record<
    RegistroBandejaAnalista["estado"],
    { color: string; backgroundColor: string }
  > = {
    asignado: { color: "#475569", backgroundColor: "#f1f5f9" },
    "en-proceso": { color: "#2563eb", backgroundColor: "#eff6ff" },
    "pendiente-aprobacion": { color: "#d97706", backgroundColor: "#fffbeb" },
    aprobado: { color: "#16a34a", backgroundColor: "#f0fdf4" },
    rechazado: { color: "#dc2626", backgroundColor: "#fef2f2" },
  };

  const estiloFallback = estilosPorEstado[estado];
  const color = colorLetra?.trim() || estiloFallback.color;
  const backgroundColor = colorFondo?.trim() || estiloFallback.backgroundColor;

  if (esColorTransparente(backgroundColor) && esColorBlanco(color)) {
    return estiloFallback;
  }

  return {
    color,
    backgroundColor: esColorTransparente(backgroundColor)
      ? estiloFallback.backgroundColor
      : backgroundColor,
  };
}

export default function BandejaTraductor() {
  const {
    terminoBusqueda,
    setTerminoBusqueda,
    paginaActual,
    setPaginaActual,
    respuestaAsignaciones,
    isLoading,
    isError,
    refetch,
    registrosFiltrados,
    tarjetasResumen,
    irADetalle,
  } = useBandejaInvestigacion({ tipo: "traductor" });

  const columnas = [
    { label: "ID Pedido", width: "10%" },
    { label: "Investigado", width: "31%" },
    { label: "País", width: "14%" },
    { label: "Fecha", width: "11%" },
    { label: "Tipo", className: "text-center", width: "8%" },
    { label: "Estado", className: "text-center", width: "12%" },
    { label: "Acción", className: "text-right", width: "14%" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-4">
        {tarjetasResumen.map((tarjeta) => (
          <article
            key={tarjeta.id}
            className="rounded-2xl border border-gray-100 bg-white px-6 py-5 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              {obtenerIconoTarjeta(tarjeta.id)}
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">
                {tarjeta.titulo}
              </span>
            </div>
            <p className="text-3xl font-bold text-brand-black">
              {tarjeta.valor}
            </p>
          </article>
        ))}
      </div>

      <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-black">
              Traducciones
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Gestión y control de las solicitudes de traducción asignadas.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <label className="relative min-w-[320px]">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
              />
              <input
                value={terminoBusqueda}
                onChange={(event) => setTerminoBusqueda(event.target.value)}
                placeholder="Buscar por ID o Investigado..."
                className="h-12 w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-4 text-sm text-slate-600 outline-none transition-all focus:border-brand-black focus:ring-2 focus:ring-brand-black/5"
              />
            </label>

          </div>
        </div>

        <CustomTabla
          columns={columnas}
          data={registrosFiltrados}
          getId={(registro) => registro.idPedido}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => void refetch()}
          paginaActual={paginaActual}
          totalPages={respuestaAsignaciones?.totalPaginas ?? 1}
          totalRecords={respuestaAsignaciones?.totalRegistros ?? 0}
          entityLabel="pedidos"
          onPageChange={setPaginaActual}
          emptyMessage="No se encontraron pedidos en la bandeja."
          renderRow={(registro) => (
            <>
              <td className="px-6 py-4 text-sm font-medium text-slate-400">
                {registro.idPedido}
              </td>
              <td className="max-w-48 px-6 py-4 text-sm font-semibold text-slate-700">
                <span className="block truncate" title={registro.investigado}>
                  {registro.investigado}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-slate-500">
                {registro.pais}
              </td>
              <td className="px-6 py-4 text-sm text-slate-500">
                {registro.fecha}
              </td>
              <td className="px-3 py-4 text-center text-sm text-slate-500">
                {registro.tipo}
              </td>
              <td className="px-6 py-4 text-center">
                <span
                  className="inline-flex rounded-lg px-3 py-2 text-[11px] font-bold uppercase tracking-wide"
                  style={obtenerEstiloEstado(
                    registro.estado,
                    registro.estadoColorLetra,
                    registro.estadoColorFondo,
                  )}
                >
                  {registro.estadoTexto || "-"}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-end">
                  <CustomButton
                    size="sm"
                    className="h-10 w-36 justify-center px-3 text-[11px] uppercase tracking-[0.12em]"
                    onClick={() => irADetalle(registro)}
                  >
                    {obtenerEtiquetaAccion(registro.accion)}
                  </CustomButton>
                </div>
              </td>
            </>
          )}
        />
      </section>
    </div>
  );
}
