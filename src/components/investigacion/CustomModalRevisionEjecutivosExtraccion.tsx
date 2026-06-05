import { Check, Pencil, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import type { RegistroDirectorioEjecutivoAnalista } from "@maximilian/shared/types/investigacion.type";

interface PropsCustomModalRevisionEjecutivosExtraccion {
  ejecutivos: RegistroDirectorioEjecutivoAnalista[];
  onEditar: (indice: number) => void;
  onAprobar: (indice: number) => void;
  onRechazar: (indice: number) => void;
  onCerrar: () => void;
}

export function CustomModalRevisionEjecutivosExtraccion({
  ejecutivos,
  onEditar,
  onAprobar,
  onRechazar,
  onCerrar,
}: PropsCustomModalRevisionEjecutivosExtraccion) {
  if (ejecutivos.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-7 py-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8ea0c0]">Extracción</p>
            <h2 className="mt-2 text-xl font-bold text-slate-900">Ejecutivos detectados</h2>
            <p className="mt-2 text-sm text-slate-500">
              Se identificaron ejecutivos nuevos. Revisa cada registro antes de agregarlo al informe.
            </p>
          </div>
          <CustomButton variant="ghost" size="icon" onClick={onCerrar}>
            <X size={18} />
          </CustomButton>
        </div>

        <div className="overflow-y-auto px-7 py-6">
          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="min-w-[640px] w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300">
                <tr>
                  <th className="px-4 py-3">Ejecutivo</th>
                  <th className="px-4 py-3">Cargo</th>
                  <th className="px-4 py-3">% Participación</th>
                  <th className="px-4 py-3">Vinculado Desde</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {ejecutivos.map((ejecutivo, indice) => (
                  <tr key={`${ejecutivo.ejecutivo}-${indice}`} className="transition-colors hover:bg-slate-50">
                    <td className="px-4 py-4 text-sm font-semibold text-slate-700">{ejecutivo.ejecutivo || ejecutivo.nombreCompleto || "-"}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{ejecutivo.cargo || "-"}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{ejecutivo.porcentaje || "-"}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{ejecutivo.vinculadoDesde || "-"}</td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <CustomButton variant="secondary" size="sm" onClick={() => onEditar(indice)}>
                          <Pencil size={14} />
                          Editar
                        </CustomButton>
                        <CustomButton variant="secondary" size="sm" onClick={() => onRechazar(indice)}>
                          <X size={14} />
                          Rechazar
                        </CustomButton>
                        <CustomButton variant="primary" size="sm" onClick={() => onAprobar(indice)}>
                          <Check size={14} />
                          Aprobar
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
