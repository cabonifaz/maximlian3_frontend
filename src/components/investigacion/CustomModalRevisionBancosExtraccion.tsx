import { Check, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import type { RegistroBancoAnalista } from "@maximilian/shared/types/investigacion.type";

interface PropsCustomModalRevisionBancosExtraccion {
  bancos: RegistroBancoAnalista[];
  onAprobar: (indice: number) => void;
  onRechazar: (indice: number) => void;
  onCerrar: () => void;
}

export function CustomModalRevisionBancosExtraccion({
  bancos,
  onAprobar,
  onRechazar,
  onCerrar,
}: PropsCustomModalRevisionBancosExtraccion) {
  if (bancos.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-7 py-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8ea0c0]">Extracción</p>
            <h2 className="mt-2 text-xl font-bold text-slate-900">Cuentas bancarias detectadas</h2>
            <p className="mt-2 text-sm text-slate-500">
              Se identificaron cuentas bancarias nuevas. Revisa cada registro antes de agregarlo al informe.
            </p>
          </div>
          <CustomButton variant="ghost" size="icon" onClick={onCerrar}>
            <X size={18} />
          </CustomButton>
        </div>

        <div className="overflow-y-auto px-7 py-6">
          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="min-w-[560px] w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300">
                <tr>
                  <th className="px-4 py-3">Banco</th>
                  <th className="px-4 py-3">Número de Cuenta</th>
                  <th className="px-4 py-3">Sector</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {bancos.map((banco, indice) => (
                  <tr key={`${banco.banco}-${indice}`} className="transition-colors hover:bg-slate-50">
                    <td className="px-4 py-4 text-sm font-semibold text-slate-700">{banco.banco || "-"}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{banco.numeroCuenta || "-"}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{banco.sector || "-"}</td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
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
