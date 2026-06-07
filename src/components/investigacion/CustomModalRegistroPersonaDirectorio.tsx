import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { BadgeCheck, FileText, MapPin, UserRound, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
import { servicioDirectorioEjecutivo } from "@maximilian/services/directorioEjecutivo.service";
import { servicioTablaMaestra } from "@maximilian/services/tablaMaestra.service";
import type { DirectorioEjecutivoGuardarRequest } from "@maximilian/shared/types/directorio-ejecutivo.type";
import type { EntradaTablaMaestra } from "@maximilian/shared/types/tabla-maestra.type";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import type { RegistroPersonaDirectorioAnalista } from "@maximilian/shared/types/investigacion.type";
import { seleccionarTextoEditableEnContenedor } from "@maximilian/shared/utils/formato-monto.util";

interface PropsCustomModalRegistroPersonaDirectorioAnalista {
  estaAbierto: boolean;
  registroInicial?: RegistroPersonaDirectorioAnalista | null;
  nombreInicial?: string;
  onCerrar: () => void;
  onGuardar: (registro: RegistroPersonaDirectorioAnalista) => void;
}

const ID_MAESTRO_ESTADO_CIVIL = 55;
const ID_MAESTRO_PROFESION = 56;
const ID_MAESTRO_TIPO_DOCUMENTO = 54;

function obtenerTextoFormulario(formData: FormData, nombre: string) {
  return String(formData.get(nombre) ?? "").trim();
}

function obtenerIdFormulario(formData: FormData, nombre: string) {
  const valor = Number(formData.get(nombre));
  return Number.isFinite(valor) ? valor : 0;
}

function normalizarFechaApi(fecha: string) {
  return fecha ? `${fecha}T00:00:00.000Z` : null;
}

export function CustomModalRegistroPersonaDirectorioAnalista({
  estaAbierto,
  registroInicial,
  nombreInicial,
  onCerrar,
  onGuardar,
}: PropsCustomModalRegistroPersonaDirectorioAnalista) {
  const { data: opcionesTipoPersona } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.TIPO_PERSONA],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.TIPO_PERSONA),
    enabled: estaAbierto,
    staleTime: Infinity,
  });

  const { data: opcionesPais } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.PAIS],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.PAIS),
    enabled: estaAbierto,
    staleTime: Infinity,
  });

  const { data: opcionesTipoDocumento } = useQuery({
    queryKey: ["masterTable", ID_MAESTRO_TIPO_DOCUMENTO],
    queryFn: () => servicioTablaMaestra.list(ID_MAESTRO_TIPO_DOCUMENTO),
    enabled: estaAbierto,
    staleTime: Infinity,
  });

  const { data: opcionesTipoIdFiscal } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.TIPO_REG_TRIBUTARIO],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.TIPO_REG_TRIBUTARIO),
    enabled: estaAbierto,
    staleTime: Infinity,
  });

  const { data: opcionesEstadoCivil } = useQuery({
    queryKey: ["masterTable", ID_MAESTRO_ESTADO_CIVIL],
    queryFn: () => servicioTablaMaestra.list(ID_MAESTRO_ESTADO_CIVIL),
    enabled: estaAbierto,
    staleTime: Infinity,
  });

  const { data: opcionesProfesion } = useQuery({
    queryKey: ["masterTable", ID_MAESTRO_PROFESION],
    queryFn: () => servicioTablaMaestra.list(ID_MAESTRO_PROFESION),
    enabled: estaAbierto,
    staleTime: Infinity,
  });

  const opcionesNacionalidad = useMemo(
    () => opcionesPais?.map((opcion) => ({
      ...opcion,
      string1: opcion.string3 || opcion.string1,
    })),
    [opcionesPais],
  );

  const crearRegistroMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const registro: RegistroPersonaDirectorioAnalista = {
        id: registroInicial?.id ?? 0,
        idDirectorioEjecutivo: registroInicial?.idDirectorioEjecutivo,
        idTipoPersona: obtenerIdFormulario(formData, "idTipoPersona"),
        tipoPersona: obtenerTextoFormulario(formData, "tipoPersona"),
        nombres: obtenerTextoFormulario(formData, "nombres"),
        idPais: obtenerIdFormulario(formData, "idPais"),
        pais: obtenerTextoFormulario(formData, "pais"),
        direccionPrincipal: obtenerTextoFormulario(formData, "direccionPrincipal"),
        ciudadProvinciaEstado: obtenerTextoFormulario(formData, "ciudadProvinciaEstado"),
        codigoPostal: obtenerTextoFormulario(formData, "codigoPostal"),
        idNacionalidad: obtenerIdFormulario(formData, "idNacionalidad"),
        nacionalidad: obtenerTextoFormulario(formData, "nacionalidad"),
        idTipoDocumento: obtenerIdFormulario(formData, "idTipoDocumento"),
        tipoDocumentoIdentidad: obtenerTextoFormulario(formData, "tipoDocumentoIdentidad"),
        numeroDocumentoIdentidad: obtenerTextoFormulario(formData, "numeroDocumentoIdentidad"),
        taxIdType: obtenerIdFormulario(formData, "taxIdType"),
        tipoIdFiscal: obtenerTextoFormulario(formData, "tipoIdFiscal"),
        numeroIdFiscal: obtenerTextoFormulario(formData, "numeroIdFiscal"),
        fechaNacimiento: obtenerTextoFormulario(formData, "fechaNacimiento"),
        idEstadoCivil: obtenerIdFormulario(formData, "idEstadoCivil"),
        estadoCivil: obtenerTextoFormulario(formData, "estadoCivil"),
        idProfesion: obtenerIdFormulario(formData, "idProfesion"),
        profesion: obtenerTextoFormulario(formData, "profesion"),
        referenciaAdicional: obtenerTextoFormulario(formData, "referenciaAdicional"),
      };

      const payload: DirectorioEjecutivoGuardarRequest = {
        idTipoPersona: registro.idTipoPersona ?? 0,
        nombreCompleto: registro.nombres,
        idPais: registro.idPais ?? 0,
        direccion: registro.direccionPrincipal,
        ubigeo: registro.ciudadProvinciaEstado,
        codigoPostal: registro.codigoPostal,
        idTipoDocumento: registro.idTipoDocumento ?? 0,
        numeroDocumento: registro.numeroDocumentoIdentidad,
        taxIdType: registro.taxIdType ?? 0,
        taxNum: registro.numeroIdFiscal,
        idNacionalidad: registro.idNacionalidad ?? 0,
        fechaNacimiento: normalizarFechaApi(registro.fechaNacimiento),
        idEstadoCivil: registro.idEstadoCivil ?? 0,
        idProfesion: registro.idProfesion ?? 0,
        referencias: registro.referenciaAdicional,
      };

      const respuesta = registroInicial?.idDirectorioEjecutivo
        ? await servicioDirectorioEjecutivo.editar({
          ...payload,
          idDirectorioEjecutivo: registroInicial.idDirectorioEjecutivo,
        })
        : await servicioDirectorioEjecutivo.crear(payload);

      const idDirectorioEjecutivo = respuesta.idDirectorioEjecutivo ?? registroInicial?.idDirectorioEjecutivo ?? registroInicial?.id ?? Date.now();

      return {
        ...registro,
        id: idDirectorioEjecutivo,
        idDirectorioEjecutivo,
        idTipoPersona: payload.idTipoPersona,
        idPais: payload.idPais,
        idTipoDocumento: payload.idTipoDocumento,
        taxIdType: payload.taxIdType,
        idNacionalidad: payload.idNacionalidad,
        idEstadoCivil: payload.idEstadoCivil,
        idProfesion: payload.idProfesion,
      };
    },
    onSuccess: (registro) => {
      onGuardar(registro);
    },
  });

  if (!estaAbierto) return null;

  const tituloModal = registroInicial ? "Editar Empresa o Persona" : "Agregar Empresa o Persona";

  return (
    <div className="fixed inset-0 z-[98] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" onFocusCapture={seleccionarTextoEditableEnContenedor}>
      <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-6xl flex-col overflow-hidden rounded-[30px] bg-white shadow-[0_40px_100px_rgba(15,23,42,0.28)]">
        <div className="border-b border-slate-100 bg-[radial-gradient(circle_at_top_left,#f8fafc,white_55%)] px-6 py-6 md:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8ea0c0]">Registro de terceros</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">{tituloModal}</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Registre los datos base de la persona o empresa para reutilizarlos en el directorio ejecutivo.
              </p>
            </div>
            <CustomButton variant="ghost" size="icon" onClick={onCerrar} disabled={crearRegistroMutation.isPending}>
              <X size={20} className="text-[#8ea0c0]" />
            </CustomButton>
          </div>
        </div>

        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(event) => {
            event.preventDefault();
            crearRegistroMutation.mutate(new FormData(event.currentTarget));
          }}
        >
          <div className="space-y-5 overflow-y-auto bg-slate-50/35 px-6 py-6 md:px-8">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <EncabezadoSeccion icono={<UserRound size={18} />} titulo="Identificacion" subtitulo="Datos principales del registro" />
              <div className="grid gap-4 md:grid-cols-[0.9fr_2fr_1fr]">
                <CampoSelector nombre="tipoPersona" nombreId="idTipoPersona" etiqueta="Tipo de Persona" opciones={opcionesTipoPersona} valorDefecto={registroInicial?.tipoPersona} valorDefectoId={registroInicial?.idTipoPersona} marcadorVacio="Seleccione tipo persona" />
                <CampoInput nombre="nombres" etiqueta="Nombre Completo / Razón Social" marcador="Ingrese nombres completos" valorInicial={registroInicial?.nombres ?? nombreInicial} />
                <CampoInput nombre="fechaNacimiento" etiqueta="Fecha de Nacimiento" marcador="dd/mm/yyyy" valorInicial={registroInicial?.fechaNacimiento} tipo="date" />
              </div>
            </section>

          

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <EncabezadoSeccion icono={<FileText size={18} />} titulo="Documentos" subtitulo="Identificacion personal y fiscal" />
              <div className="grid gap-4 md:grid-cols-[0.9fr_1fr_1fr_1fr]">
                <CampoSelector nombre="tipoDocumentoIdentidad" nombreId="idTipoDocumento" etiqueta="Tipo Doc. Identidad" opciones={opcionesTipoDocumento} valorDefecto={registroInicial?.tipoDocumentoIdentidad} valorDefectoId={registroInicial?.idTipoDocumento} marcadorVacio="Seleccione tipo documento" />
                <CampoInput nombre="numeroDocumentoIdentidad" etiqueta="Nro. Doc. Identidad" marcador="Ingrese nro. documento" valorInicial={registroInicial?.numeroDocumentoIdentidad} />
                <CampoSelector nombre="tipoIdFiscal" nombreId="taxIdType" etiqueta="Tipo de ID Fiscal" opciones={opcionesTipoIdFiscal} valorDefecto={registroInicial?.tipoIdFiscal} valorDefectoId={registroInicial?.taxIdType} marcadorVacio="Seleccione tipo fiscal" />
                <CampoInput nombre="numeroIdFiscal" etiqueta="Nro ID Fiscal" marcador="Ingrese id fiscal" valorInicial={registroInicial?.numeroIdFiscal} />
              </div>
            </section>

  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <EncabezadoSeccion icono={<MapPin size={18} />} titulo="Ubicacion" subtitulo="Pais, nacionalidad y direccion" />
              <div className="grid gap-4 md:grid-cols-2">
                <CampoSelector nombre="pais" nombreId="idPais" etiqueta="País" opciones={opcionesPais} valorDefecto={registroInicial?.pais} valorDefectoId={registroInicial?.idPais} marcadorVacio="Seleccione un país" />
                <CampoSelector nombre="nacionalidad" nombreId="idNacionalidad" etiqueta="Nacionalidad" opciones={opcionesNacionalidad} valorDefecto={registroInicial?.nacionalidad} valorDefectoId={registroInicial?.idNacionalidad} marcadorVacio="Seleccione nacionalidad" />
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-[1.4fr_1fr_0.75fr]">
                <CampoInput nombre="direccionPrincipal" etiqueta="Dirección Principal" marcador="Ingrese dirección" valorInicial={registroInicial?.direccionPrincipal} />
                <CampoInput nombre="ciudadProvinciaEstado" etiqueta="Ciudad / Provincia / Estado" marcador="Ingrese ciudad" valorInicial={registroInicial?.ciudadProvinciaEstado} />
                <CampoInput nombre="codigoPostal" etiqueta="Código Postal" marcador="Ingrese código postal" valorInicial={registroInicial?.codigoPostal} />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <EncabezadoSeccion icono={<BadgeCheck size={18} />} titulo="Perfil" subtitulo="Informacion complementaria" />
              <div className="grid gap-4 md:grid-cols-2">
                <CampoSelector nombre="estadoCivil" nombreId="idEstadoCivil" etiqueta="Estado Civil" opciones={opcionesEstadoCivil} valorDefecto={registroInicial?.estadoCivil} valorDefectoId={registroInicial?.idEstadoCivil} marcadorVacio="Seleccione estado civil" />
                <CampoSelector nombre="profesion" nombreId="idProfesion" etiqueta="Profesión" opciones={opcionesProfesion} valorDefecto={registroInicial?.profesion} valorDefectoId={registroInicial?.idProfesion} marcadorVacio="Seleccione profesión" />
              </div>
              <div className="mt-4">
                <CampoArea
                  nombre="referenciaAdicional"
                  etiqueta="Referencia Adicional"
                  marcador="Ingrese notas o referencias adicionales pertinentes para este registro..."
                  valorInicial={registroInicial?.referenciaAdicional}
                />
              </div>
            </section>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 bg-white px-6 py-5 md:px-8">
            <CustomButton type="button" variant="secondary" size="sm" onClick={onCerrar} disabled={crearRegistroMutation.isPending}>
              Cancelar
            </CustomButton>
            <CustomButton type="submit" size="sm" loading={crearRegistroMutation.isPending} loadingText="Guardando...">
              Guardar
            </CustomButton>
          </div>
        </form>
      </div>
    </div>
  );
}

function CampoInput({
  nombre,
  etiqueta,
  marcador,
  tipo = "text",
  valorInicial,
}: {
  nombre: string;
  etiqueta: string;
  marcador: string;
  tipo?: "text" | "date";
  valorInicial?: string;
}) {
  return (
    <label className="space-y-2">
      <CustomLabel className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8ea0c0]">{etiqueta}</CustomLabel>
      <input
        name={nombre}
        type={tipo}
        defaultValue={valorInicial}
        placeholder={marcador}
        className="h-11 w-full rounded-lg border border-[#dbe4f0] bg-white px-4 text-sm text-slate-700 outline-none"
      />
    </label>
  );
}

function EncabezadoSeccion({
  icono,
  titulo,
  subtitulo,
}: {
  icono: React.ReactNode;
  titulo: string;
  subtitulo: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
        {icono}
      </div>
      <div>
        <p className="text-sm font-bold text-slate-800">{titulo}</p>
        <p className="text-xs text-slate-400">{subtitulo}</p>
      </div>
    </div>
  );
}

function CampoSelector({
  nombre,
  nombreId,
  etiqueta,
  opciones,
  valorDefecto,
  valorDefectoId,
  marcadorVacio = "Seleccione",
}: {
  nombre: string;
  nombreId: string;
  etiqueta: string;
  opciones: EntradaTablaMaestra[] | undefined;
  valorDefecto?: string;
  valorDefectoId?: number;
  marcadorVacio?: string;
}) {
  const [idSeleccionado, setIdSeleccionado] = useState<number | undefined>(valorDefectoId);

  useEffect(() => {
    setIdSeleccionado(valorDefectoId);
  }, [valorDefectoId]);

  useEffect(() => {
    if (idSeleccionado != null || !valorDefecto || !opciones?.length) return;
    const opcionPorTexto = opciones.find((opcion) => opcion.string1 === valorDefecto);
    setIdSeleccionado(opcionPorTexto?.num1 ?? undefined);
  }, [idSeleccionado, opciones, valorDefecto]);

  const textoSeleccionado = opciones?.find((opcion) => opcion.num1 === idSeleccionado)?.string1 ?? valorDefecto ?? "";

  return (
    <div className="space-y-2">
      <CustomLabel className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8ea0c0]">{etiqueta}</CustomLabel>
      <CustomSelectorBuscable
        options={opciones}
        value={idSeleccionado}
        displayValue={textoSeleccionado}
        onChange={setIdSeleccionado}
        onClear={() => setIdSeleccionado(undefined)}
        optional
        mostrarTextoOpcionalEnLabel={false}
        placeholder={marcadorVacio}
      />
      <input type="hidden" name={nombre} value={textoSeleccionado} />
      <input type="hidden" name={nombreId} value={idSeleccionado ?? ""} />
    </div>
  );
}

function CampoArea({
  nombre,
  etiqueta,
  marcador,
  valorInicial,
}: {
  nombre: string;
  etiqueta: string;
  marcador: string;
  valorInicial?: string;
}) {
  return (
    <label className="space-y-2">
      <CustomLabel className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#8ea0c0]">{etiqueta}</CustomLabel>
      <textarea
        name={nombre}
        rows={5}
        defaultValue={valorInicial}
        placeholder={marcador}
        className="w-full rounded-lg border border-[#dbe4f0] bg-white px-4 py-3 text-sm text-slate-700 outline-none"
      />
    </label>
  );
}
