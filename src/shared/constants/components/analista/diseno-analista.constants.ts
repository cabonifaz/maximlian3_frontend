import { Folder, FolderInput, LibraryBig } from "lucide-react";
import { FUNCIONALIDADES_HABILITADAS } from "@maximilian/shared/constants/funcionalidades.constants";

export const elementosMenuAnalista = [
  { name: "Mi Bandeja", icon: Folder, path: "/analista/bandeja" },
  ...(FUNCIONALIDADES_HABILITADAS.migracionInformesCreador
    ? [{ name: "Migración de Informes", icon: FolderInput, path: "/analista/migraciones" }]
    : []),
  { name: "Banco de Información", icon: LibraryBig, path: "/analista/banco-informacion" },
];
