import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronRight, Edit, Eye, MoreHorizontal, Plus, ReceiptText, RefreshCcw, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomEncabezadoFiltroTabla } from "@maximilian/components/common/CustomEncabezadoFiltroTabla";
import {
  ESTILOS_ESTADO_FACTURA_CLIENTE,
  OPCIONES_FILTRO_ESTADO_FACTURA,
  OPCIONES_MODIFICAR_ESTADO_FACTURA,
} from "@maximilian/shared/constants/components/coordinador/facturacion.constants";
import type {
  EntradaFacturaCliente,
  EstadoFacturaCliente,
} from "@maximilian/shared/types/facturacion.type";

interface CustomModalFacturasClienteProps {
  abierto: boolean;
  cliente: string;
  facturas: EntradaFacturaCliente[];
  onCerrar: () => void;
  onAgregarFactura: () => void;
  onVerFactura: (factura: EntradaFacturaCliente) => void;
  onEditarFactura: (factura: EntradaFacturaCliente) => void;
  onModificarEstado: (factura: EntradaFacturaCliente, estado: EstadoFacturaCliente) => void;
}

function EstadoFacturaBadge({ estado }: { estado: EstadoFacturaCliente }) {
  const configuracion = ESTILOS_ESTADO_FACTURA_CLIENTE[estado];

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${configuracion.clase}`}>
      {configuracion.texto}
    </span>
  );
}

export function CustomModalFacturasCliente({
  abierto,
  cliente,
  facturas,
  onCerrar,
  onAgregarFactura,
  onVerFactura,
  onEditarFactura,
  onModificarEstado,
}: CustomModalFacturasClienteProps) {
  const [idMenuActivo, setIdMenuActivo] = useState<number | null>(null);
  const [idSubmenuEstadoActivo, setIdSubmenuEstadoActivo] = useState<number | null>(null);
  const [estiloMenu, setEstiloMenu] = useState<React.CSSProperties>({});
  const [submenuEstadoHaciaArriba, setSubmenuEstadoHaciaArriba] = useState(false);
  const [idEstadoFiltro, setIdEstadoFiltro] = useState<number | undefined>();

  const estadoFiltro = OPCIONES_FILTRO_ESTADO_FACTURA.find(
    (opcion) => opcion.num1 === idEstadoFiltro,
  )?.string2;
  const facturasFiltradas = useMemo(
    () => estadoFiltro
      ? facturas.filter((factura) => factura.estado === estadoFiltro)
      : facturas,
    [estadoFiltro, facturas],
  );
  const facturaMenuActivo = facturasFiltradas.find(
    (factura) => factura.idFactura === idMenuActivo,
  );

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
    const anchoMenu = 176;
    const anchoSubmenu = 224;
    const altoMenu = 124;
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

  if (!abierto) return null;

  return (
    <>
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90dvh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl shadow-slate-950/20">
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

        <div className="flex bg-slate-50/70 px-8 py-4">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cliente</p>
            <p className="mt-0.5 text-sm font-bold text-brand-black">{cliente}</p>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-white px-8 py-5">
          <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="border-y border-slate-100 text-xs font-bold uppercase text-slate-400">
              <tr>
                <th className="px-1 py-4">ID</th>
                <th className="px-4 py-4">Investigado</th>
                <th className="px-4 py-4">Penalidad</th>
                <th className="px-4 py-2 text-center">
                  <CustomEncabezadoFiltroTabla
                    titulo="Estado"
                    opciones={OPCIONES_FILTRO_ESTADO_FACTURA}
                    valores={idEstadoFiltro ? [idEstadoFiltro] : []}
                    onChange={(valores) =>
                      setIdEstadoFiltro(valores[valores.length - 1])
                    }
                    multiple={false}
                  />
                </th>
                <th className="px-1 py-4 text-right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {facturasFiltradas.map((factura) => (
                <tr key={factura.idFactura} className="hover:bg-slate-50/70">
                  <td className="px-1 py-4 text-xs font-bold text-slate-500">{factura.codigo}</td>
                  <td className="px-4 py-4 font-bold text-brand-black">{factura.investigado}</td>
                  <td className="px-4 py-4 text-slate-600">{factura.penalidad ? "Sí" : "No"}</td>
                  <td className="px-4 py-4 text-center">
                    <EstadoFacturaBadge estado={factura.estado} />
                  </td>
                  <td className="relative px-1 py-4 text-right">
                    <button
                      type="button"
                      onClick={(event) => alternarMenu(event, factura)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-black"
                      aria-label={`Acciones de ${factura.codigo}`}
                    >
                      <MoreHorizontal size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-8 py-4">
          <div className="flex flex-1 justify-center gap-2 text-xs">
            <button className="h-8 w-8 rounded-lg border border-slate-200 text-slate-500">{"<"}</button>
            <button className="h-8 w-8 rounded-lg bg-brand-black font-bold text-white">1</button>
            <button className="h-8 w-8 rounded-lg border border-slate-200 text-slate-500">2</button>
            <button className="h-8 w-8 rounded-lg border border-slate-200 text-slate-500">3</button>
            <button className="h-8 w-8 rounded-lg border border-slate-200 text-slate-500">{">"}</button>
          </div>
          <CustomButton variant="primary" size="compact" onClick={onAgregarFactura}>
            <Plus size={14} />
            Agregar factura
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
                      onModificarEstado(facturaMenuActivo, opcion.valor);
                      cerrarMenu();
                    }}
                    className={`flex w-full items-center px-4 py-2 text-left text-sm hover:bg-slate-50 ${
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
        </div>
      </>,
      document.body,
    ) : null}
    </>
  );
}
