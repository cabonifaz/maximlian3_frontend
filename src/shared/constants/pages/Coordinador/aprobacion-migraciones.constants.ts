import { FileText, LayoutList } from "lucide-react";
import type { ModoVistaRevisionMigracion } from "@maximilian/shared/types/informe-aprobacion.type";

export const CLAVE_CONSULTA_INFORMES_PENDIENTES_APROBACION = "informes-pendientes-aprobacion";

export const CLAVE_CONSULTA_INFORME_REVISION_MIGRACION = "informe-obtener-revision-migracion";

export const MODO_VISTA_REVISION_MIGRACION_POR_DEFECTO: ModoVistaRevisionMigracion = "formulario";

export const OPCIONES_MODO_VISTA_REVISION_MIGRACION = [
  { id: "formulario", etiqueta: "Formulario", icono: LayoutList },
  { id: "documento", etiqueta: "Documento", icono: FileText },
] as const satisfies ReadonlyArray<{
  id: ModoVistaRevisionMigracion;
  etiqueta: string;
  icono: typeof FileText;
}>;
