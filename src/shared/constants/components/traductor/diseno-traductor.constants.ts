import { Files, Folder, FolderInput } from "lucide-react";
import { FUNCIONALIDADES_HABILITADAS } from "@maximilian/shared/constants/funcionalidades.constants";

export const elementosMenuTraductor = [
  { name: "Mi Bandeja", icon: Folder, path: "/traductor/bandeja" },
  { name: "Informes", icon: Files, path: "/traductor/informes" },
  ...(FUNCIONALIDADES_HABILITADAS.migracionInformesCreador
    ? [{ name: "Migración de Informes", icon: FolderInput, path: "/traductor/migraciones" }]
    : []),
];
