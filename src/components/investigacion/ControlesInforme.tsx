import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Briefcase, Building2, Check, Eye, FileText, Landmark, LibraryBig, Lock, Paperclip, Sparkles, User, Users } from "lucide-react";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { CustomCampoFechaInvestigacion } from "@maximilian/components/investigacion/CustomCampoFechaInvestigacion";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
import { servicioTablaMaestra } from "@maximilian/services/tablaMaestra.service";
import {
  normalizarMontoDosDecimales,
  sanitizarMontoDosDecimales,
  seleccionarTextoCampoEditable,
} from "@maximilian/shared/utils/formato-monto.util";
import {
  obtenerDescripcionTablaMaestra,
  obtenerSiguienteNumTablaMaestra,
  type EntradaTablaMaestra,
  type TablaMaestraCrearRequest,
  type TablaMaestraGuardarResponse,
} from "@maximilian/shared/types/tabla-maestra.type";
import type { IdSeccionInvestigacionAnalista, ResumenInvestigacionAnalista } from "@maximilian/shared/types/investigacion.type";

const clasesEtiquetaCampoInvestigacion =
  "text-sm font-bold text-gray-700";

const marcadoresPorEtiqueta: Record<string, string> = {
  "Nombre de la Empresa": "Ingrese el nombre legal de la empresa",
  "Nombre Comercial": "Ingrese el nombre comercial",
  "Operaciones de Cambio": "Describa las operaciones de cambio",
  "Tipo de Identificación Fiscal": "Ingrese el tipo de identificación fiscal",
  "Número de Identificación Fiscal": "Ingrese el número de identificación fiscal",
  "Dirección Principal": "Ingrese la dirección principal",
  "Ciudad/Estado/Provincia": "Ingrese la ciudad, estado o provincia",
  "Número de Teléfono": "Ej. +51 2 1234567",
  "Número de Fax": "Ej. +51 2 1234568",
  "Correo Electrónico": "Ej. contacto@empresa.com",
  "Página Web": "Ej. www.empresa.com",
  "Estado Actual": "Describa el estado actual",
  "Datos Adicionales": "Ingrese datos adicionales relevantes",
  "Tipo de Empresa": "Ingrese el tipo de empresa",
  "Fecha de Constitución": "Ej. 31/12/2020",
  "Ciudad de Registro": "Ingrese la ciudad de registro",
  Notaría: "Ingrese la notaría correspondiente",
  Notario: "Ingrese el nombre del notario",
  Registro: "Ingrese el número o detalle de registro",
  Condiciones: "Describa las condiciones registrales o legales",
  "Operaciones de Cambio Divisas": "Describa las operaciones de cambio de divisas",
  "Capital Inicial": "Ej. 100000",
  "Capital Desembolsado": "Ej. 75000",
  "Última Ampliación": "Detalle la última ampliación de capital",
  "Patrimonio Neto": "Ej. 250000",
  "Tipo de Acciones": "Describa el tipo de acciones",
  "Valor de las Acciones": "Ej. 10.00",
  "Obligación en Bolsa": "Indique si cotiza o tiene obligación en bolsa",
  "Tipo de Cambio": "Ej. 6.96",
  Antecedentes: "Ingrese los antecedentes relevantes",
  "Aspectos Legales": "Describa los aspectos legales relevantes",
  "Comentarios sobre Empresas Relacionadas": "Ingrese comentarios sobre las empresas relacionadas",
  Sector: "Ingrese el sector económico",
  Actividad: "Ingrese la actividad económica",
  "Categoría CIIU": "Ej. Categoría C",
  "Clase CIIU": "Ej. 2811",
  "Actividad Principal": "Describa la actividad principal",
  "Ventas al Contado (%)": "Ej. 25%",
  "Detalle Ventas al Contado": "Describa cómo se realizan las ventas al contado",
  "Ventas a Crédito (%)": "Ej. 75%",
  "Detalle Ventas a Crédito": "Describa cómo se realizan las ventas a crédito",
  "(%) Ventas Nacionales": "Ej. 70%",
  "Detalle Ventas Nacionales": "Detalle las ventas realizadas en el mercado nacional",
  "(%) Ventas en el Extranjero": "Ej. 30%",
  "Detalle Ventas Extranjero": "Detalle las ventas realizadas en el extranjero",
  "(%) Compras Nacionales": "Ej. 65%",
  "Detalle Compras Nacionales": "Detalle las compras realizadas en el mercado nacional",
  "Compras al Contado Nacionales (%)": "Ej. 20%",
  "Detalle Compras al Contado Nacionales": "Describa cómo se realizan las compras al contado nacionales",
  "Compras a Crédito Nacionales (%)": "Ej. 80%",
  "Detalle Compras a Crédito Nacionales": "Describa cómo se realizan las compras a crédito nacionales",
  "(%) Compras en el Extranjero": "Ej. 35%",
  "Detalle Compras Extranjero": "Detalle las compras realizadas en el extranjero",
  "Compras al Contado Extranjero (%)": "Ej. 20%",
  "Detalle Compras al Contado Extranjero": "Describa cómo se realizan las compras al contado en el extranjero",
  "Compras a Crédito Extranjero (%)": "Ej. 80%",
  "Detalle Compras a Crédito Extranjero": "Describa cómo se realizan las compras a crédito en el extranjero",
  "N. de Empleados": "Ej. 120",
  "Detalle Empleados": "Describa la distribución o tipo de empleados",
  "Comentarios sobre las Operaciones": "Ingrese comentarios sobre las operaciones",
  Contenido: "Describa el contenido de la información financiera",
  "Comentarios Financieros": "Ingrese comentarios sobre la situación financiera",
  "Activos": "Describa los activos relevantes",
  Seguros: "Detalle las pólizas o coberturas de seguro",
  "Comentarios de los Proveedores": "Ingrese comentarios obtenidos de los proveedores",
  "Referencias de Bancos": "Ingrese las referencias bancarias consultadas",
  Litigios: "Describa litigios o procesos legales vigentes",
  "Riesgo Principal": "Describa el riesgo principal identificado",
  Superintendencia: "Ingrese información de la superintendencia o ente regulador",
  "Información General": "Ingrese la información general de la empresa",
  "Opinión de Crédito": "Redacte la opinión de crédito",
};

function obtenerMarcadorInvestigacion(etiqueta: string) {
  const marcador = marcadoresPorEtiqueta[etiqueta];
  if (marcador) return marcador;

  const etiquetaNormalizada = etiqueta.toLowerCase();

  if (etiquetaNormalizada.includes("correo")) return "Ej. usuario@empresa.com";
  if (etiquetaNormalizada.includes("página web")) return "Ej. www.empresa.com";
  if (etiquetaNormalizada.includes("telefono") || etiquetaNormalizada.includes("fax")) return "Ej. +51 2 1234567";
  if (etiquetaNormalizada.includes("fecha")) return "Ej. 31/12/2025";
  if (etiquetaNormalizada.includes("%")) return "Ej. 25%";
  if (etiquetaNormalizada.includes("monto") || etiquetaNormalizada.includes("capital") || etiquetaNormalizada.includes("valor")) {
    return "Ej. 100000";
  }
  if (
    etiquetaNormalizada.includes("comentario") ||
    etiquetaNormalizada.includes("detalle") ||
    etiquetaNormalizada.includes("descripción") ||
    etiquetaNormalizada.includes("información")
  ) {
    return `Ingrese ${etiquetaNormalizada}`;
  }

  return `Ingrese ${etiquetaNormalizada}`;
}

function normalizarPorcentajeDosDecimales(valor: string) {
  const valorLimpio = valor.trim().replace("%", "").replace(",", ".");
  if (!valorLimpio) return "";

  const numero = Number.parseFloat(valorLimpio);
  if (Number.isNaN(numero)) return valor;

  return numero.toFixed(2);
}

function sanitizarPorcentajeDosDecimales(valor: string) {
  const valorNormalizado = valor.replace(",", ".").replace(/[^0-9.]/g, "");
  const partes = valorNormalizado.split(".");
  const entero = partes[0] ?? "";
  const decimal = partes[1] ?? "";
  const valorCompuesto = partes.length > 1 ? `${entero}.${decimal.slice(0, 2)}` : entero;

  if (!valorCompuesto) return "";

  if (entero && Number.parseInt(entero, 10) > 100) {
    return "100";
  }

  if (valorCompuesto === "100" || valorCompuesto.startsWith("100.")) {
    return "100";
  }

  return valorCompuesto;
}

function sanitizarNumeroEntero(valor: string) {
  return valor.replace(/\D/g, "");
}

function crearOpcionTablaMaestra(num1: number, string1: string, num2: number | null = null): EntradaTablaMaestra {
  return {
    idEmpresa: 0,
    idTablaMaestra: null,
    idMaestro: 0,
    descripcion: "",
    num1,
    num2,
    num3: null,
    string1,
    string2: null,
    string3: null,
    date1: null,
    date2: null,
    date3: null,
  };
}

function normalizarTexto(valor: string) {
  return valor.trim().toLowerCase();
}

export function SelectorMaestroConAltaInvestigacionAnalista({
  etiqueta,
  valor,
  soloLectura,
  opcionesIniciales,
  opcionesTablaMaestra,
  idMaestro,
  marcador,
  onChange,
  adicionalEtiqueta,
  permiteAltaNueva = false,
  num2AltaNueva = null,
  conservarOpcionesLocales = true,
  obtenerEtiquetaOpcion,
  obtenerValorOpcion,
  ocultarEtiqueta = false,
  construirPayloadAltaNueva,
  renderizarVistaPreviaAltaNueva,
  puedeAgregarNuevo,
}: {
  etiqueta: string;
  valor: string;
  soloLectura: boolean;
  opcionesIniciales?: string[];
  opcionesTablaMaestra?: EntradaTablaMaestra[];
  idMaestro?: number;
  marcador?: string;
  onChange?: (valor: string) => void;
  adicionalEtiqueta?: ReactNode;
  permiteAltaNueva?: boolean;
  num2AltaNueva?: number | null;
  conservarOpcionesLocales?: boolean;
  obtenerEtiquetaOpcion?: (opcion: EntradaTablaMaestra) => string;
  obtenerValorOpcion?: (opcion: EntradaTablaMaestra) => string;
  ocultarEtiqueta?: boolean;
  construirPayloadAltaNueva?: (termino: string, opcionesActuales: EntradaTablaMaestra[]) => TablaMaestraCrearRequest;
  renderizarVistaPreviaAltaNueva?: (terminoBusqueda: string) => ReactNode;
  puedeAgregarNuevo?: (terminoBusqueda: string) => boolean;
}) {
  const queryClient = useQueryClient();
  const valorTextoActual = String(valor ?? "");
  const claveOpciones = `${idMaestro ?? "sin-maestro"}:${etiqueta}`;
  const opcionesBase = useMemo(
    () => opcionesTablaMaestra ?? (opcionesIniciales ?? []).map((opcion, indice) => crearOpcionTablaMaestra(indice + 1, opcion)),
    [opcionesIniciales, opcionesTablaMaestra],
  );
  const [estadoOpcionesLocales, setEstadoOpcionesLocales] = useState<{ clave: string; opciones: EntradaTablaMaestra[] }>(() => ({
    clave: claveOpciones,
    opciones: [],
  }));
  const obtenerValorSeleccion = useCallback(
    (opcion: EntradaTablaMaestra) => obtenerValorOpcion?.(opcion) || opcion.string1 || "",
    [obtenerValorOpcion],
  );
  const altaNuevaMutation = useMutation({
    mutationFn: async (termino: string): Promise<{
      opcion?: EntradaTablaMaestra;
      respuesta: TablaMaestraGuardarResponse | null;
      termino: string;
    }> => {
      if (!idMaestro) {
        return {
          opcion: undefined,
          respuesta: null,
          termino,
        };
      }

      const opcionesActuales = await queryClient.fetchQuery({
        queryKey: ["masterTable", idMaestro],
        queryFn: () => servicioTablaMaestra.list(idMaestro),
        staleTime: 0,
      });

      const payload: TablaMaestraCrearRequest = construirPayloadAltaNueva?.(termino, opcionesActuales) ?? {
          idMaestro,
          descripcion: obtenerDescripcionTablaMaestra(idMaestro),
          string1: termino,
          num1: obtenerSiguienteNumTablaMaestra(opcionesActuales),
          num2: num2AltaNueva,
          num3: null,
          string2: null,
          string3: null,
          date1: null,
          date2: null,
          date3: null,
        };

      const respuesta = await servicioTablaMaestra.crear(payload);
      await queryClient.invalidateQueries({ queryKey: ["masterTable", idMaestro] });
      const opcionesActualizadas = await queryClient.fetchQuery({
        queryKey: ["masterTable", idMaestro],
        queryFn: () => servicioTablaMaestra.list(idMaestro),
        staleTime: 0,
      });

      const terminoNormalizado = normalizarTexto(termino);
      const opcion =
        opcionesActualizadas.find((opcionActual) =>
          normalizarTexto(opcionActual.string1 ?? "") === normalizarTexto(payload.string1 ?? "")
          && normalizarTexto(opcionActual.string2 ?? "") === normalizarTexto(payload.string2 ?? "")
          && (payload.num2 == null || opcionActual.num2 === payload.num2)
        ) ??
        opcionesActualizadas.find((opcionActual) =>
          normalizarTexto(opcionActual.string1 ?? "") === terminoNormalizado
          && (num2AltaNueva == null || opcionActual.num2 === num2AltaNueva)
        ) ??
        opcionesActualizadas.find((opcionActual) => normalizarTexto(opcionActual.string1 ?? "") === terminoNormalizado) ??
        opcionesActualizadas.find((opcionActual) => normalizarTexto(opcionActual.descripcion ?? "") === terminoNormalizado);

      return {
        opcion,
        respuesta,
        termino,
      };
    },
  });

  const opcionesDisponibles = useMemo(() => {
    if (!permiteAltaNueva || !conservarOpcionesLocales) return opcionesBase;

    const opcionesLocales = estadoOpcionesLocales.clave === claveOpciones ? estadoOpcionesLocales.opciones : [];
    const opcionesExtras = opcionesLocales.filter(
      (opcionLocal) => !opcionesBase.some((opcionBase) => opcionBase.string1 === opcionLocal.string1),
    );
    const opcionesActuales = [...opcionesBase, ...opcionesExtras];
    const valorLimpio = valorTextoActual.trim();

    if (!valorLimpio || opcionesActuales.some((opcion) =>
      normalizarTexto(opcion.string1 ?? "") === normalizarTexto(valorLimpio)
      || normalizarTexto(obtenerValorSeleccion(opcion)) === normalizarTexto(valorLimpio)
    )) {
      return opcionesActuales;
    }

    const siguienteId = opcionesActuales.reduce((maximo, opcion) => Math.max(maximo, opcion.num1 ?? 0), 0) + 1;
    return [...opcionesActuales, crearOpcionTablaMaestra(siguienteId, valorLimpio)];
  }, [
    claveOpciones,
    conservarOpcionesLocales,
    estadoOpcionesLocales,
    obtenerValorSeleccion,
    opcionesBase,
    permiteAltaNueva,
    valorTextoActual,
  ]);

  const valorSeleccionado = useMemo(
    () => opcionesDisponibles.find((opcion) =>
      obtenerValorSeleccion(opcion) === valorTextoActual
      || opcion.string1 === valorTextoActual
      || opcion.string2 === valorTextoActual
      || String(opcion.num1 ?? "") === valorTextoActual
    )?.num1 ?? undefined,
    [obtenerValorSeleccion, opcionesDisponibles, valorTextoActual],
  );
  const opcionSeleccionada = useMemo(
    () => opcionesDisponibles.find((opcion) => opcion.num1 === valorSeleccionado),
    [opcionesDisponibles, valorSeleccionado],
  );
  const textoSeleccionado = opcionSeleccionada
    ? (obtenerEtiquetaOpcion?.(opcionSeleccionada) || opcionSeleccionada.string1 || "")
    : valorTextoActual;

  const manejarCambio = (nuevoValor: number) => {
    const opcion = opcionesDisponibles.find((opcionActual) => opcionActual.num1 === nuevoValor);
    const valorTexto = opcion ? obtenerValorSeleccion(opcion) : "";
    onChange?.(valorTexto);
  };

  const manejarAltaNuevo = (termino: string) => {
    const terminoLimpio = termino.trim();
    if (!terminoLimpio) return;

    if (!idMaestro) {
      setEstadoOpcionesLocales((anteriores) => {
        const opcionesActuales = anteriores.clave === claveOpciones ? anteriores.opciones : [];

        if (opcionesDisponibles.some((opcion) => opcion.string1 === terminoLimpio)) {
          return anteriores;
        }
        const siguienteId = opcionesDisponibles.reduce((maximo, opcion) => Math.max(maximo, opcion.num1 ?? 0), 0) + 1;
        return {
          clave: claveOpciones,
          opciones: [...opcionesActuales, crearOpcionTablaMaestra(siguienteId, terminoLimpio, num2AltaNueva)],
        };
      });
      onChange?.(terminoLimpio);
      return;
    }

    void altaNuevaMutation.mutateAsync(terminoLimpio).then(({ opcion, respuesta, termino }) => {
      if (opcion) {
        setEstadoOpcionesLocales((anteriores) => {
          const opcionesActuales = anteriores.clave === claveOpciones ? anteriores.opciones : [];

          if (opcionesDisponibles.some((opcionAnterior) => opcionAnterior.num1 === opcion.num1)) {
            return anteriores;
          }
          return { clave: claveOpciones, opciones: [...opcionesActuales, opcion] };
        });
      } else {
        setEstadoOpcionesLocales((anteriores) => {
          const opcionesActuales = anteriores.clave === claveOpciones ? anteriores.opciones : [];

          if (opcionesActuales.some((opcionAnterior) => normalizarTexto(opcionAnterior.string1 ?? "") === normalizarTexto(termino))) {
            return anteriores;
          }

          const siguienteId = respuesta?.idTablaMaestra ?? (opcionesDisponibles.reduce((maximo, opcionAnterior) => Math.max(maximo, opcionAnterior.num1 ?? 0), 0) + 1);
          return {
            clave: claveOpciones,
            opciones: [...opcionesActuales, crearOpcionTablaMaestra(siguienteId, termino, num2AltaNueva)],
          };
        });
      }
      onChange?.(opcion ? obtenerValorSeleccion(opcion) : termino);
    }).catch(() => {
      // La notificacion de error la maneja el interceptor global.
    });
  };

  return (
    <CustomSelectorBuscable
      key={claveOpciones}
      label={ocultarEtiqueta ? undefined : (
        <span className="inline-flex items-center gap-2">
          <span>{etiqueta}</span>
          {adicionalEtiqueta}
        </span>
      )}
      options={opcionesDisponibles}
      value={valorSeleccionado}
      displayValue={textoSeleccionado}
      onChange={manejarCambio}
      onClear={() => onChange?.("")}
      optional
      mostrarTextoOpcionalEnLabel={false}
      onAddNew={permiteAltaNueva ? manejarAltaNuevo : undefined}
      placeholder={marcador ?? `Seleccione ${etiqueta.toLowerCase()}`}
      disabled={soloLectura}
      obtenerEtiquetaOpcion={obtenerEtiquetaOpcion}
      renderizarVistaPreviaAltaNueva={renderizarVistaPreviaAltaNueva}
      puedeAgregarNuevo={puedeAgregarNuevo}
    />
  );
}

interface PropsCampoInvestigacionAnalista {
  etiqueta: string;
  valor: string;
  soloLectura: boolean;
  marcador?: string;
  className?: string;
  onChange?: (valor: string) => void;
  adicionalEtiqueta?: ReactNode;
  tipoEntrada?: "texto" | "email" | "url" | "fecha" | "decimal";
  error?: string;
  onBlur?: () => void;
  adornoFinal?: string;
}

interface PropsAreaInvestigacionAnalista extends PropsCampoInvestigacionAnalista {
  filas?: number;
}

interface PropsPestanasInvestigacionAnalista {
  opciones: Array<{ id: string; etiqueta: string; disabled?: boolean; tooltip?: string }>;
  valorActivo: string;
  onChange: (valor: string) => void;
}

interface PropsContenedorSeccionInvestigacionAnalista {
  numero: number;
  titulo: string;
  children: ReactNode;
  botonExtra?: ReactNode;
}

interface PropsMenuSeccionesInvestigacionAnalista {
  idSeccionActiva: IdSeccionInvestigacionAnalista;
  onSeleccionar: (id: IdSeccionInvestigacionAnalista) => void;
  estadoSecciones?: Partial<Record<IdSeccionInvestigacionAnalista, "borrador" | "completado">>;
  secciones: Array<{
    id: IdSeccionInvestigacionAnalista;
    titulo: string;
  }>;
}

interface PropsResumenPedidoInvestigacionAnalista {
  idPedido?: string;
  plantilla?: string;
  resumen: ResumenInvestigacionAnalista;
  esSoloLectura: boolean;
  mostrarBotonFinalizar: boolean;
  onFinalizarInvestigacion?: () => void;
  onExtraerInformacion?: () => void;
  onAbrirArchivos?: () => void;
  onVistaPrevia?: () => void;
  accionesSecundarias?: ReactNode;
  textoBotonArchivos?: string;
  textoBotonAccionIa?: string;
  textoBotonFinalizar?: string;
}

export function CampoInvestigacionAnalista({
  etiqueta,
  valor,
  soloLectura,
  marcador,
  className,
  onChange,
  adicionalEtiqueta,
  tipoEntrada = "texto",
  error,
  onBlur,
  adornoFinal,
}: PropsCampoInvestigacionAnalista) {
  const marcadorFinal = marcador ?? obtenerMarcadorInvestigacion(etiqueta);
  const esCampoPorcentaje = etiqueta.includes("%");
  const esCampoEntero = etiqueta === "N. de Empleados";
  const esCampoDecimal = tipoEntrada === "decimal";
  const clasesInput = `h-11 w-full rounded-xl border bg-white px-4 text-sm text-slate-600 outline-none transition-all focus:border-brand-black focus:ring-2 focus:ring-brand-black/5 read-only:bg-slate-50 read-only:text-slate-400 ${adornoFinal ? "pr-20" : ""} ${error ? "border-red-500" : "border-gray-200"}`;

  if (tipoEntrada === "fecha") {
    return (
      <CustomCampoFechaInvestigacion
        etiqueta={etiqueta}
        valor={valor}
        soloLectura={soloLectura}
        adicionalEtiqueta={adicionalEtiqueta}
        error={error}
        className={className}
        onChange={(nuevoValor) => onChange?.(nuevoValor)}
      />
    );
  }

  return (
    <label className={`space-y-2 ${className ?? ""}`}>
      <CustomLabel as="p" className={clasesEtiquetaCampoInvestigacion}>
        <span className="inline-flex items-center gap-2">
          <span>{etiqueta}</span>
          {adicionalEtiqueta}
        </span>
      </CustomLabel>
      <div className="relative">
        <input
          type={tipoEntrada === "email" ? "email" : "text"}
          value={valor}
          readOnly={soloLectura}
          onChange={(event) => {
            if (esCampoPorcentaje) {
              onChange?.(sanitizarPorcentajeDosDecimales(event.target.value));
              return;
            }

            if (esCampoEntero) {
              onChange?.(sanitizarNumeroEntero(event.target.value));
              return;
            }

            if (esCampoDecimal) {
              onChange?.(sanitizarMontoDosDecimales(event.target.value));
              return;
            }

            onChange?.(event.target.value);
          }}
          onBlur={(event) => {
            if (soloLectura || !onChange) return;

            if (esCampoPorcentaje) {
              onChange(normalizarPorcentajeDosDecimales(event.target.value));
            } else if (esCampoDecimal) {
              onChange(normalizarMontoDosDecimales(event.target.value));
            }

            onBlur?.();
          }}
          onFocus={seleccionarTextoCampoEditable}
          placeholder={marcadorFinal ?? ""}
          className={clasesInput}
        />
        {adornoFinal ? (
          <span className="pointer-events-none absolute right-2 top-1/2 flex h-7 -translate-y-1/2 items-center rounded-md bg-slate-900 px-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-sm">
            {adornoFinal}
          </span>
        ) : null}
      </div>
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </label>
  );
}

export function AreaInvestigacionAnalista({
  etiqueta,
  valor,
  soloLectura,
  marcador,
  filas = 4,
  className,
  onChange,
  adicionalEtiqueta,
}: PropsAreaInvestigacionAnalista) {
  const marcadorFinal = marcador ?? obtenerMarcadorInvestigacion(etiqueta);

  return (
    <label className={`space-y-2 ${className ?? ""}`}>
      <CustomLabel as="p" className={clasesEtiquetaCampoInvestigacion}>
        <span className="inline-flex items-center gap-2">
          <span>{etiqueta}</span>
          {adicionalEtiqueta}
        </span>
      </CustomLabel>
      <textarea
        value={valor}
        readOnly={soloLectura}
        onChange={(event) => onChange?.(event.target.value)}
        onFocus={seleccionarTextoCampoEditable}
        placeholder={marcadorFinal}
        rows={filas}
        className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-600 outline-none transition-all focus:border-brand-black focus:ring-2 focus:ring-brand-black/5 read-only:bg-slate-50 read-only:text-slate-400"
      />
    </label>
  );
}

export function PestanasInvestigacionAnalista({
  opciones,
  valorActivo,
  onChange,
}: PropsPestanasInvestigacionAnalista) {
  return (
    <div className="flex flex-wrap gap-6 border-b border-gray-100">
      {opciones.map((opcion) => {
        const activa = opcion.id === valorActivo;

        return (
          <div key={opcion.id} className="group relative">
            <button
              type="button"
              disabled={opcion.disabled}
              onClick={() => {
                if (opcion.disabled) return;
                onChange(opcion.id);
              }}
              className={`border-b-2 pb-3 text-xs font-bold uppercase tracking-[0.12em] transition-colors ${
                opcion.disabled
                  ? "cursor-not-allowed border-transparent text-slate-400"
                  : activa
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-600 hover:text-slate-800"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                {opcion.disabled ? <Lock size={12} /> : null}
                {opcion.etiqueta}
              </span>
            </button>
            {opcion.disabled && opcion.tooltip ? (
              <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-56 -translate-x-1/2 rounded-lg bg-brand-black px-3 py-2 text-center text-xs font-medium text-white shadow-lg group-hover:block">
                {opcion.tooltip}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function ContenedorSeccionInvestigacionAnalista({
  numero,
  titulo,
  children,
  botonExtra,
}: PropsContenedorSeccionInvestigacionAnalista) {
  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-red-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-red-400">
            Sección {numero}/8
          </span>
          <h2 className="text-2xl font-bold text-brand-black">{titulo}</h2>
        </div>
        {botonExtra}
      </div>
      {children}
    </section>
  );
}

export function MenuSeccionesInvestigacionAnalista({
  idSeccionActiva,
  onSeleccionar,
  estadoSecciones,
  secciones,
}: PropsMenuSeccionesInvestigacionAnalista) {
  const iconos = {
    identificacion: <User size={14} />,
    "aspectos-legales": <Briefcase size={14} />,
    "ramo-operaciones": <Sparkles size={14} />,
    "informacion-financiera": <LibraryBig size={14} />,
    balances: <FileText size={14} />,
    "bancos-proveedores": <Landmark size={14} />,
    "datos-generales": <Building2 size={14} />,
    "directorio-ejecutivo": <Users size={14} />,
  };

  return (
    <aside className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
        Secciones del Reporte
      </p>
      <div className="space-y-3">
        {secciones.map((seccion) => {
          const estaActiva = seccion.id === idSeccionActiva;
          const estadoSeccion = estadoSecciones?.[seccion.id];

          return (
            <div key={seccion.id} className="group relative">
              <button
                type="button"
                onClick={() => onSeleccionar(seccion.id)}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-all ${
                  estaActiva
                    ? "bg-[#eb5b53] text-white shadow-sm"
                    : "bg-slate-50 text-slate-500 hover:scale-[1.02] hover:bg-brand-wine/8 hover:text-brand-wine hover:shadow-sm active:scale-[0.98]"
                }`}
              >
                {iconos[seccion.id]}
                <span className="flex-1">{seccion.titulo}</span>
                {estadoSeccion === "completado" ? <Check size={16} className={estaActiva ? "text-white" : "text-emerald-500"} /> : null}
                {estadoSeccion === "borrador" ? <Eye size={16} className={estaActiva ? "text-white" : "text-amber-500"} /> : null}
              </button>
              {estadoSeccion === "borrador" ? (
                <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-52 -translate-x-1/2 rounded-lg bg-brand-black px-3 py-2 text-center text-xs font-medium text-white shadow-lg group-hover:block">
                  Te quedaste aquí. Guardamos esta sección como borrador para que la retomes cuando quieras.
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

export function ResumenPedidoInvestigacionAnalista({
  idPedido,
  plantilla,
  resumen,
  esSoloLectura,
  onExtraerInformacion,
  onAbrirArchivos,
  onVistaPrevia,
  accionesSecundarias,
  textoBotonArchivos = "Adjuntar archivos",
  textoBotonAccionIa = "Extraer Información",
}: PropsResumenPedidoInvestigacionAnalista) {
  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5">
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300">
            Datos del Pedido
          </p>

          <div className="grid gap-4 md:grid-cols-5">
            <div className="border-l-[4px] border-brand-black pl-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300">
                id Pedido
              </p>
              <p className="mt-1 text-sm font-bold text-slate-900">{idPedido ?? "-"}</p>
            </div>
            <div className="xl:border-l xl:border-gray-100 xl:pl-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300">Investigado</p>
              <p className="mt-1 text-sm font-bold text-slate-900">{resumen.nombreSolicitado}</p>
            </div>
            <div className="xl:border-l xl:border-gray-100 xl:pl-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300">Pais</p>
              <p className="mt-1 text-sm font-bold text-slate-900">{resumen.pais}</p>
            </div>
            <div className="xl:border-l xl:border-gray-100 xl:pl-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300">Tipo</p>
              <p className="mt-1 text-sm font-bold uppercase text-blue-500">{resumen.prioridad}</p>
            </div>
            <div className="xl:border-l xl:border-gray-100 xl:pl-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300">Plantilla</p>
              <p className="mt-1 text-sm font-bold text-slate-900">{plantilla || "-"}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onAbrirArchivos}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:scale-[1.02] hover:bg-slate-800 active:scale-[0.98]"
          >
            <Paperclip size={14} />
            {textoBotonArchivos}
          </button>
          {onVistaPrevia ? (
            <CustomButton
              variant="secondary"
              size="sm"
              onClick={onVistaPrevia}
            >
              <FileText size={14} />
              Vista previa
            </CustomButton>
          ) : null}
          {onExtraerInformacion ? (
            <CustomButton
              size="sm"
              disabled={esSoloLectura}
              className="bg-[#2563eb] text-white hover:bg-[#1d4ed8] shadow-md shadow-blue-500/20"
              onClick={onExtraerInformacion}
            >
              <Sparkles size={14} />
              {textoBotonAccionIa}
            </CustomButton>
          ) : null}
          {accionesSecundarias}
          
        </div>
      </div>
    </section>
  );
}
