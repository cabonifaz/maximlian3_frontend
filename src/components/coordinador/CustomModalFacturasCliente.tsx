import { useState } from "react";
import { createPortal } from "react-dom";
import {
  ChevronRight,
  Edit,
  Eye,
  Loader2,
  MoreHorizontal,
  Plus,
  ReceiptText,
  RefreshCcw,
  Search,
  X,
} from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomTabla } from "@maximilian/components/common/CustomTabla";
import { useListadoFacturasCliente } from "@maximilian/hooks/useListadoFacturasCliente";
import {
  CODIGOS_ESTADO_FACTURA_EDITABLES,
  CODIGOS_ESTADO_FACTURA_EMITIBLES,
  CODIGOS_ESTADO_FACTURA_MODIFICABLE,
  CODIGOS_ESTADO_FACTURA_SIN_VISUALIZACION,
  CODIGOS_ESTADO_FACTURA_SOLO_LECTURA,
  ESTILOS_ESTADO_FACTURA_CLIENTE,
  OPCIONES_MODIFICAR_ESTADO_FACTURA,
} from "@maximilian/shared/constants/components/coordinador/facturacion.constants";
import type {
  EntradaFacturaCliente,
  EstadoFacturaCliente,
} from "@maximilian/shared/types/facturacion.type";

interface CustomModalFacturasClienteProps {
  abierto: boolean;
  idCliente: number;
  cliente: string;
  onCerrar: () => void;
  onAgregarFactura: () => void;
  onVerFactura: (factura: EntradaFacturaCliente) => void;
  onEditarFactura: (factura: EntradaFacturaCliente) => void;
  onEmitirFactura: (factura: EntradaFacturaCliente) => void;
  cargandoAccion?: boolean;
}

function CustomEstadoFacturaBadge({ estado }: { estado: EstadoFacturaCliente }) {
  const configuracion = ESTILOS_ESTADO_FACTURA_CLIENTE[estado];

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${configuracion.clase}`}>
      {configuracion.texto}
    </span>
  );
}

export function CustomModalFacturasCliente({
  abierto,
  idCliente,
  cliente,
  onCerrar,
  onAgregarFactura,
  onVerFactura,
  onEditarFactura,
  onEmitirFactura,
  cargandoAccion = false,
}: CustomModalFacturasClienteProps) {
  const [idMenuActivo, setIdMenuActivo] = useState<number | null>(null);
  const [idSubmenuEstadoActivo, setIdSubmenuEstadoActivo] = useState<number | null>(null);
  const [estiloMenu, setEstiloMenu] = useState<React.CSSProperties>({});
  const [submenuEstadoHaciaArriba, setSubmenuEstadoHaciaArriba] = useState(false);
  const {
    terminoBusqueda,
    paginaActual,
    facturasPagina,
    totalRegistros,
    totalPaginas,
    isLoading,
    isError,
    cambiarBusqueda,
    cambiarPagina,
    actualizarEstadoFactura,
    estaActualizandoEstado,
    reintentar,
  } = useListadoFacturasCliente(idCliente);
  const facturaMenuActivo = facturasPagina.find(
    (factura) => factura.idFactura === idMenuActivo,
  );
  const facturaMenuSoloLectura = facturaMenuActivo
    ? CODIGOS_ESTADO_FACTURA_SOLO_LECTURA.includes(facturaMenuActivo.codigoEstado)
    : false;
  const facturaMenuPuedeModificarEstado = facturaMenuActivo
    ? CODIGOS_ESTADO_FACTURA_MODIFICABLE.includes(
        facturaMenuActivo.codigoEstado,
      )
    : false;
  const facturaMenuPuedeEmitir = facturaMenuActivo
    ? CODIGOS_ESTADO_FACTURA_EMITIBLES.includes(
        facturaMenuActivo.codigoEstado,
      )
    : false;
  const facturaMenuPuedeVer = facturaMenuActivo
    ? !CODIGOS_ESTADO_FACTURA_SIN_VISUALIZACION.includes(
        facturaMenuActivo.codigoEstado,
      )
    : false;

  const alternarMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
    factura: EntradaFacturaCliente,
  ) => {
    if (idMenuActivo === factura.idFactura) {
      setIdMenuActivo(null);
      setIdSubmenuEstadoActivo(null);
      return;
    }

    const rectangulo = event.currentTarget.getBoundingClientRect();
    const puedeModificarEstado =
      CODIGOS_ESTADO_FACTURA_MODIFICABLE.includes(factura.codigoEstado);
    const puedeEditar = CODIGOS_ESTADO_FACTURA_EDITABLES.includes(
      factura.codigoEstado,
    );
    const puedeEmitir = CODIGOS_ESTADO_FACTURA_EMITIBLES.includes(
      factura.codigoEstado,
    );
    const puedeVer = !CODIGOS_ESTADO_FACTURA_SIN_VISUALIZACION.includes(
      factura.codigoEstado,
    );
    const anchoMenu = 176;
    const anchoSubmenu = puedeModificarEstado && !puedeEmitir ? 224 : 0;
    const cantidadAcciones = Number(puedeEmitir || puedeVer)
      + Number(puedeEditar)
      + Number(puedeModificarEstado && !puedeEmitir);
    const altoMenu = Math.max(1, cantidadAcciones) * 44;
    const espacioInferior = window.innerHeight - rectangulo.bottom;
    setEstiloMenu({
      left: Math.max(
        8,
        Math.min(
          rectangulo.right - anchoMenu,
          window.innerWidth - anchoMenu - anchoSubmenu - 8,
        ),
      ),
      top: espacioInferior < altoMenu
        ? Math.max(8, rectangulo.top - altoMenu - 4)
        : rectangulo.bottom + 4,
    });
    setIdMenuActivo(factura.idFactura);
    setIdSubmenuEstadoActivo(null);
  };

  const cerrarMenu = () => {
    setIdMenuActivo(null);
    setIdSubmenuEstadoActivo(null);
  };

  const abrirSubmenuEstado = (elemento: HTMLElement, idFactura: number) => {
    const rectangulo = elemento.getBoundingClientRect();
    const altoSubmenu = 120;
    setSubmenuEstadoHaciaArriba(
      window.innerHeight - rectangulo.top < altoSubmenu + 8,
    );
    setIdSubmenuEstadoActivo(idFactura);
  };

  const cerrarModal = () => {
    cerrarMenu();
    onCerrar();
  };

  const columnas = [
    { label: "ID", width: "18%" },
    { label: "Investigado", width: "34%" },
    { label: "Penalidad", width: "15%" },
    { label: "Estado", className: "text-center", width: "25%" },
    { label: "", className: "text-right", width: "8%" },
  ];

  const renderizarFilaFactura = (factura: EntradaFacturaCliente) => (
    <>
      <td className="px-6 py-4 text-xs font-bold text-slate-500">{factura.codigo}</td>
      <td className="px-6 py-4 font-bold text-brand-black">{factura.investigado}</td>
      <td className="px-6 py-4 text-slate-600">{factura.penalidad ? "Sí" : "No"}</td>
      <td className="px-6 py-4 text-center">
        <CustomEstadoFacturaBadge estado={factura.estado} />
      </td>
      <td className="px-6 py-4 text-right">
        <button
          type="button"
          onClick={(event) => alternarMenu(event, factura)}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-black"
          aria-label={`Acciones de ${factura.codigo}`}
        >
          <MoreHorizontal size={17} />
        </button>
      </td>
    </>
  );

  if (!abierto) return null;

  return (
    <>
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90dvh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl shadow-slate-950/20">
        {cargandoAccion ? (
          <div className="absolute inset-0 z-[110] flex flex-col items-center justify-center gap-3 bg-white/85 backdrop-blur-sm">
            <Loader2 className="h-9 w-9 animate-spin text-brand-wine" />
            <p className="text-sm font-medium text-slate-600">Cargando factura...</p>
          </div>
        ) : null}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-white to-brand-wine/5 px-8 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-wine/10 text-brand-wine">
              <ReceiptText size={19} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-brand-black">Facturas del cliente</h2>
              <p className="mt-0.5 text-xs text-slate-500">Revisa, edita y actualiza el estado de cada factura.</p>
            </div>
          </div>
          <CustomButton variant="ghost" size="icon" onClick={cerrarModal} aria-label="Cerrar facturas">
            <X size={18} className="text-slate-400" />
          </CustomButton>
        </div>

        <div className="flex items-center justify-between gap-4 bg-slate-50/70 px-8 py-4">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cliente</p>
            <p className="mt-0.5 text-sm font-bold text-brand-black">{cliente}</p>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Buscar factura"
              value={terminoBusqueda}
              onChange={(event) => cambiarBusqueda(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-brand-wine focus:ring-4 focus:ring-brand-wine/10"
              aria-label="Buscar factura del cliente"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-white px-8 py-5">
          <CustomTabla
            columns={columnas}
            data={facturasPagina}
            getId={(factura) => factura.idFactura}
            renderRow={renderizarFilaFactura}
            isLoading={isLoading}
            isError={isError}
            onRetry={() => reintentar()}
            emptyMessage="No se encontraron facturas."
            errorMessage="Error al cargar las facturas del cliente."
            paginaActual={paginaActual}
            totalPages={totalPaginas}
            totalRecords={totalRegistros}
            onPageChange={cambiarPagina}
            entityLabel="facturas"
          />
        </div>

        <div className="flex justify-end border-t border-slate-100 bg-slate-50/60 px-8 py-4">
          <CustomButton
            variant="primary"
            size="compact"
            onClick={onAgregarFactura}
            loading={cargandoAccion}
            loadingText="Cargando..."
          >
            <Plus size={14} />
            Emitir Factura
          </CustomButton>
        </div>
      </div>
    </div>
    {facturaMenuActivo ? createPortal(
      <>
        <button
          type="button"
          className="fixed inset-0 z-[90] cursor-default"
          onClick={cerrarMenu}
          aria-label="Cerrar acciones de factura"
        />
        <div
          className="fixed z-[100] w-44 rounded-lg border border-slate-200 bg-white py-1 text-left shadow-xl"
          style={estiloMenu}
        >
          {facturaMenuPuedeEmitir ? (
            <button
              type="button"
              onClick={() => {
                cerrarMenu();
                onEmitirFactura(facturaMenuActivo);
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <ReceiptText size={14} />
              Emitir factura
            </button>
          ) : facturaMenuPuedeVer ? (
          <button
            type="button"
            onClick={() => {
              cerrarMenu();
              onVerFactura(facturaMenuActivo);
            }}
            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Eye size={14} />
            Ver factura
          </button>
          ) : null}
          {!facturaMenuSoloLectura && !facturaMenuPuedeEmitir ? (
            <>
              {CODIGOS_ESTADO_FACTURA_EDITABLES.includes(
                facturaMenuActivo.codigoEstado,
              ) ? (
                <button
                  type="button"
                  onClick={() => {
                    cerrarMenu();
                    onEditarFactura(facturaMenuActivo);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Edit size={14} />
                  Editar factura
                </button>
              ) : null}
              {facturaMenuPuedeModificarEstado ? (
              <div
                className="relative"
                onMouseEnter={(event) => abrirSubmenuEstado(
                  event.currentTarget,
                  facturaMenuActivo.idFactura,
                )}
                onMouseLeave={() => setIdSubmenuEstadoActivo(null)}
                onFocus={(event) => abrirSubmenuEstado(
                  event.currentTarget,
                  facturaMenuActivo.idFactura,
                )}
              >
            <button
              type="button"
              onClick={() => setIdSubmenuEstadoActivo(
                idSubmenuEstadoActivo === facturaMenuActivo.idFactura
                  ? null
                  : facturaMenuActivo.idFactura,
              )}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <RefreshCcw size={14} />
              <span className="flex-1">Modificar estado</span>
              <ChevronRight size={14} />
            </button>
            {idSubmenuEstadoActivo === facturaMenuActivo.idFactura ? (
              <div className={`absolute left-full w-56 rounded-lg border border-slate-200 bg-white py-1 shadow-xl ${
                submenuEstadoHaciaArriba ? "bottom-0" : "top-0"
              }`}>
                {OPCIONES_MODIFICAR_ESTADO_FACTURA.map((opcion) => (
                  <button
                    key={opcion.valor}
                    type="button"
                    onClick={() => {
                      actualizarEstadoFactura(
                        facturaMenuActivo,
                        opcion.codigoEstado,
                      );
                      cerrarMenu();
                    }}
                    disabled={estaActualizandoEstado}
                    className={`flex w-full items-center px-4 py-2 text-left text-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 ${
                      facturaMenuActivo.estado === opcion.valor
                        ? "font-bold text-brand-wine"
                        : "text-slate-700"
                    }`}
                  >
                    {opcion.etiqueta}
                  </button>
                ))}
              </div>
            ) : null}
              </div>
              ) : null}
            </>
          ) : null}
        </div>
      </>,
      document.body,
    ) : null}
    </>
  );
}
