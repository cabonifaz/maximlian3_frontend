import { FlaskConical, Search } from "lucide-react";
import { CustomTablaRepositorioInformes } from "@maximilian/components/traductor/CustomTablaRepositorioInformes";
import { CustomTablaMisComplementos } from "@maximilian/components/traductor/CustomTablaMisComplementos";
import { CustomModalNuevoComplemento } from "@maximilian/components/traductor/CustomModalNuevoComplemento";
import { useInformesTraductor } from "@maximilian/hooks/useInformesTraductor";
import { AVISO_DATOS_SIMULADOS } from "@maximilian/shared/constants/pages/Coordinador/flujo-asignaciones.constants";
import {
  DESCRIPCION_REPOSITORIO_INFORMES,
  OPCIONES_TIPO_REPOSITORIO,
  TABS_INFORMES_TRADUCTOR,
} from "@maximilian/shared/constants/pages/Traductor/informes-traductor.constants";

export default function InformesTraductor() {
  const {
    abrirNuevoComplemento,
    cambiarBusqueda,
    cambiarPaginaInformes,
    cambiarTab,
    cambiarTipoFiltro,
    cerrarNuevoComplemento,
    complementoCreado,
    consultaMisComplementos,
    consultaRepositorio,
    enviarAprobacionMutation,
    informeBaseComplemento,
    paginaActual,
    tabActiva,
    terminoBusqueda,
    tipoFiltro,
    usaDatosSimulados,
  } = useInformesTraductor();

  return (
    <div className="space-y-6">
      {usaDatosSimulados ? (
        <p className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          <FlaskConical size={14} className="shrink-0" />
          {AVISO_DATOS_SIMULADOS}
        </p>
      ) : null}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">Informes</h1>
          <p className="text-sm text-slate-500">{DESCRIPCION_REPOSITORIO_INFORMES}</p>
        </div>
        <div className="relative md:w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por investigado, cliente o país"
            value={terminoBusqueda}
            onChange={(evento) => cambiarBusqueda(evento.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-brand-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-brand-wine focus:ring-4 focus:ring-brand-wine/10"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:shadow-[inset_0_-1px_0_0_var(--color-gray-200)]">
        <div className="flex gap-1 overflow-x-auto overflow-y-hidden shadow-[inset_0_-1px_0_0_var(--color-gray-200)] [scrollbar-width:none] md:shadow-none [&::-webkit-scrollbar]:hidden">
          {TABS_INFORMES_TRADUCTOR.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => cambiarTab(tab.id)}
              className={`shrink-0 cursor-pointer whitespace-nowrap border-b-2 px-3 py-3 text-sm font-semibold transition-all hover:text-brand-wine sm:px-4 ${
                tabActiva === tab.id ? "border-brand-wine text-brand-wine" : "border-transparent text-slate-500"
              }`}
            >
              {tab.etiqueta}
            </button>
          ))}
        </div>

        {tabActiva === "repositorio" ? (
          <div className="flex flex-wrap gap-1 md:pb-2">
            {OPCIONES_TIPO_REPOSITORIO.map((opcion) => (
              <button
                key={opcion.etiqueta}
                type="button"
                onClick={() => cambiarTipoFiltro(opcion.valor)}
                className={`cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition-all hover:scale-[1.02] ${
                  tipoFiltro === opcion.valor ? "bg-brand-wine text-brand-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {opcion.etiqueta}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {tabActiva === "repositorio" ? (
        <CustomTablaRepositorioInformes
          informes={consultaRepositorio.data?.lstInforme}
          estaCargando={consultaRepositorio.isLoading}
          hayError={consultaRepositorio.isError}
          onReintentar={() => consultaRepositorio.refetch()}
          paginaActual={paginaActual}
          totalPaginas={consultaRepositorio.data?.totalPaginas ?? 1}
          totalRegistros={consultaRepositorio.data?.totalRegistros ?? 0}
          onCambiarPagina={cambiarPaginaInformes}
          onCrearComplemento={abrirNuevoComplemento}
        />
      ) : (
        <CustomTablaMisComplementos
          complementos={consultaMisComplementos.data?.lstComplemento}
          estaCargando={consultaMisComplementos.isLoading}
          hayError={consultaMisComplementos.isError}
          onReintentar={() => consultaMisComplementos.refetch()}
          paginaActual={paginaActual}
          totalPaginas={consultaMisComplementos.data?.totalPaginas ?? 1}
          totalRegistros={consultaMisComplementos.data?.totalRegistros ?? 0}
          onCambiarPagina={cambiarPaginaInformes}
          idComplementoEnviando={enviarAprobacionMutation.isPending ? enviarAprobacionMutation.variables : undefined}
          onEnviarAprobacion={(idComplemento) => enviarAprobacionMutation.mutate(idComplemento)}
        />
      )}

      {informeBaseComplemento ? (
        <CustomModalNuevoComplemento
          key={informeBaseComplemento.idInforme}
          informeReferencia={informeBaseComplemento}
          onCerrar={cerrarNuevoComplemento}
          onCreado={complementoCreado}
        />
      ) : null}
    </div>
  );
}
