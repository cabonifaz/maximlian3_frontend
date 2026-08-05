import { Check, Pencil, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import type { EmpresaRelacionadaAnalista } from "@maximilian/shared/types/investigacion.type";

export type CompaniaRelacionadaExtraccionNueva = EmpresaRelacionadaAnalista & {
  idTipoPersona?: number;
  idTipoDocumento?: number;
  idPais?: number;
  tipoPersona?: string;
  tipoDocumento?: string;
  telefono?: string;
  direccion?: string;
  ubigeo?: string;
  codigoPostal?: string;
};

interface PropsCustomModalRevisionCompaniasExtraccion {
  companias: CompaniaRelacionadaExtraccionNueva[];
  indiceAprobando?: number | null;
  onEditar: (indice: number) => void;
  onAprobar: (indice: number) => void;
  onRechazar: (indice: number) => void;
  onCerrar: () => void;
}

export function CustomModalRevisionCompaniasExtraccion({
  companias,
  indiceAprobando,
  onEditar,
  onAprobar,
  onRechazar,
  onCerrar,
}: PropsCustomModalRevisionCompaniasExtraccion) {
  if (companias.length === 0) return null;
  const estaProcesando = indiceAprobando != null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-7 py-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8ea0c0]">Extracción</p>
            <h2 className="mt-2 text-xl font-bold text-slate-900">Compañías relacionadas detectadas</h2>
            <p className="mt-2 text-sm text-slate-500">
              {companias.length} pendiente{companias.length === 1 ? "" : "s"}. Edita los datos si es necesario y agrega cada compañía al informe.
            </p>
          </div>
          <CustomButton variant="ghost" size="icon" onClick={onCerrar} disabled={estaProcesando}>
            <X size={18} />
          </CustomButton>
        </div>

        <div className="overflow-y-auto px-7 py-6">
          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="min-w-[760px] w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300">
                <tr>
                  <th className="px-4 py-3">Empresa</th>
                  <th className="px-4 py-3">ID Fiscal</th>
                  <th className="px-4 py-3">País</th>
                  <th className="px-4 py-3">Teléfono</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {companias.map((compania, indice) => (
                  <tr key={`${compania.empresa}-${compania.idFiscal}-${indice}`} className="transition-colors hover:bg-slate-50">
                    <td className="px-4 py-4 text-sm font-semibold text-slate-700">{compania.empresa || "-"}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{compania.idFiscal || "-"}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{compania.pais || "-"}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{compania.telefono || "-"}</td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <CustomButton variant="secondary" size="sm" onClick={() => onEditar(indice)} disabled={estaProcesando}>
                          <Pencil size={14} />
                          Editar
                        </CustomButton>
                        <CustomButton variant="secondary" size="sm" onClick={() => onRechazar(indice)} disabled={estaProcesando}>
                          <X size={14} />
                          Rechazar
                        </CustomButton>
                        <CustomButton variant="primary" size="sm" onClick={() => onAprobar(indice)} disabled={estaProcesando} loading={indiceAprobando === indice} loadingText="Agregando...">
                          <Check size={14} />
                          Agregar
                        </CustomButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
