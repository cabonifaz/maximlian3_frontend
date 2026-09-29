import { CustomModalConfirmacionAccion } from "@maximilian/components/common/CustomModalConfirmacionAccion";
import type { useAccionesAprobacionMigraciones } from "@maximilian/hooks/useAccionesAprobacionMigraciones";

interface PropsCustomModalesAprobacionMigraciones {
  acciones: ReturnType<typeof useAccionesAprobacionMigraciones>;
  totalRegistros: number;
  tieneFiltrosActivos: boolean;
}

export function CustomModalesAprobacionMigraciones({
  acciones,
  totalRegistros,
  tieneFiltrosActivos,
}: PropsCustomModalesAprobacionMigraciones) {
  const { cantidadSeleccionados } = acciones;
  const sufijoSeleccionados = cantidadSeleccionados === 1 ? "" : "s";
  const sufijoTotal = totalRegistros === 1 ? "" : "s";

  return (
    <>
      <CustomModalConfirmacionAccion
        isOpen={acciones.modalAbierto === "aprobar-seleccionados"}
        onClose={acciones.cerrarModal}
        onConfirm={acciones.aprobarSeleccionados}
        title="Aprobar informes"
        descripcion={`Se aprobarán ${cantidadSeleccionados} informe${sufijoSeleccionados} seleccionado${sufijoSeleccionados}.`}
        textoConfirmar="Aprobar informes"
        textoCargandoConfirmar="Aprobando..."
        varianteConfirmar="primary"
        isSubmitting={acciones.estaAprobandoSeleccionados}
      >
        <p>
          Los informes seleccionados pasarán al estado <span className="font-semibold">Aprobado</span>.
        </p>
      </CustomModalConfirmacionAccion>

      <CustomModalConfirmacionAccion
        isOpen={acciones.modalAbierto === "aprobar-todos"}
        onClose={acciones.cerrarModal}
        onConfirm={acciones.aprobarTodos}
        title="Aprobar todos los informes"
        descripcion={`Se aprobarán ${totalRegistros} informe${sufijoTotal} pendiente${sufijoTotal}${tieneFiltrosActivos ? " que cumplen los filtros aplicados" : ""}.`}
        textoConfirmar="Aprobar todo"
        textoCargandoConfirmar="Aprobando..."
        varianteConfirmar="primary"
        isSubmitting={acciones.estaAprobandoTodos}
      >
        <p>
          Todos estos informes pasarán al estado <span className="font-semibold">Aprobado</span>, incluidos los
          que no están en la página actual. Esta acción no se puede deshacer.
        </p>
      </CustomModalConfirmacionAccion>
    </>
  );
}
