import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomModalConfirmacionAccion } from "@maximilian/components/common/CustomModalConfirmacionAccion";
import PantallaCarga from "@maximilian/components/common/PantallaCarga";
import { CustomSelectorModoVistaRevision } from "@maximilian/components/coordinador/CustomSelectorModoVistaRevision";
import { CustomVisorRevisionInforme } from "@maximilian/components/coordinador/CustomVisorRevisionInforme";
import { useRevisionMigracionCoordinador } from "@maximilian/hooks/useRevisionMigracionCoordinador";

export default function RevisionMigracionCoordinador() {
  const revision = useRevisionMigracionCoordinador();

  if (!revision.esIdentificadorValido) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 p-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Informe no encontrado</h1>
          <p className="mt-2 text-sm text-slate-500">Abre el informe desde la bandeja de aprobación.</p>
          <CustomButton className="mt-6" onClick={revision.volverBandeja}>Volver a la bandeja</CustomButton>
        </div>
      </div>
    );
  }

  if (revision.modoVista === "formulario" && revision.estaCargandoInforme) {
    return <PantallaCarga message="Cargando información del informe..." />;
  }

  const esVistaDocumento = revision.modoVista === "documento";

  return (
    <>
      <CustomVisorRevisionInforme
        datosInvestigacion={revision.datosInvestigacion}
        idIdiomaMaestros={revision.idIdiomaInforme}
        accionesEncabezado={(
          <CustomSelectorModoVistaRevision
            modoVista={revision.modoVista}
            onModoVistaChange={revision.setModoVista}
          />
        )}
        encabezado={revision.encabezado}
        idInforme={esVistaDocumento ? revision.idInforme : undefined}
        idPedido={esVistaDocumento ? revision.idPedido : undefined}
        puedeDescargar={false}
        puedeEditar={!revision.estaAprobando}
        tituloInforme="Informe migrado"
        idiomaInforme={revision.registro?.idioma}
        tipoPlantilla={revision.registro?.plantilla}
        mostrarRechazar={false}
        mostrarPie
        ocuparAltoDisponible
        onCerrar={revision.volverBandeja}
        onDescargar={() => undefined}
        onAprobar={() => revision.setEstaAbiertoModalAprobar(true)}
        onRechazar={() => undefined}
        onVolver={revision.volverBandeja}
      />

      <CustomModalConfirmacionAccion
        isOpen={revision.estaAbiertoModalAprobar}
        onClose={revision.cerrarModalAprobar}
        onConfirm={revision.confirmarAprobacion}
        title="Aprobar informe migrado"
        descripcion="¿Estas seguro de que deseas aprobar este informe?"
        textoConfirmar="Aprobar"
        textoCargandoConfirmar="Aprobando..."
        varianteConfirmar="primary"
        isSubmitting={revision.estaAprobando}
      >
        <p>El informe migrado pasara al estado <span className="font-semibold">Aprobado</span>.</p>
      </CustomModalConfirmacionAccion>
    </>
  );
}
