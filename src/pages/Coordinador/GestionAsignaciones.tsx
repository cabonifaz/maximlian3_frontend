import { ASSIGNMENT_COLUMNS } from "@maximilian/shared/constants/pages/Coordinador/gestion-asignaciones.constants";
import { Search, MoreHorizontal, Edit, X, Plus } from "lucide-react";
import { CustomTabla } from "@maximilian/components/common/CustomTabla";
import { CustomChipEstado } from "@maximilian/components/common/CustomChipEstado";
import { CustomChipVigencia } from "@maximilian/components/common/CustomChipVigencia";
import { CustomModalConfirmacionEliminacion } from "@maximilian/components/common/CustomModalConfirmacionEliminacion";
import { ModalFlujoAsignacion } from "@maximilian/components/coordinador/ModalFlujoAsignacion";
import { CustomEncabezadoFiltroTabla } from "@maximilian/components/common/CustomEncabezadoFiltroTabla";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
import { useMenuFlotanteTabla } from "@maximilian/hooks/useMenuFlotanteTabla";
import { useGestionAsignaciones } from "@maximilian/hooks/useGestionAsignaciones";
import type { AssignmentOrderEntry } from "@maximilian/shared/types/asignacion.type";
import type { EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";
import {
  construirOpcionesEliminacionAsignacion,
  esNuevaAsignacionDesdeListado,
  tieneIdAsignacionEliminable,
} from "@maximilian/shared/utils/gestion-asignaciones.util";

function esColorHexadecimal(valor?: string | null) {
  return /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(valor?.trim() ?? "");
}

function expandirColorHexadecimal(color: string) {
  const valor = color.trim();
  if (valor.length === 4) {
    return `#${valor[1]}${valor[1]}${valor[2]}${valor[2]}${valor[3]}${valor[3]}`;
  }

  return valor;
}

function obtenerColorTextoContraste(colorFondo: string) {
  const color = expandirColorHexadecimal(colorFondo).replace("#", "");
  const rojo = Number.parseInt(color.slice(0, 2), 16);
  const verde = Number.parseInt(color.slice(2, 4), 16);
  const azul = Number.parseInt(color.slice(4, 6), 16);
  const luminancia = (0.299 * rojo + 0.587 * verde + 0.114 * azul) / 255;

  return luminancia > 0.62 ? "#334155" : "#FFFFFF";
}

function obtenerNumeroTablaMaestra(opcion: EntradaTablaMaestra) {
  const registro = opcion as EntradaTablaMaestra & { Num1?: number | string | null };
  const valor = opcion.num1 ?? registro.Num1;
  const numero = typeof valor === "string" ? Number(valor) : valor;

  return Number.isFinite(numero) ? numero : undefined;
}

function obtenerTextoTablaMaestra(
  opcion: EntradaTablaMaestra | undefined,
  clave: "string2" | "string3",
) {
  if (!opcion) return undefined;
  const registro = opcion as EntradaTablaMaestra & {
    String2?: string | null;
    String3?: string | null;
  };

  return (opcion[clave] ?? registro[clave === "string2" ? "String2" : "String3"])?.trim();
}

function obtenerColorFondoEstadoRespaldo(idEstado?: number) {
  const coloresPorEstado: Record<number, string> = {
    1: "#EDE9FE",
    2: "#DBEAFE",
    3: "#DCFCE7",
    4: "#F1F5F9",
  };

  return idEstado ? coloresPorEstado[idEstado] : undefined;
}

function obtenerColoresEstadoAsignacion(
  asignacion: AssignmentOrderEntry,
  opcionesEstadoAsignacion?: EntradaTablaMaestra[],
) {
  const opcionEstado = opcionesEstadoAsignacion?.find(
    (opcion) => obtenerNumeroTablaMaestra(opcion) === asignacion.idEstado,
  );
  const colorFondoMaestro = obtenerTextoTablaMaestra(opcionEstado, "string2");
  const colorLetraMaestro = obtenerTextoTablaMaestra(opcionEstado, "string3");
  const colorFondoRespaldo = obtenerColorFondoEstadoRespaldo(asignacion.idEstado);
  const colorFondo = esColorHexadecimal(colorFondoMaestro)
    ? expandirColorHexadecimal(colorFondoMaestro!)
    : colorFondoRespaldo || asignacion.estadoColorFondo || "#f1f5f9";
  const colorLetra = esColorHexadecimal(colorLetraMaestro)
    ? expandirColorHexadecimal(colorLetraMaestro!)
    : esColorHexadecimal(colorFondoMaestro) || colorFondoRespaldo
      ? obtenerColorTextoContraste(colorFondo)
      : asignacion.estadoColorLetra || "#475569";

  return { colorFondo, colorLetra };
}

function getEstadoBadge(descripcion: string, colorLetra: string, colorFondo: string) {
  const texto = descripcion.trim() || "-";
  const textoNormalizado = texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  const dividirEnLineas = (valor: string, limite = 18) => {
    const palabras = valor.split(/\s+/).filter(Boolean);
    const lineas: string[] = [];
    let lineaActual = "";

    for (const palabra of palabras) {
      const siguienteLinea = lineaActual ? `${lineaActual} ${palabra}` : palabra;
      if (siguienteLinea.length <= limite) {
        lineaActual = siguienteLinea;
        continue;
      }

      if (lineaActual) {
        lineas.push(lineaActual);
      }

      lineaActual = palabra;
    }

    if (lineaActual) {
      lineas.push(lineaActual);
    }

    return lineas.slice(0, 3);
  };

  let lineas = dividirEnLineas(texto);

  if (textoNormalizado.startsWith("reasignado a ")) {
    lineas = ["Reasignado a", ...dividirEnLineas(texto.slice("Reasignado a ".length).trim() || "-")];
  } else if (textoNormalizado.startsWith("asignado a ")) {
    lineas = ["Asignado a", ...dividirEnLineas(texto.slice("Asignado a ".length).trim() || "-")];
  } else if (textoNormalizado === "traduccion completa") {
    lineas = ["Traducción", "completa"];
  } else if (textoNormalizado === "analisis completo") {
    lineas = ["Análisis", "completo"];
  } else if (textoNormalizado === "asignacion anulada") {
    lineas = ["Asignación", "anulada"];
  } else if (textoNormalizado === "sin asignacion") {
    lineas = ["Sin", "asignación"];
  }

  return (
    <CustomChipEstado
      colorTexto={colorLetra}
      colorFondo={colorFondo}
      forma="tarjetaAmplia"
      tamano="amplio"
      className="mx-auto min-h-14 w-40 flex-col justify-center text-center leading-tight"
      title={texto}
    >
      {lineas.map((linea) => (
        <span key={linea} className="block w-full text-center">
          {linea}
        </span>
      ))}
    </CustomChipEstado>
  );
}

export default function GestionAsignaciones() {
  const {
    abrirModalAsignacion,
    abrirModalNuevaAsignacion,
    anularAsignacionMutation,
    asignacionAAnular,
    cambiarBusqueda,
    cambiarFiltroEstado,
    cambiarPaginaAsignacion,
    cerrarEliminacionAsignacion,
    cerrarModalAsignacion,
    confirmarAnulacionAsignacion,
    data,
    idAsignacionAEliminar,
    idEstadoFiltro,
    isError,
    isLoading,
    modalAsignacion,
    opcionesEstadoAsignacion,
    paginaActual,
    prepararEliminacionAsignacion,
    refetch,
    refrescarDespuesAsignacion,
    setIdAsignacionAEliminar,
    terminoBusqueda,
  } = useGestionAsignaciones();
  const { idMenuActivo, estiloMenu, alternarMenu, cerrarMenu } = useMenuFlotanteTabla();

  const columnas = ASSIGNMENT_COLUMNS.map((columna, indice) => {
    if (indice !== 4) return columna;

    return {
      ...columna,
      label: (
        <CustomEncabezadoFiltroTabla
          titulo="Estado"
          opciones={opcionesEstadoAsignacion}
          valores={idEstadoFiltro ? [idEstadoFiltro] : []}
          onChange={cambiarFiltroEstado}
          multiple={false}
        />
      ),
    };
  });

  const renderRow = (asignacion: AssignmentOrderEntry) => {
    const coloresEstado = obtenerColoresEstadoAsignacion(asignacion, opcionesEstadoAsignacion);

    return (
      <>
        <td className="px-6 py-4 text-sm font-semibold text-brand-black">
          <span className="block truncate" title={asignacion.cliente}>
            {asignacion.cliente}
          </span>
        </td>
        <td className="px-6 py-4 text-sm text-slate-600">
          <span className="block truncate" title={asignacion.investigado}>
            {asignacion.investigado}
          </span>
        </td>
        <td className="px-6 py-4 text-sm text-slate-600">{asignacion.analista || "-"}</td>
        <td className="px-6 py-4 text-sm text-slate-600">{asignacion.traductor || "-"}</td>
        <td className="px-6 py-4 text-center">
          {getEstadoBadge(
            asignacion.estado || "-",
            coloresEstado.colorLetra,
            coloresEstado.colorFondo,
          )}
        </td>
        <td className="px-6 py-4">
          <CustomChipVigencia
            texto={asignacion.porVencerTexto}
            colorTexto={asignacion.porVencerColor}
            colorFondo={asignacion.porVencerFondo}
          />
        </td>
        <td className="px-6 py-4 text-right">
        <button
          onClick={(evento) => alternarMenu(evento, asignacion.idPedido, 96)}
          className="rounded-lg p-2 text-gray-400 transition-all hover:bg-gray-100 hover:text-brand-black cursor-pointer hover:scale-110 active:scale-90"
        >
          <MoreHorizontal size={18} />
        </button>

        {idMenuActivo === asignacion.idPedido && (
          <>
            <div className="fixed inset-0 z-10" onClick={cerrarMenu} />
            <div
              className="fixed z-20 w-52 rounded-xl border border-gray-200/50 bg-brand-white py-1 shadow-2xl animate-in fade-in zoom-in-95 duration-100"
              style={estiloMenu}
            >
              <button
                onClick={() => {
                  abrirModalAsignacion(asignacion);
                  cerrarMenu();
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 cursor-pointer"
              >
                <Edit size={14} />
                <span>{esNuevaAsignacionDesdeListado(asignacion) ? "Asignar" : "Reasignar"}</span>
              </button>
              {tieneIdAsignacionEliminable(asignacion) ? (
                <button
                  onClick={() => {
                    prepararEliminacionAsignacion(asignacion);
                    cerrarMenu();
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 cursor-pointer"
                >
                  <X size={14} />
                  <span>Eliminar</span>
                </button>
              ) : null}
            </div>
          </>
        )}
        </td>
      </>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-brand-black">Asignaciones</h1>

        <div className="flex flex-1 flex-col gap-3 md:max-w-3xl md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre del cliente, investigado, analista o traductor"
              value={terminoBusqueda}
              onChange={(evento) => cambiarBusqueda(evento.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-brand-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-brand-wine focus:ring-4 focus:ring-brand-wine/10"
            />
          </div>

          <button
            onClick={abrirModalNuevaAsignacion}
            className="flex items-center justify-center gap-2 rounded-lg bg-brand-wine px-4 py-2 text-sm font-medium text-brand-white shadow-sm shadow-brand-wine/20 transition-all hover:bg-brand-wine/90 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus size={16} />
            <span>Nueva Asignación</span>
          </button>
        </div>
      </div>

      <CustomTabla
        columns={columnas}
        data={data?.lstPedido}
        getId={(asignacion) => asignacion.idPedido}
        renderRow={renderRow}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        emptyMessage="No se encontraron asignaciones."
        errorMessage="Error al cargar las asignaciones"
        paginaActual={paginaActual}
        totalPages={data?.totalPaginas ?? 1}
        totalRecords={data?.totalRegistros ?? 0}
        onPageChange={cambiarPaginaAsignacion}
        entityLabel="asignaciones"
      />

      {modalAsignacion ? (
        <ModalFlujoAsignacion
          key={modalAsignacion.key}
          isOpen
          onClose={cerrarModalAsignacion}
          onSuccess={refrescarDespuesAsignacion}
          pedidosIniciales={modalAsignacion.pedidosIniciales}
          asignacionesIniciales={modalAsignacion.asignacionesIniciales}
          modo={modalAsignacion.modo}
          tabInicial={modalAsignacion.tabInicial}
          titulo={modalAsignacion.titulo}
        />
      ) : null}

      <CustomModalConfirmacionEliminacion
        isOpen={asignacionAAnular !== null}
        onClose={cerrarEliminacionAsignacion}
        onConfirm={confirmarAnulacionAsignacion}
        title="Eliminar asignación"
        isSubmitting={anularAsignacionMutation.isPending}
        confirmDisabled={idAsignacionAEliminar === undefined}
        anchoMaximoClassName="max-w-lg"
      >
        <p className="text-sm text-gray-600">
          Pedido de <span className="font-semibold">{asignacionAAnular?.cliente}</span> — {asignacionAAnular?.investigado}
        </p>
        {asignacionAAnular ? (
          <CustomSelectorBuscable
            label="Asignación a eliminar"
            options={construirOpcionesEliminacionAsignacion(asignacionAAnular)}
            value={idAsignacionAEliminar}
            onChange={(idAsignacionSeleccionada) => {
              setIdAsignacionAEliminar(idAsignacionSeleccionada);
            }}
            placeholder="Seleccione una asignación"
            required
            error={idAsignacionAEliminar === undefined ? "Seleccione la asignación a eliminar" : undefined}
            dropdownZIndexClassName="z-[120]"
            overlayZIndexClassName="z-[110]"
          />
        ) : null}
      </CustomModalConfirmacionEliminacion>
    </div>
  );
}

