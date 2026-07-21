import { useState } from "react";
import { createPortal } from "react-dom";
import { ChevronRight, Edit, Eye, MoreHorizontal, Plus, RefreshCcw, SlidersHorizontal, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import {
  ESTILOS_ESTADO_FACTURA_CLIENTE,
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

  const facturaMenuActivo = facturas.find((factura) => factura.idFactura === idMenuActivo);

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
    const altoMenu = 124;
    const espacioInferior = window.innerHeight - rectangulo.bottom;
    setEstiloMenu({
      left: Math.max(8, rectangulo.right - anchoMenu),
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90dvh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between px-8 py-5">
          <h2 className="text-xl font-bold text-brand-black">Facturas</h2>
          <CustomButton variant="ghost" size="icon" onClick={cerrarModal} aria-label="Cerrar facturas">
            <X size={18} className="text-slate-400" />
          </CustomButton>
        </div>

        <div className="flex items-center justify-between px-8 pb-4">
          <p className="text-sm font-bold text-slate-700">
            Cliente: <span className="font-bold">{cliente}</span>
          </p>
          <div className="flex items-center gap-3">
            <button type="button" className="rounded-lg p-2 text-slate-400 hover:bg-slate-50">
              <SlidersHorizontal size={15} />
            </button>
            <CustomButton variant="secondary" size="sm">
              Estado
            </CustomButton>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-8">
          <table className="w-full text-left text-sm">
            <thead className="border-y border-slate-100 text-xs font-bold uppercase text-slate-400">
              <tr>
                <th className="px-1 py-4">ID</th>
                <th className="px-4 py-4">Investigado</th>
                <th className="px-4 py-4">Penalidad</th>
                <th className="px-4 py-4 text-center">Estado</th>
                <th className="px-1 py-4 text-right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {facturas.map((factura) => (
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

        <div className="flex items-center justify-between border-t border-slate-100 px-8 py-5">
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
              <div className={`absolute right-full w-56 rounded-lg border border-slate-200 bg-white py-1 shadow-xl ${
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
