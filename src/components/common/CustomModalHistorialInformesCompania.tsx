import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Eye, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomModalVistaPreviaInforme } from "@maximilian/components/common/CustomModalVistaPreviaInforme";
import { CustomTabla } from "@maximilian/components/common/CustomTabla";
import { informeService } from "@maximilian/services/informe.service";
import type { CompaniaNoticiaDetalleListaItem } from "@maximilian/shared/types/compania-noticia-detalle.type";
import type { InformeHistorialCompania } from "@maximilian/shared/types/informe.type";
import { crearDatosInvestigacionVacios } from "@maximilian/shared/utils/investigacion.util";

interface PropsCustomModalHistorialInformesCompania {
  empresa: CompaniaNoticiaDetalleListaItem | null;
  onCerrar: () => void;
}

export function CustomModalHistorialInformesCompania({
  empresa,
  onCerrar,
}: PropsCustomModalHistorialInformesCompania) {
  const [paginaActual, setPaginaActual] = useState(1);
  const [informeVistaPrevia, setInformeVistaPrevia] =
    useState<InformeHistorialCompania | null>(null);
  const estaAbierto = Boolean(empresa);
  const idCompania = empresa?.idCompania ?? 0;
  const datosInvestigacionVacios = useMemo(
    () => crearDatosInvestigacionVacios(),
    [],
  );

  const {
    data: respuestaHistorial,
    isLoading: estaCargandoHistorial,
    isError: hayErrorHistorial,
    refetch: recargarHistorial,
  } = useQuery({
    queryKey: ["historialInformesCompania", idCompania, paginaActual],
    queryFn: () =>
      informeService.listarHistorialPorCompania({
        idCompania,
        numPag: paginaActual,
      }),
    enabled: estaAbierto && idCompania > 0,
  });

  if (!empresa) return null;

  const informes = respuestaHistorial?.lstInformes ?? [];

  return (
    <div className="fixed left-0 top-0 z-[70] flex h-[100dvh] w-[100dvw] items-center justify-center overflow-hidden bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="flex max-h-[90dvh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-brand-white shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-8 py-6">
          <div className="min-w-0 space-y-1">
            <h2 className="text-xl font-bold text-brand-black">
              Historial de informes
            </h2>
            <p className="truncate text-sm font-semibold text-gray-500">
              {empresa.razonSocial}
            </p>
          </div>
          <CustomButton variant="ghost" size="icon" onClick={onCerrar}>
            <X size={20} className="text-gray-400" />
          </CustomButton>
        </div>

        <div className="min-h-0 overflow-y-auto px-8 py-6">
          <CustomTabla
            columns={[
              { label: "ID Informe", width: "16%" },
              { label: "Pedido", width: "14%" },
              { label: "Nombre", width: "38%" },
              { label: "Idioma", width: "16%" },
              { label: "Ver informe", width: "16%" },
            ]}
            data={informes}
            getId={(informe) => informe.idInforme}
            isLoading={estaCargandoHistorial}
            isError={hayErrorHistorial}
            onRetry={() => void recargarHistorial()}
            emptyMessage="No hay informes registrados para esta empresa."
            errorMessage="No se pudo cargar el historial de informes."
            paginaActual={paginaActual}
            totalPages={Math.max(respuestaHistorial?.totalPaginas ?? 1, 1)}
            totalRecords={respuestaHistorial?.totalRegistros ?? 0}
            onPageChange={setPaginaActual}
            entityLabel="informes"
            renderRow={(informe) => (
              <>
                <td className="px-6 py-4 text-sm font-bold text-slate-800">
                  {informe.idInforme}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-500">
                  {informe.idPedido}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-500">
                  <span className="block truncate" title={informe.nombre}>
                    {informe.nombre}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-500">
                  {informe.idioma}
                </td>
                <td className="px-6 py-4">
                  <CustomButton
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setInformeVistaPrevia(informe)}
                  >
                    <Eye size={14} />
                    Ver
                  </CustomButton>
                </td>
              </>
            )}
          />
        </div>
      </div>
      <CustomModalVistaPreviaInforme
        estaAbierto={Boolean(informeVistaPrevia)}
        datosInvestigacion={datosInvestigacionVacios}
        encabezado={{
          pais: empresa.pais || "-",
          fecha: "-",
          tipoSolicitud: informeVistaPrevia?.nombre ?? "-",
          analista: "-",
          traductor: "-",
        }}
        idInforme={informeVistaPrevia?.idInforme}
        idPedido={informeVistaPrevia?.idPedido}
        mostrarInformeTraducido
        onCerrar={() => setInformeVistaPrevia(null)}
      />
    </div>
  );
}
