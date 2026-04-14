import { X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import type { AssignmentRole, AssignmentRoleSelection } from "@maximilian/shared/types/assignment.type";

interface AssignmentModalProps {
  isOpen: boolean;
  selectedCount: number;
  assignments: AssignmentRoleSelection[];
  onClose: () => void;
  onOpenRolePicker: (role: AssignmentRole) => void;
  onSave: () => void;
  isSubmitting?: boolean;
}

const roleLabels: Record<AssignmentRole, string> = {
  analyst: "Analista",
  translator: "Traductor(a)",
};

export function AssignmentModal({
  isOpen,
  selectedCount,
  assignments,
  onClose,
  onOpenRolePicker,
  onSave,
  isSubmitting = false,
}: AssignmentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-brand-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-8 py-6">
          <h2 className="text-3xl font-bold text-brand-black">Asignación</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-brand-black cursor-pointer"
          >
            <X size={22} />
          </button>
        </div>

        <div className="space-y-8 px-8 py-6">
          <p className="text-2xl font-bold text-brand-black">Pedidos seleccionados: {selectedCount}</p>

          <div className="overflow-hidden rounded-2xl border border-gray-100">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-gray-400">Nro.</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Rol</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Asignado</th>
                  <th className="pr-3 pl-4 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {assignments.map((assignment, index) => {
                  const isAssigned = !!assignment.assignee;

                  return (
                    <tr key={assignment.role}>
                      <td className="px-6 py-5 text-center text-sm text-slate-500">{index + 1}</td>
                      <td className="px-6 py-5 text-xl font-bold text-brand-black">{roleLabels[assignment.role]}</td>
                      <td className="px-6 py-5">
                        {isAssigned ? (
                          <span className="text-sm text-slate-600">{assignment.assignee?.nombre}</span>
                        ) : (
                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-500">
                            Sin asignar
                          </span>
                        )}
                      </td>
                      <td className="pr-3 pl-4 py-5">
                        <div className="flex w-full justify-end">
                          <CustomButton
                            variant="wine"
                            size="compact"
                            className="min-w-28"
                            onClick={() => onOpenRolePicker(assignment.role)}
                          >
                            {isAssigned ? "Reasignar" : "Asignar"}
                          </CustomButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end gap-4 border-t border-gray-100 px-8 py-6">
          <CustomButton variant="secondary" size="compact" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </CustomButton>
          <CustomButton
            variant="wine"
            size="compact"
            onClick={onSave}
            loading={isSubmitting}
            loadingText="Guardando..."
            disabled={assignments.every((assignment) => !assignment.assignee)}
          >
            Guardar Cambios
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
