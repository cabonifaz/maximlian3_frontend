import type { DatosFormularioUsuario } from "@maximilian/schemas";
import type {
  CreateUserRequest,
  DeleteUserRequest,
  UpdateUserRequest,
  UserDetails,
  UserListEntry,
} from "@maximilian/shared/types/usuario.type";
import type { EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";

export const normalizarTextoUsuario = (valor: string) =>
  valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

export function construirPayloadCrearUsuario(datosUsuario: DatosFormularioUsuario): CreateUserRequest {
  return {
    nombres: datosUsuario.nombres,
    apellidoPaterno: datosUsuario.apellidoPaterno,
    apellidoMaterno: datosUsuario.apellidoMaterno || null,
    usuarioCreacion: datosUsuario.usuarioCreacion,
    correo: datosUsuario.correo,
    roles: datosUsuario.roles as number[],
    idiomas: (datosUsuario.idiomas || []) as number[],
  };
}

export function construirPayloadActualizarUsuario(
  idUsuario: number,
  datosUsuario: DatosFormularioUsuario,
): UpdateUserRequest {
  return {
    idUsuario,
    nombres: datosUsuario.nombres,
    apellidoPaterno: datosUsuario.apellidoPaterno,
    apellidoMaterno: datosUsuario.apellidoMaterno || null,
    correo: datosUsuario.correo,
    roles: datosUsuario.roles as number[],
    idiomas: (datosUsuario.idiomas || []) as number[],
    idEstado: datosUsuario.activo ? 1 : 2,
  };
}

export function construirPayloadEliminarUsuario(idUsuario: number): DeleteUserRequest {
  return { idUsuarioEliminar: idUsuario };
}

export function obtenerIdsRolesDesdeListado(usuario: UserListEntry, rolesMaestros: EntradaTablaMaestra[]) {
  if (!usuario.roles) return [];

  const nombresRoles = usuario.roles.split(",").map(normalizarTextoUsuario).filter(Boolean);
  if (nombresRoles.length === 0) return [];

  return rolesMaestros
    .filter((rol) => rol.num1 !== null && nombresRoles.includes(normalizarTextoUsuario(rol.string1 ?? "")))
    .map((rol) => rol.num1!);
}

export function mapearDetalleUsuarioAFormulario(
  usuario: UserListEntry,
  detalle: UserDetails,
  rolesDesdeListado: number[],
): DatosFormularioUsuario {
  return {
    nombres: detalle.nombres || "",
    apellidoPaterno: detalle.apellidoPaterno || "",
    apellidoMaterno: detalle.apellidoMaterno || "",
    usuarioCreacion: usuario.usuario || "",
    correo: detalle.correo || "",
    roles: detalle.roles?.length ? detalle.roles : rolesDesdeListado,
    idiomas: detalle.idiomas || [],
    activo:
      detalle.idEstado !== undefined
        ? detalle.idEstado === 1
        : (detalle.estado ?? usuario.estado).toLowerCase() === "activo",
  };
}

export function mapearUsuarioInactivoAFormulario(
  usuario: UserListEntry,
  rolesDesdeListado: number[],
): DatosFormularioUsuario {
  return {
    nombres: usuario.nombres || "",
    apellidoPaterno: usuario.apellidoPaterno || "",
    apellidoMaterno: usuario.apellidoMaterno || "",
    usuarioCreacion: usuario.usuario || "",
    correo: usuario.correo || "",
    roles: rolesDesdeListado,
    idiomas: [],
    activo: false,
  };
}

export function mapearUsuarioEliminacionAFormulario(usuario: UserListEntry): DatosFormularioUsuario {
  return {
    nombres: usuario.nombres,
    apellidoPaterno: usuario.apellidoPaterno,
    apellidoMaterno: usuario.apellidoMaterno ?? undefined,
    usuarioCreacion: usuario.usuario,
    correo: usuario.correo,
    roles: usuario.roles ? usuario.roles.split(", ") : [],
    activo: usuario.estado.toLowerCase() === "activo",
  };
}
