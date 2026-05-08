import { type ReactNode, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams, useSearchParams } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  GripVertical,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { CustomModalBalanceAnalista } from "@maximilian/components/analista/CustomModalBalanceAnalista";
import { CustomModalBancoAnalista } from "@maximilian/components/analista/CustomModalBancoAnalista";
import { CustomModalArchivosInvestigacionAnalista } from "@maximilian/components/analista/CustomModalArchivosInvestigacionAnalista";
import { CustomModalBuscarEjecutivoAnalista } from "@maximilian/components/analista/CustomModalBuscarEjecutivoAnalista";
import { CustomModalDetalleCuentasAnalista } from "@maximilian/components/analista/CustomModalDetalleCuentasAnalista";
import { CustomModalFinalizarInvestigacionAnalista } from "@maximilian/components/analista/CustomModalFinalizarInvestigacionAnalista";
import { CustomModalExtraccionInformacionAnalista } from "@maximilian/components/analista/CustomModalExtraccionInformacionAnalista";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { CustomModalConfirmacionEliminacion } from "@maximilian/components/common/CustomModalConfirmacionEliminacion";
import { CustomModalListaPersonasAnalista } from "@maximilian/components/analista/CustomModalListaPersonasAnalista";
import { CustomModalLocalAnalista } from "@maximilian/components/analista/CustomModalLocalAnalista";
import { CustomModalOperacionAnalista } from "@maximilian/components/analista/CustomModalOperacionAnalista";
import { CustomModalProveedorAnalista } from "@maximilian/components/analista/CustomModalProveedorAnalista";
import { CustomModalRegistroEjecutivoAnalista } from "@maximilian/components/analista/CustomModalRegistroEjecutivoAnalista";
import { CustomModalRegistroPersonaDirectorioAnalista } from "@maximilian/components/analista/CustomModalRegistroPersonaDirectorioAnalista";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
import {
  AreaInvestigacionAnalista,
  CampoInvestigacionAnalista,
  ContenedorSeccionInvestigacionAnalista,
  MenuSeccionesInvestigacionAnalista,
  PestanasInvestigacionAnalista,
  ResumenPedidoInvestigacionAnalista,
} from "@maximilian/components/analista/ControlesInvestigacionAnalista";
import { servicioTablaMaestra } from "@maximilian/services/tablaMaestra.service";
import {
  obtenerDatosInvestigacionAnalista,
  seccionesInvestigacionAnalista,
} from "@maximilian/shared/utils/datos-simulados-analista";
import type {
  ArchivoInvestigacionAnalista,
  DatosInvestigacionAnalista,
  IdSeccionInvestigacionAnalista,
  ModoInvestigacionAnalista,
  PestanaAspectosLegales,
  PestanaBancosProveedores,
  PestanaRamoOperaciones,
  RegistroBancoAnalista,
  RegistroBalanceAnalista,
  RegistroDirectorioEjecutivoAnalista,
  RegistroPersonaDirectorioAnalista,
  RegistroProveedorAnalista,
  ResultadoBusquedaBancoAnalista,
} from "@maximilian/shared/types/analista.type";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";

interface PropsPantallaInvestigacionAnalista {
  idPedido?: string;
  modo: ModoInvestigacionAnalista;
}

const FILAS_POR_PAGINA_INVESTIGACION = 5;

function obtenerTotalPaginas(totalRegistros: number) {
  return Math.max(1, Math.ceil(totalRegistros / FILAS_POR_PAGINA_INVESTIGACION));
}

function paginarRegistros<T>(registros: T[], paginaActual: number) {
  const inicio = (paginaActual - 1) * FILAS_POR_PAGINA_INVESTIGACION;
  return registros.slice(inicio, inicio + FILAS_POR_PAGINA_INVESTIGACION);
}

function obtenerPorcentajeNumerico(valor?: string) {
  const numero = Number.parseFloat((valor ?? "").replace("%", "").replace(",", ".").trim());
  return Number.isNaN(numero) ? 0 : numero;
}

function formatearPorcentajeOchoDecimales(valor: number) {
  return `${valor.toFixed(8)}%`;
}

function PaginacionInvestigacion({
  paginaActual,
  totalRegistros,
  onPaginaChange,
  etiquetaRegistros,
  contenidoCentro,
}: {
  paginaActual: number;
  totalRegistros: number;
  onPaginaChange: (pagina: number) => void;
  etiquetaRegistros: string;
  contenidoCentro?: ReactNode;
}) {
  const totalPaginas = obtenerTotalPaginas(totalRegistros);
  const paginaSegura = Math.min(paginaActual, totalPaginas);
  const mostrando = totalRegistros === 0
    ? 0
    : Math.min(FILAS_POR_PAGINA_INVESTIGACION, totalRegistros - ((paginaSegura - 1) * FILAS_POR_PAGINA_INVESTIGACION));

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-white px-4 py-3">
      <p className="text-xs font-medium text-slate-400">
        Mostrando {mostrando} de {totalRegistros} {etiquetaRegistros}
      </p>

      {contenidoCentro ? (
        <div className="text-xs font-semibold text-slate-500">{contenidoCentro}</div>
      ) : <div />}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onPaginaChange(Math.max(1, paginaSegura - 1))}
          disabled={paginaSegura === 1}
          className="flex items-center gap-1 text-xs text-slate-500 transition-colors hover:text-brand-black disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ArrowLeft size={14} />
          Anterior
        </button>
        <span className="text-xs font-medium text-slate-400">
          {paginaSegura}/{totalPaginas}
        </span>
        <button
          type="button"
          onClick={() => onPaginaChange(Math.min(totalPaginas, paginaSegura + 1))}
          disabled={paginaSegura === totalPaginas}
          className="flex items-center gap-1 text-xs text-slate-500 transition-colors hover:text-brand-black disabled:cursor-not-allowed disabled:opacity-30"
        >
          Siguiente
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

function PantallaInvestigacionAnalista({ idPedido, modo }: PropsPantallaInvestigacionAnalista) {
  const navigate = useNavigate();
  const esSoloLectura = modo === "detalle";
  const contenedorPantallaRef = useRef<HTMLDivElement>(null);

  const datosIniciales = useMemo(() => obtenerDatosInvestigacionAnalista(modo), [modo]);

  const [datosInvestigacion, setDatosInvestigacion] = useState<DatosInvestigacionAnalista>(datosIniciales);
  const [idSeccionActiva, setIdSeccionActiva] = useState<IdSeccionInvestigacionAnalista>("identificacion");
  const [pestanaAspectosLegales, setPestanaAspectosLegales] = useState<PestanaAspectosLegales>("data");
  const [pestanaRamoOperaciones, setPestanaRamoOperaciones] = useState<PestanaRamoOperaciones>("operaciones");
  const [pestanaBancosProveedores, setPestanaBancosProveedores] = useState<PestanaBancosProveedores>("referencias");
  const [estadoSecciones, setEstadoSecciones] = useState<Partial<Record<IdSeccionInvestigacionAnalista, "borrador" | "completado">>>({});
  const [idTipoPersonaSeleccionado, setIdTipoPersonaSeleccionado] = useState<number | undefined>(undefined);
  const [idPaisSeleccionado, setIdPaisSeleccionado] = useState<number | undefined>(undefined);
  const [estaAbiertoModalCompanias, setEstaAbiertoModalCompanias] = useState(false);
  const [estaAbiertoModalOperacion, setEstaAbiertoModalOperacion] = useState(false);
  const [estaAbiertoModalLocal, setEstaAbiertoModalLocal] = useState(false);
  const [estaAbiertoModalBalance, setEstaAbiertoModalBalance] = useState(false);
  const [estaAbiertoModalDetalleBalance, setEstaAbiertoModalDetalleBalance] = useState(false);
  const [estaAbiertoModalProveedor, setEstaAbiertoModalProveedor] = useState(false);
  const [estaAbiertoModalBanco, setEstaAbiertoModalBanco] = useState(false);
  const [indiceOperacionSeleccionada, setIndiceOperacionSeleccionada] = useState<number | null>(null);
  const [indiceLocalSeleccionado, setIndiceLocalSeleccionado] = useState<number | null>(null);
  const [indiceBalanceSeleccionado, setIndiceBalanceSeleccionado] = useState<number | null>(null);
  const [indiceBalanceAEliminar, setIndiceBalanceAEliminar] = useState<number | null>(null);
  const [indiceProveedorSeleccionado, setIndiceProveedorSeleccionado] = useState<number | null>(null);
  const [indiceProveedorAEliminar, setIndiceProveedorAEliminar] = useState<number | null>(null);
  const [indiceBancoSeleccionado, setIndiceBancoSeleccionado] = useState<number | null>(null);
  const [indiceBancoAEliminar, setIndiceBancoAEliminar] = useState<number | null>(null);
  const [busquedaBalances, setBusquedaBalances] = useState("");
  const [paginaCompanias, setPaginaCompanias] = useState(1);
  const [paginaOperaciones, setPaginaOperaciones] = useState(1);
  const [paginaBalances, setPaginaBalances] = useState(1);
  const [paginaProveedores, setPaginaProveedores] = useState(1);
  const [paginaBancos, setPaginaBancos] = useState(1);
  const [paginaEjecutivos, setPaginaEjecutivos] = useState(1);
  const [filtroProveedorNombre, setFiltroProveedorNombre] = useState("");
  const [filtroProveedorTipo, setFiltroProveedorTipo] = useState("Todos");
  const [filtroProveedorContacto, setFiltroProveedorContacto] = useState("");
  const [filtroProveedorTelefono, setFiltroProveedorTelefono] = useState("");
  const [filtroBancoNombre, setFiltroBancoNombre] = useState("");
  const [filtroBancoCuenta, setFiltroBancoCuenta] = useState("");
  const [filtroBancoTelefono, setFiltroBancoTelefono] = useState("");
  const [filtroBancoSector] = useState("");
  const [estaAbiertoModalFinalizarInvestigacion, setEstaAbiertoModalFinalizarInvestigacion] = useState(false);
  const [estaAbiertoModalEjecutivo, setEstaAbiertoModalEjecutivo] = useState(false);
  const [estaAbiertoModalBuscarEjecutivo, setEstaAbiertoModalBuscarEjecutivo] = useState(false);
  const [estaAbiertoModalRegistroPersona, setEstaAbiertoModalRegistroPersona] = useState(false);
  const [estaAbiertoModalExtraccionInformacion, setEstaAbiertoModalExtraccionInformacion] = useState(false);
  const [estaAbiertoModalArchivosInvestigacion, setEstaAbiertoModalArchivosInvestigacion] = useState(false);
  const [alcanceExtraccionInformacion, setAlcanceExtraccionInformacion] = useState<"general" | "informacion-financiera">("general");
  const [tituloSeccionExtraccion, setTituloSeccionExtraccion] = useState("");
  const [archivosInvestigacion, setArchivosInvestigacion] = useState<ArchivoInvestigacionAnalista[]>([]);
  const [indiceEjecutivoSeleccionado, setIndiceEjecutivoSeleccionado] = useState<number | null>(null);
  const [indiceEjecutivoAEliminar, setIndiceEjecutivoAEliminar] = useState<number | null>(null);
  const [busquedaEjecutivo, setBusquedaEjecutivo] = useState("");
  const [personaDirectorioSeleccionada, setPersonaDirectorioSeleccionada] = useState<RegistroPersonaDirectorioAnalista | null>(null);
  const [registrosPersonaDirectorio, setRegistrosPersonaDirectorio] = useState<RegistroPersonaDirectorioAnalista[]>([
    {
      id: 1,
      tipoPersona: "Natural",
      nombres: "Juan Espinoza",
      pais: "México",
      direccionPrincipal: "Saltillo Centro",
      ciudadProvinciaEstado: "Coahuila",
      nacionalidad: "Mexicana",
      tipoDocumentoIdentidad: "DNI",
      numeroDocumentoIdentidad: "48752145",
      tipoIdFiscal: "RUC",
      numeroIdFiscal: "MX-2048752145",
      fechaNacimiento: "1985-03-04",
      estadoCivil: "Casado/a",
      profesion: "Administrador",
      referenciaAdicional: "",
    },
    {
      id: 2,
      tipoPersona: "Natural",
      nombres: "Reyes Andrade",
      pais: "México",
      direccionPrincipal: "Monterrey",
      ciudadProvinciaEstado: "Nuevo León",
      nacionalidad: "Mexicana",
      tipoDocumentoIdentidad: "DNI",
      numeroDocumentoIdentidad: "45871239",
      tipoIdFiscal: "RFC",
      numeroIdFiscal: "RANM850304",
      fechaNacimiento: "1988-08-12",
      estadoCivil: "Soltero/a",
      profesion: "Ingeniero",
      referenciaAdicional: "",
    },
  ]);

  const resultadosBusquedaBanco: ResultadoBusquedaBancoAnalista[] = [
    {
      nombres: "BBVA MEXICO SA, INSTITUCION DE BANCA MULTIPLE",
      tipoDocumento: "-",
      pais: "México",
      telefono: "(52-55) 2624.2007",
      existeInforme: "N",
    },
    {
      nombres: "BBVA MEXICO SA, INSTITUCION DE BANCA MULTIPLE, GRUPO FINANCIERO",
      tipoDocumento: "-",
      pais: "México",
      telefono: "(52-55) 5621-3434",
      existeInforme: "N",
    },
    {
      nombres: "BBVA MEXICO SA",
      tipoDocumento: "-",
      pais: "México",
      telefono: "(52-55) 2624.2007/5621.3434",
      existeInforme: "N",
    },
  ];

  const opcionesFiltroTipoProveedor = [
    { idEmpresa: 0, idTablaMaestra: null, idMaestro: 0, descripcion: "", num1: 1, num2: null, num3: null, string1: "Todos", string2: null, string3: null, date1: null, date2: null, date3: null },
    { idEmpresa: 0, idTablaMaestra: null, idMaestro: 0, descripcion: "", num1: 2, num2: null, num3: null, string1: "Nacional", string2: null, string3: null, date1: null, date2: null, date3: null },
    { idEmpresa: 0, idTablaMaestra: null, idMaestro: 0, descripcion: "", num1: 3, num2: null, num3: null, string1: "Extranjero", string2: null, string3: null, date1: null, date2: null, date3: null },
  ];

  const { data: opcionesTipoPersona } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.TIPO_PERSONA],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.TIPO_PERSONA),
    staleTime: Infinity,
  });

  const { data: opcionesPais } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.PAIS],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.PAIS),
    staleTime: Infinity,
  });

  const indiceSeccionActiva = seccionesInvestigacionAnalista.findIndex(
    (seccion) => seccion.id === idSeccionActiva,
  );
  const seccionActual = seccionesInvestigacionAnalista[indiceSeccionActiva];

  const actualizarIdentificacion = (campo: keyof DatosInvestigacionAnalista["identificacion"], valor: string) => {
    setDatosInvestigacion((anterior) => ({
      ...anterior,
      identificacion: {
        ...anterior.identificacion,
        [campo]: valor,
      },
    }));
  };

  const actualizarAspectosLegales = (campo: keyof DatosInvestigacionAnalista["aspectosLegales"], valor: string) => {
    setDatosInvestigacion((anterior) => ({
      ...anterior,
      aspectosLegales: {
        ...anterior.aspectosLegales,
        [campo]: valor,
      },
    }));
  };

  const actualizarOperacionPrincipal = (campo: keyof DatosInvestigacionAnalista["operacionPrincipal"], valor: string) => {
    setDatosInvestigacion((anterior) => ({
      ...anterior,
      operacionPrincipal: {
        ...anterior.operacionPrincipal,
        [campo]: valor,
      },
    }));
  };

  const formatearPorcentajeComplementario = (valor: number) => valor.toFixed(2);

  const esPorcentajeMayorACero = (valor?: string) => {
    const numero = Number.parseFloat((valor ?? "").trim().replace(",", "."));
    return !Number.isNaN(numero) && numero > 0;
  };

  const actualizarPorcentajesComplementarios = (
    campoOrigen: "ventasContadoPorcentaje" | "ventasCreditoPorcentaje" | "comprasNacionalesPorcentaje" | "comprasExtranjeroPorcentaje",
    campoComplementario: "ventasContadoPorcentaje" | "ventasCreditoPorcentaje" | "comprasNacionalesPorcentaje" | "comprasExtranjeroPorcentaje",
    valor: string,
  ) => {
    const valorLimpio = valor.trim();

    setDatosInvestigacion((anterior) => {
      const operacionPrincipal = {
        ...anterior.operacionPrincipal,
        [campoOrigen]: valor,
      };

      if (!valorLimpio) {
        operacionPrincipal[campoComplementario] = "";
        return {
          ...anterior,
          operacionPrincipal,
        };
      }

      const numero = Number.parseFloat(valorLimpio.replace(",", "."));
      if (Number.isNaN(numero) || numero < 0 || numero > 100) {
        return {
          ...anterior,
          operacionPrincipal,
        };
      }

      operacionPrincipal[campoComplementario] = formatearPorcentajeComplementario(100 - numero);

      return {
        ...anterior,
        operacionPrincipal,
      };
    });
  };

  const actualizarInformacionFinanciera = (
    campo: keyof DatosInvestigacionAnalista["informacionFinanciera"],
    valor: string,
  ) => {
    setDatosInvestigacion((anterior) => ({
      ...anterior,
      informacionFinanciera: {
        ...anterior.informacionFinanciera,
        [campo]: valor,
      },
    }));
  };

  const actualizarReferencias = (campo: keyof DatosInvestigacionAnalista["referencias"], valor: string) => {
    setDatosInvestigacion((anterior) => ({
      ...anterior,
      referencias: {
        ...anterior.referencias,
        [campo]: valor,
      },
    }));
  };

  const actualizarDatosGenerales = (campo: keyof DatosInvestigacionAnalista["datosGenerales"], valor: string) => {
    setDatosInvestigacion((anterior) => ({
      ...anterior,
      datosGenerales: {
        ...anterior.datosGenerales,
        [campo]: valor,
      },
    }));
  };

  const agregarCompaniaRelacionada = (empresaNueva: DatosInvestigacionAnalista["companiasRelacionadas"][number]) => {
    setDatosInvestigacion((anterior) => {
      const indiceExistente = anterior.companiasRelacionadas.findIndex(
        (empresa) => empresa.empresa === empresaNueva.empresa,
      );

      if (indiceExistente >= 0) {
        const companiasRelacionadas = [...anterior.companiasRelacionadas];
        companiasRelacionadas[indiceExistente] = empresaNueva;
        return {
          ...anterior,
          companiasRelacionadas,
        };
      }

      return {
        ...anterior,
        companiasRelacionadas: [...anterior.companiasRelacionadas, empresaNueva],
      };
    });
  };

  const pestanaRamoOperacionesVisible =
    pestanaRamoOperaciones === "exportaciones" && !esPorcentajeMayorACero(datosInvestigacion.operacionPrincipal.ventasExtranjeroPorcentaje)
      ? "operaciones"
      : pestanaRamoOperaciones === "importaciones" && !esPorcentajeMayorACero(datosInvestigacion.operacionPrincipal.comprasExtranjeroPorcentaje)
        ? "operaciones"
        : pestanaRamoOperaciones;

  const registrosOperacionActivos =
    pestanaRamoOperacionesVisible === "importaciones"
      ? datosInvestigacion.importaciones
      : pestanaRamoOperacionesVisible === "exportaciones"
        ? datosInvestigacion.exportaciones
        : [];

  const guardarOperacion = (registro: DatosInvestigacionAnalista["importaciones"][number]) => {
    setDatosInvestigacion((anterior) => {
      const clave = pestanaRamoOperacionesVisible === "importaciones" ? "importaciones" : "exportaciones";
      const listaActual = [...anterior[clave]];

      if (indiceOperacionSeleccionada != null) {
        listaActual[indiceOperacionSeleccionada] = registro;
      } else {
        listaActual.unshift(registro);
      }

      return {
        ...anterior,
        [clave]: listaActual,
      };
    });
    setIndiceOperacionSeleccionada(null);
    setEstaAbiertoModalOperacion(false);
  };

  const guardarLocal = (registro: DatosInvestigacionAnalista["locales"][number]) => {
    setDatosInvestigacion((anterior) => {
      const listaActual = [...anterior.locales];

      if (indiceLocalSeleccionado != null) {
        listaActual[indiceLocalSeleccionado] = registro;
      } else {
        listaActual.unshift(registro);
      }

      return {
        ...anterior,
        locales: listaActual,
      };
    });
    setIndiceLocalSeleccionado(null);
    setEstaAbiertoModalLocal(false);
  };

  const generarCodigoBalance = (balances: RegistroBalanceAnalista[]) => {
    const mayorCodigo = balances.reduce((mayor, balance) => {
      const numero = Number.parseInt(balance.codigo, 10);
      return Number.isNaN(numero) ? mayor : Math.max(mayor, numero);
    }, 23119);

    return String(mayorCodigo + 1);
  };

  const guardarBalance = (
    registro: Omit<RegistroBalanceAnalista, "codigo" | "periodo" | "balanceGeneral" | "perdidaGanancia" | "cuentas" | "detalleCuentas">,
  ) => {
    setDatosInvestigacion((anterior) => {
      const balances = [...anterior.balances];
      const tipoEstadoFinanciero = registro.tipoEstadoFinanciero ?? registro.tipo;
      const esGananciaPerdida = tipoEstadoFinanciero.includes("PG");
      const esBalanceGeneral = tipoEstadoFinanciero.includes("GN");

      const balanceActualizado: RegistroBalanceAnalista = indiceBalanceSeleccionado != null
        ? {
            ...balances[indiceBalanceSeleccionado],
            ...registro,
            periodo: registro.fechaInicio?.split("/")[2] ?? balances[indiceBalanceSeleccionado].periodo,
            balanceGeneral: esBalanceGeneral,
            perdidaGanancia: esGananciaPerdida,
            cuentas: true,
          }
        : {
            codigo: generarCodigoBalance(balances),
            periodo: registro.fechaInicio?.split("/")[2] ?? "",
            fecha: registro.fecha,
            tipo: registro.tipo,
            fechaInicio: registro.fechaInicio,
            fechaFin: registro.fechaFin,
            esActual: registro.esActual,
            tipoEstadoFinanciero: registro.tipoEstadoFinanciero,
            tipoCambio: registro.tipoCambio,
            operacionCambio: registro.operacionCambio,
            tipoBalance: registro.tipoBalance,
            balanceGeneral: esBalanceGeneral,
            perdidaGanancia: esGananciaPerdida,
            cuentas: true,
          };

      if (indiceBalanceSeleccionado != null) {
        balances[indiceBalanceSeleccionado] = balanceActualizado;
      } else {
        balances.unshift(balanceActualizado);
      }

      return {
        ...anterior,
        balances,
      };
    });

    setIndiceBalanceSeleccionado(null);
    setEstaAbiertoModalBalance(false);
  };

  const guardarDetalleCuentasBalance = (
    detalleCuentas: NonNullable<RegistroBalanceAnalista["detalleCuentas"]>,
  ) => {
    if (indiceBalanceSeleccionado == null) return;

    setDatosInvestigacion((anterior) => {
      const balances = [...anterior.balances];
      const balance = balances[indiceBalanceSeleccionado];

      if (!balance) {
        return anterior;
      }

      balances[indiceBalanceSeleccionado] = {
        ...balance,
        cuentas: true,
        detalleCuentas,
      };

      return {
        ...anterior,
        balances,
      };
    });

    setEstaAbiertoModalDetalleBalance(false);
  };

  const guardarProveedor = (registro: RegistroProveedorAnalista) => {
    setDatosInvestigacion((anterior) => {
      const proveedores = [...anterior.proveedores];
      if (indiceProveedorSeleccionado != null) {
        const proveedorActual = proveedores[indiceProveedorSeleccionado];
        proveedores[indiceProveedorSeleccionado] = {
          ...registro,
          contacto: proveedorActual?.contacto ?? registro.contacto,
          telefono: proveedorActual?.telefono ?? registro.telefono,
        };
      } else {
        proveedores.unshift(registro);
      }

      return {
        ...anterior,
        proveedores,
      };
    });

    setIndiceProveedorSeleccionado(null);
    setEstaAbiertoModalProveedor(false);
  };

  const guardarBanco = (registro: RegistroBancoAnalista) => {
    setDatosInvestigacion((anterior) => {
      const bancos = [...anterior.bancos];
      if (indiceBancoSeleccionado != null) {
        bancos[indiceBancoSeleccionado] = registro;
      } else {
        bancos.unshift(registro);
      }

      return {
        ...anterior,
        bancos,
      };
    });

    setIndiceBancoSeleccionado(null);
    setEstaAbiertoModalBanco(false);
  };

  const eliminarOperacionSeleccionada = () => {
    if (pestanaRamoOperacionesVisible === "locales") {
      if (indiceLocalSeleccionado == null) return;
      setDatosInvestigacion((anterior) => ({
        ...anterior,
        locales: anterior.locales.filter((_, indice) => indice !== indiceLocalSeleccionado),
      }));
      setIndiceLocalSeleccionado(null);
      return;
    }

    if (indiceOperacionSeleccionada == null) return;

    setDatosInvestigacion((anterior) => {
      const clave = pestanaRamoOperacionesVisible === "importaciones" ? "importaciones" : "exportaciones";
      return {
        ...anterior,
        [clave]: anterior[clave].filter((_, indice) => indice !== indiceOperacionSeleccionada),
      };
    });
    setIndiceOperacionSeleccionada(null);
  };

  const balancesFiltrados = datosInvestigacion.balances.filter((balance) => {
    const termino = busquedaBalances.trim().toLowerCase();
    if (!termino) return true;

    return [
      balance.codigo,
      balance.periodo,
      balance.fecha,
      balance.tipo,
    ].some((valor) => valor.toLowerCase().includes(termino));
  });

  const proveedoresFiltrados = datosInvestigacion.proveedores.filter((proveedor) => {
    const coincideNombre = !filtroProveedorNombre.trim() || proveedor.nombreEmpresa.toLowerCase().includes(filtroProveedorNombre.trim().toLowerCase());
    const coincideTipo = filtroProveedorTipo === "Todos" || proveedor.tipoProveedor === filtroProveedorTipo;
    const coincideContacto = !filtroProveedorContacto.trim() || proveedor.contacto.toLowerCase().includes(filtroProveedorContacto.trim().toLowerCase());
    const coincideTelefono = !filtroProveedorTelefono.trim() || proveedor.telefono.toLowerCase().includes(filtroProveedorTelefono.trim().toLowerCase());

    return coincideNombre && coincideTipo && coincideContacto && coincideTelefono;
  });

  const bancosFiltrados = datosInvestigacion.bancos.filter((banco) => {
    const coincideNombre = !filtroBancoNombre.trim() || banco.banco.toLowerCase().includes(filtroBancoNombre.trim().toLowerCase());
    const coincideCuenta = !filtroBancoCuenta.trim() || banco.numeroCuenta.toLowerCase().includes(filtroBancoCuenta.trim().toLowerCase());
    const coincideTelefono = !filtroBancoTelefono.trim() || banco.telefono.toLowerCase().includes(filtroBancoTelefono.trim().toLowerCase());
    const coincideSector = !filtroBancoSector.trim() || banco.sector.toLowerCase().includes(filtroBancoSector.trim().toLowerCase());

    return coincideNombre && coincideCuenta && coincideTelefono && coincideSector;
  });

  const exportacionesHabilitadas = esPorcentajeMayorACero(datosInvestigacion.operacionPrincipal.ventasExtranjeroPorcentaje);
  const importacionesHabilitadas = esPorcentajeMayorACero(datosInvestigacion.operacionPrincipal.comprasExtranjeroPorcentaje);

  const irASeccion = (direccion: "anterior" | "siguiente") => {
    const nuevoIndice = direccion === "anterior" ? indiceSeccionActiva - 1 : indiceSeccionActiva + 1;
    const seccionDestino = seccionesInvestigacionAnalista[nuevoIndice];
    if (seccionDestino) {
      if (direccion === "siguiente") {
        setEstadoSecciones((anterior) => ({
          ...anterior,
          [idSeccionActiva]: "completado",
        }));
      }
      setIdSeccionActiva(seccionDestino.id);
      requestAnimationFrame(() => {
        const contenedorPrincipal = document.querySelector("main");
        if (contenedorPrincipal instanceof HTMLElement) {
          contenedorPrincipal.scrollTo({ top: 0, behavior: "smooth" });
        }
        contenedorPantallaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };

  const guardarEjecutivo = (registro: Omit<RegistroDirectorioEjecutivoAnalista, "id">) => {
    const porcentajeRegistro = obtenerPorcentajeNumerico(registro.porcentaje);
    const totalSinRegistroActual = datosInvestigacion.directorioEjecutivo.reduce((total, ejecutivo, indice) => {
      if (indiceEjecutivoSeleccionado != null && indice === indiceEjecutivoSeleccionado) {
        return total;
      }
      return total + obtenerPorcentajeNumerico(ejecutivo.porcentaje);
    }, 0);

    if (totalSinRegistroActual + porcentajeRegistro > 100) {
      toast.error("La suma del porcentaje de participación no puede ser mayor a 100.");
      return;
    }

    setDatosInvestigacion((anterior) => {
      const directorioEjecutivo = [...anterior.directorioEjecutivo];

      if (indiceEjecutivoSeleccionado != null) {
        directorioEjecutivo[indiceEjecutivoSeleccionado] = {
          ...directorioEjecutivo[indiceEjecutivoSeleccionado],
          ...registro,
        };
      } else {
        directorioEjecutivo.unshift({
          id: Date.now(),
          ...registro,
          orden: String(directorioEjecutivo.length + 1),
        });
      }

      return {
        ...anterior,
        directorioEjecutivo,
      };
    });

    setIndiceEjecutivoSeleccionado(null);
    setPersonaDirectorioSeleccionada(null);
    setEstaAbiertoModalEjecutivo(false);
  };

  const completarPorcentajeEjecutivos = () => {
    if (datosInvestigacion.directorioEjecutivo.length === 0 || porcentajeRestanteEjecutivos <= 0) {
      return;
    }

    setDatosInvestigacion((anterior) => {
      const directorioEjecutivo = anterior.directorioEjecutivo.filter((ejecutivo) => ejecutivo.nombreCompleto !== "Otros");
      directorioEjecutivo.unshift({
        id: Date.now(),
        ejecutivo: "Otros",
        cargo: "-",
        porcentaje: formatearPorcentajeOchoDecimales(porcentajeRestanteEjecutivos),
        lista: false,
        detalleEjecutivo: false,
        orden: String(directorioEjecutivo.length + 1),
        vinculadoDesde: "",
        companiaAnterior: "",
        esParteDirectorio: false,
        pais: "",
        tipoPersona: "",
        descripcionBusqueda: "Otros",
        nombreCompleto: "Otros",
      });

      return {
        ...anterior,
        directorioEjecutivo,
      };
    });
  };

  const guardarPersonaDirectorio = (registro: Omit<RegistroPersonaDirectorioAnalista, "id">) => {
    const nuevoRegistro = {
      id: Date.now(),
      ...registro,
    };

    setRegistrosPersonaDirectorio((anterior) => [nuevoRegistro, ...anterior]);
    setPersonaDirectorioSeleccionada(nuevoRegistro);
    setEstaAbiertoModalRegistroPersona(false);
    setEstaAbiertoModalBuscarEjecutivo(false);
    setEstaAbiertoModalEjecutivo(true);
  };

  const ejecutivosFiltrados = datosInvestigacion.directorioEjecutivo.filter((ejecutivo) => {
    const termino = busquedaEjecutivo.trim().toLowerCase();
    if (!termino) return true;

    return [
      ejecutivo.ejecutivo,
      ejecutivo.cargo,
      ejecutivo.nombreCompleto,
      ejecutivo.descripcionBusqueda,
    ].some((valor) => valor.toLowerCase().includes(termino));
  });

  const companiasPaginadas = paginarRegistros(
    datosInvestigacion.companiasRelacionadas,
    Math.min(paginaCompanias, obtenerTotalPaginas(datosInvestigacion.companiasRelacionadas.length)),
  );
  const registrosLocalesPaginados = paginarRegistros(
    datosInvestigacion.locales,
    Math.min(paginaOperaciones, obtenerTotalPaginas(datosInvestigacion.locales.length)),
  );
  const registrosImportacionExportacionTabla = pestanaRamoOperacionesVisible === "importaciones"
    ? datosInvestigacion.importaciones
    : pestanaRamoOperacionesVisible === "exportaciones"
      ? datosInvestigacion.exportaciones
      : [];
  const registrosImportacionExportacionPaginados = paginarRegistros(
    registrosImportacionExportacionTabla,
    Math.min(paginaOperaciones, obtenerTotalPaginas(registrosImportacionExportacionTabla.length)),
  );
  const balancesPaginados = paginarRegistros(
    balancesFiltrados,
    Math.min(paginaBalances, obtenerTotalPaginas(balancesFiltrados.length)),
  );
  const proveedoresPaginados = paginarRegistros(
    proveedoresFiltrados,
    Math.min(paginaProveedores, obtenerTotalPaginas(proveedoresFiltrados.length)),
  );
  const bancosPaginados = paginarRegistros(
    bancosFiltrados,
    Math.min(paginaBancos, obtenerTotalPaginas(bancosFiltrados.length)),
  );
  const ejecutivosPaginados = paginarRegistros(
    ejecutivosFiltrados,
    Math.min(paginaEjecutivos, obtenerTotalPaginas(ejecutivosFiltrados.length)),
  );
  const totalPorcentajeEjecutivos = datosInvestigacion.directorioEjecutivo.reduce(
    (total, ejecutivo) => total + obtenerPorcentajeNumerico(ejecutivo.porcentaje),
    0,
  );
  const porcentajeRestanteEjecutivos = Math.max(0, 100 - totalPorcentajeEjecutivos);

  const abrirModalExtraccionInformacion = (
    alcance: "general" | "informacion-financiera",
    tituloSeccion?: string,
  ) => {
    setAlcanceExtraccionInformacion(alcance);
    setTituloSeccionExtraccion(tituloSeccion ?? "");
    setEstaAbiertoModalExtraccionInformacion(true);
  };

  const extraerInformacionDemo = async (archivos: File[], alcance: "general" | "informacion-financiera") => {
    const archivo = archivos[0];
    if (!archivo) return;

    const toastId = toast.loading(
      alcance === "general"
        ? "Extrayendo información del documento..."
        : "Extrayendo información financiera...",
    );

    await new Promise((resolve) => window.setTimeout(resolve, 1200));

    const fechaExtraccion = new Intl.DateTimeFormat("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date());

    setDatosInvestigacion((anterior) => ({
      ...anterior,
      informacionFinanciera: {
        contenido: `Información simulada extraída del archivo ${archivo.name}. Se identificó contenido financiero con referencias a estados de resultados, composición de activos y estructura operativa de la empresa.`,
        comentariosFinancieros: "El documento sugiere un comportamiento financiero estable, con continuidad operativa y referencias consistentes para elaborar el análisis financiero preliminar.",
        activosFijos: `Se detectan activos fijos asociados a infraestructura operativa, mobiliario y equipamiento relevante. Extracción demo procesada el ${fechaExtraccion}.`,
        seguros: "Se identifican menciones a coberturas patrimoniales y operativas. En la integración real, aquí se resumirían las pólizas, vigencias y riesgos cubiertos.",
      },
    }));

    toast.success(
      alcance === "general"
        ? "Demo aplicada: se completó la sección Información Financiera."
        : "Se completó la sección Información Financiera.",
      { id: toastId },
    );
  };

  const botonExtraSeccion = !esSoloLectura ? (
    <CustomButton
      variant="secondary"
      size="sm"
      className="border-blue-300 text-blue-600"
      onClick={() => abrirModalExtraccionInformacion(idSeccionActiva === "informacion-financiera" ? "informacion-financiera" : "general", seccionActual.titulo)}
    >
      <Sparkles size={14} />
      Extraer Información
    </CustomButton>
  ) : undefined;

  const renderizarIdentificacion = () => (
    <div className="grid gap-5 md:grid-cols-2">
      <CustomSelectorBuscable
        label="Tipo de Persona"
        options={opcionesTipoPersona}
        value={idTipoPersonaSeleccionado}
        displayValue={idTipoPersonaSeleccionado == null ? datosInvestigacion.identificacion.tipoPersona : undefined}
        onChange={(valor) => {
          setIdTipoPersonaSeleccionado(valor);
          const etiqueta = opcionesTipoPersona?.find((opcion) => opcion.num1 === valor)?.string1 ?? "";
          actualizarIdentificacion("tipoPersona", etiqueta);
        }}
        disabled={esSoloLectura}
      />
      <CampoInvestigacionAnalista etiqueta="Nombre de la Empresa" valor={datosInvestigacion.identificacion.nombreEmpresa} soloLectura={esSoloLectura} onChange={(valor) => actualizarIdentificacion("nombreEmpresa", valor)} />
      <CampoInvestigacionAnalista etiqueta="Nombre Comercial" valor={datosInvestigacion.identificacion.nombreComercial} soloLectura={esSoloLectura} onChange={(valor) => actualizarIdentificacion("nombreComercial", valor)} />
      <CustomSelectorBuscable
        label="País"
        options={opcionesPais}
        value={idPaisSeleccionado}
        displayValue={idPaisSeleccionado == null ? datosInvestigacion.identificacion.pais : undefined}
        onChange={(valor) => {
          setIdPaisSeleccionado(valor);
          const etiqueta = opcionesPais?.find((opcion) => opcion.num1 === valor)?.string1 ?? "";
          actualizarIdentificacion("pais", etiqueta);
        }}
        disabled={esSoloLectura}
      />
      <CampoInvestigacionAnalista etiqueta="Operaciones de Cambio" valor={datosInvestigacion.identificacion.operacionesCambio} soloLectura={esSoloLectura} onChange={(valor) => actualizarIdentificacion("operacionesCambio", valor)} />
      <CampoInvestigacionAnalista etiqueta="Tipo de Identificación Fiscal" valor={datosInvestigacion.identificacion.tipoIdentificacionFiscal} soloLectura={esSoloLectura} onChange={(valor) => actualizarIdentificacion("tipoIdentificacionFiscal", valor)} />
      <CampoInvestigacionAnalista etiqueta="Número de Identificación Fiscal" valor={datosInvestigacion.identificacion.numeroIdentificacionFiscal} soloLectura={esSoloLectura} onChange={(valor) => actualizarIdentificacion("numeroIdentificacionFiscal", valor)} />
      <CampoInvestigacionAnalista etiqueta="Dirección Principal" valor={datosInvestigacion.identificacion.direccionPrincipal} soloLectura={esSoloLectura} onChange={(valor) => actualizarIdentificacion("direccionPrincipal", valor)} />
      <CampoInvestigacionAnalista etiqueta="Ciudad/Estado/Provincia" valor={datosInvestigacion.identificacion.ciudadEstadoProvincia} soloLectura={esSoloLectura} onChange={(valor) => actualizarIdentificacion("ciudadEstadoProvincia", valor)} />
      <CampoInvestigacionAnalista etiqueta="Número de Teléfono" valor={datosInvestigacion.identificacion.numeroTelefono} soloLectura={esSoloLectura} onChange={(valor) => actualizarIdentificacion("numeroTelefono", valor)} />
      <CampoInvestigacionAnalista etiqueta="Número de Fax" valor={datosInvestigacion.identificacion.numeroFax} soloLectura={esSoloLectura} onChange={(valor) => actualizarIdentificacion("numeroFax", valor)} />
      <CampoInvestigacionAnalista etiqueta="Correo Electrónico" valor={datosInvestigacion.identificacion.correoElectronico} soloLectura={esSoloLectura} onChange={(valor) => actualizarIdentificacion("correoElectronico", valor)} />
      <CampoInvestigacionAnalista etiqueta="Página Web" valor={datosInvestigacion.identificacion.paginaWeb} soloLectura={esSoloLectura} onChange={(valor) => actualizarIdentificacion("paginaWeb", valor)} />
      <CampoInvestigacionAnalista etiqueta="Estado Actual" valor={datosInvestigacion.identificacion.estadoActual} soloLectura={esSoloLectura} onChange={(valor) => actualizarIdentificacion("estadoActual", valor)} />
      <AreaInvestigacionAnalista etiqueta="Datos Adicionales" valor={datosInvestigacion.identificacion.datosAdicionales} soloLectura={esSoloLectura} className="md:col-span-2" onChange={(valor) => actualizarIdentificacion("datosAdicionales", valor)} />
    </div>
  );

  const renderizarAspectosLegales = () => {
    if (pestanaAspectosLegales === "companias") {
      return (
        <div className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="relative w-full max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
              <input className="h-10 w-full rounded-xl border border-gray-200 pl-9 pr-3 text-sm text-slate-500 outline-none" placeholder="Buscar compañía..." />
            </label>
            <button
              type="button"
              disabled={esSoloLectura}
              onClick={() => setEstaAbiertoModalCompanias(true)}
              className="rounded-xl bg-brand-black px-4 py-2 text-sm font-bold text-white transition-all hover:scale-[1.02] hover:bg-brand-black/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
            >
              + Agregar Compañía
            </button>
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-100">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300">
                <tr>
                  <th className="px-4 py-3">Empresa</th>
                  <th className="px-4 py-3">ID Fiscal</th>
                  <th className="px-4 py-3">País</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {companiasPaginadas.map((empresa) => (
                  <tr key={`${empresa.empresa}-${empresa.idFiscal}`}>
                    <td className="px-4 py-4 text-sm font-semibold text-slate-700">{empresa.empresa}</td>
                    <td className="px-4 py-4 text-sm text-slate-400">{empresa.idFiscal}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{empresa.pais}</td>
                    <td className="px-4 py-4 text-right text-slate-400">
                      <Pencil size={14} className="ml-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginacionInvestigacion
            paginaActual={paginaCompanias}
            totalRegistros={datosInvestigacion.companiasRelacionadas.length}
            onPaginaChange={setPaginaCompanias}
            etiquetaRegistros="companias"
          />
        </div>
      );
    }

    return (
      <div className="grid gap-5 md:grid-cols-2">
        <CampoInvestigacionAnalista etiqueta="Tipo de Empresa" valor={datosInvestigacion.aspectosLegales.tipoEmpresa} soloLectura={esSoloLectura} onChange={(valor) => actualizarAspectosLegales("tipoEmpresa", valor)} />
        <CampoInvestigacionAnalista etiqueta="Fecha de Constitución" valor={datosInvestigacion.aspectosLegales.fechaConstitucion} soloLectura={esSoloLectura} onChange={(valor) => actualizarAspectosLegales("fechaConstitucion", valor)} />
        <CampoInvestigacionAnalista etiqueta="Ciudad de Registro" valor={datosInvestigacion.aspectosLegales.ciudadRegistro} soloLectura={esSoloLectura} onChange={(valor) => actualizarAspectosLegales("ciudadRegistro", valor)} />
        <CampoInvestigacionAnalista etiqueta="Notaría" valor={datosInvestigacion.aspectosLegales.notaria} soloLectura={esSoloLectura} onChange={(valor) => actualizarAspectosLegales("notaria", valor)} />
        <CampoInvestigacionAnalista etiqueta="Notario" valor={datosInvestigacion.aspectosLegales.notario} soloLectura={esSoloLectura} onChange={(valor) => actualizarAspectosLegales("notario", valor)} />
        <CampoInvestigacionAnalista etiqueta="Registro" valor={datosInvestigacion.aspectosLegales.registro} soloLectura={esSoloLectura} onChange={(valor) => actualizarAspectosLegales("registro", valor)} />
        <CampoInvestigacionAnalista etiqueta="Condiciones" valor={datosInvestigacion.aspectosLegales.condiciones} soloLectura={esSoloLectura} onChange={(valor) => actualizarAspectosLegales("condiciones", valor)} />
        <CampoInvestigacionAnalista etiqueta="Operaciones de Cambio Divisas" valor={datosInvestigacion.aspectosLegales.operacionesCambioDivisas} soloLectura={esSoloLectura} onChange={(valor) => actualizarAspectosLegales("operacionesCambioDivisas", valor)} />
        <CampoInvestigacionAnalista etiqueta="Capital Inicial" valor={datosInvestigacion.aspectosLegales.capitalInicial} soloLectura={esSoloLectura} onChange={(valor) => actualizarAspectosLegales("capitalInicial", valor)} />
        <CampoInvestigacionAnalista etiqueta="Capital Desembolsado" valor={datosInvestigacion.aspectosLegales.capitalDesembolsado} soloLectura={esSoloLectura} onChange={(valor) => actualizarAspectosLegales("capitalDesembolsado", valor)} />
        <CampoInvestigacionAnalista etiqueta="Última Ampliación" valor={datosInvestigacion.aspectosLegales.ultimaAmpliacion} soloLectura={esSoloLectura} onChange={(valor) => actualizarAspectosLegales("ultimaAmpliacion", valor)} />
        <CampoInvestigacionAnalista etiqueta="Patrimonio Neto" valor={datosInvestigacion.aspectosLegales.patrimonioNeto} soloLectura={esSoloLectura} onChange={(valor) => actualizarAspectosLegales("patrimonioNeto", valor)} />
        <CampoInvestigacionAnalista etiqueta="Tipo de Acciones" valor={datosInvestigacion.aspectosLegales.tipoAcciones} soloLectura={esSoloLectura} onChange={(valor) => actualizarAspectosLegales("tipoAcciones", valor)} />
        <CampoInvestigacionAnalista etiqueta="Valor de las Acciones" valor={datosInvestigacion.aspectosLegales.valorAcciones} soloLectura={esSoloLectura} onChange={(valor) => actualizarAspectosLegales("valorAcciones", valor)} />
        <CampoInvestigacionAnalista etiqueta="Obligación en Bolsa" valor={datosInvestigacion.aspectosLegales.obligacionBolsa} soloLectura={esSoloLectura} onChange={(valor) => actualizarAspectosLegales("obligacionBolsa", valor)} />
        <CampoInvestigacionAnalista etiqueta="Tipo de Cambio" valor={datosInvestigacion.aspectosLegales.tipoCambio} soloLectura={esSoloLectura} onChange={(valor) => actualizarAspectosLegales("tipoCambio", valor)} />
        <AreaInvestigacionAnalista etiqueta="Antecedentes" valor={datosInvestigacion.aspectosLegales.antecedentes} soloLectura={esSoloLectura} className="md:col-span-2" onChange={(valor) => actualizarAspectosLegales("antecedentes", valor)} />
        <AreaInvestigacionAnalista etiqueta="Aspectos Legales" valor={datosInvestigacion.aspectosLegales.aspectosLegales} soloLectura={esSoloLectura} className="md:col-span-2" onChange={(valor) => actualizarAspectosLegales("aspectosLegales", valor)} />
        <AreaInvestigacionAnalista etiqueta="Comentarios sobre Empresas Relacionadas" valor={datosInvestigacion.aspectosLegales.comentariosEmpresasRelacionadas} soloLectura={esSoloLectura} className="md:col-span-2" onChange={(valor) => actualizarAspectosLegales("comentariosEmpresasRelacionadas", valor)} />
      </div>
    );
  };

  const renderizarRamoOperaciones = () => {
    if (pestanaRamoOperacionesVisible === "importaciones" || pestanaRamoOperacionesVisible === "exportaciones" || pestanaRamoOperacionesVisible === "locales") {
      const tituloBoton = pestanaRamoOperacionesVisible === "locales" ? "Agregar Local" : "Nuevo";
      return (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <CustomButton
              size="sm"
              disabled={esSoloLectura}
              onClick={() => {
                if (pestanaRamoOperacionesVisible === "locales") {
                  setIndiceLocalSeleccionado(null);
                  setEstaAbiertoModalLocal(true);
                  return;
                }

                setIndiceOperacionSeleccionada(null);
                setEstaAbiertoModalOperacion(true);
              }}
            >
              <Plus size={14} />
              {tituloBoton}
            </CustomButton>
            <CustomButton
              size="sm"
              disabled={
                esSoloLectura ||
                (pestanaRamoOperacionesVisible === "locales"
                  ? indiceLocalSeleccionado == null
                  : indiceOperacionSeleccionada == null)
              }
              onClick={() => {
                if (pestanaRamoOperacionesVisible === "locales") {
                  setEstaAbiertoModalLocal(true);
                  return;
                }

                setEstaAbiertoModalOperacion(true);
              }}
            >
              <Pencil size={14} />
              Editar
            </CustomButton>
            <CustomButton
              size="sm"
              disabled={
                esSoloLectura ||
                (pestanaRamoOperacionesVisible === "locales"
                  ? indiceLocalSeleccionado == null
                  : indiceOperacionSeleccionada == null)
              }
              onClick={eliminarOperacionSeleccionada}
            >
              <Trash2 size={14} />
              Eliminar
            </CustomButton>
            <label className="ml-auto flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-300">
              Buscar
              <input className="h-10 rounded-xl border border-gray-200 px-3 text-sm normal-case tracking-normal text-slate-500 outline-none" />
            </label>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-100">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300">
                {pestanaRamoOperacionesVisible === "locales" ? (
                  <tr>
                    <th className="px-4 py-3">Tipo Local</th>
                    <th className="px-4 py-3">Comentario</th>
                    <th className="px-4 py-3">Imagen Local</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-4 py-3">Año</th>
                    <th className="px-4 py-3">Moneda</th>
                    <th className="px-4 py-3">Países</th>
                    <th className="px-4 py-3">Productos</th>
                    <th className="px-4 py-3">Monto</th>
                    <th className="px-4 py-3">Operaciones</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {(pestanaRamoOperacionesVisible === "locales"
                  ? datosInvestigacion.locales.length
                  : registrosImportacionExportacionTabla.length) === 0 ? (
                  <tr>
                    <td colSpan={pestanaRamoOperacionesVisible === "locales" ? 4 : 6} className="px-4 py-10 text-center text-sm text-slate-300">
                      Sin registros disponibles.
                    </td>
                  </tr>
                ) : pestanaRamoOperacionesVisible === "locales" ? (
                  registrosLocalesPaginados.map((local) => (
                    <tr
                      key={`${local.tipoLocal}-${local.comentario}`}
                      className={`cursor-pointer transition-colors ${indiceLocalSeleccionado === datosInvestigacion.locales.findIndex((item) => item.tipoLocal === local.tipoLocal && item.comentario === local.comentario) ? "bg-brand-wine/5" : "hover:bg-slate-50"}`}
                      onClick={() => setIndiceLocalSeleccionado(datosInvestigacion.locales.findIndex((item) => item.tipoLocal === local.tipoLocal && item.comentario === local.comentario))}
                    >
                      <td className="px-4 py-4 text-sm font-semibold text-slate-700">{local.tipoLocal}</td>
                      <td className="px-4 py-4 text-sm text-slate-500">{local.comentario}</td>
                      <td className="px-4 py-4 text-sm text-slate-400">{local.imagen}</td>
                      <td className="px-4 py-4 text-right text-slate-400">
                        <Pencil size={14} className="ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : (
                  registrosImportacionExportacionPaginados.map((registro) => (
                    <tr
                      key={`${registro.anio}-${registro.paises}-${registro.monto}`}
                      className={`cursor-pointer transition-colors ${indiceOperacionSeleccionada === registrosOperacionActivos.findIndex((item) => item.anio === registro.anio && item.paises === registro.paises && item.monto === registro.monto) ? "bg-brand-wine/5" : "hover:bg-slate-50"}`}
                      onClick={() => setIndiceOperacionSeleccionada(registrosOperacionActivos.findIndex((item) => item.anio === registro.anio && item.paises === registro.paises && item.monto === registro.monto))}
                    >
                      <td className="px-4 py-4 text-sm text-slate-500">{registro.anio}</td>
                      <td className="px-4 py-4 text-sm text-slate-500">{registro.moneda}</td>
                      <td className="px-4 py-4 text-sm text-slate-500">{registro.paises}</td>
                      <td className="px-4 py-4 text-sm italic text-slate-300">{registro.productos}</td>
                      <td className="px-4 py-4 text-sm text-slate-500">{registro.monto}</td>
                      <td className="px-4 py-4 text-sm text-slate-500">{registro.operaciones}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <PaginacionInvestigacion
            paginaActual={paginaOperaciones}
            totalRegistros={pestanaRamoOperacionesVisible === "locales" ? datosInvestigacion.locales.length : registrosImportacionExportacionTabla.length}
            onPaginaChange={setPaginaOperaciones}
            etiquetaRegistros="registros"
          />
        </div>
      );
    }

    return (
      <div className="grid gap-5 md:grid-cols-2">
        <CampoInvestigacionAnalista etiqueta="Sector" valor={datosInvestigacion.operacionPrincipal.sector} soloLectura={esSoloLectura} onChange={(valor) => actualizarOperacionPrincipal("sector", valor)} />
        <CampoInvestigacionAnalista etiqueta="Actividad" valor={datosInvestigacion.operacionPrincipal.actividad} soloLectura={esSoloLectura} onChange={(valor) => actualizarOperacionPrincipal("actividad", valor)} />
        <CampoInvestigacionAnalista etiqueta="Categoría CIIU" valor={datosInvestigacion.operacionPrincipal.categoriaCiiu} soloLectura={esSoloLectura} onChange={(valor) => actualizarOperacionPrincipal("categoriaCiiu", valor)} />
        <CampoInvestigacionAnalista etiqueta="Clase CIIU" valor={datosInvestigacion.operacionPrincipal.claseCiiu} soloLectura={esSoloLectura} onChange={(valor) => actualizarOperacionPrincipal("claseCiiu", valor)} />
        <AreaInvestigacionAnalista etiqueta="Actividad Principal" valor={datosInvestigacion.operacionPrincipal.actividadPrincipal} soloLectura={esSoloLectura} className="md:col-span-2" onChange={(valor) => actualizarOperacionPrincipal("actividadPrincipal", valor)} />
        <CampoInvestigacionAnalista etiqueta="Ventas al Contado (%)" valor={datosInvestigacion.operacionPrincipal.ventasContadoPorcentaje} soloLectura={esSoloLectura} onChange={(valor) => actualizarPorcentajesComplementarios("ventasContadoPorcentaje", "ventasCreditoPorcentaje", valor)} />
        <CampoInvestigacionAnalista etiqueta="Detalle Ventas al Contado" valor={datosInvestigacion.operacionPrincipal.ventasContadoDetalle} soloLectura={esSoloLectura} onChange={(valor) => actualizarOperacionPrincipal("ventasContadoDetalle", valor)} />
        <CampoInvestigacionAnalista etiqueta="Ventas a Crédito (%)" valor={datosInvestigacion.operacionPrincipal.ventasCreditoPorcentaje} soloLectura={esSoloLectura} onChange={(valor) => actualizarPorcentajesComplementarios("ventasCreditoPorcentaje", "ventasContadoPorcentaje", valor)} />
        <CampoInvestigacionAnalista etiqueta="Detalle Ventas a Crédito" valor={datosInvestigacion.operacionPrincipal.ventasCreditoDetalle} soloLectura={esSoloLectura} onChange={(valor) => actualizarOperacionPrincipal("ventasCreditoDetalle", valor)} />
        <CampoInvestigacionAnalista etiqueta="Territorio de Ventas" valor={datosInvestigacion.operacionPrincipal.territorioVentasPorcentaje} soloLectura={esSoloLectura} onChange={(valor) => actualizarOperacionPrincipal("territorioVentasPorcentaje", valor)} />
        <CampoInvestigacionAnalista etiqueta="Detalle Territorio" valor={datosInvestigacion.operacionPrincipal.territorioVentasDetalle} soloLectura={esSoloLectura} onChange={(valor) => actualizarOperacionPrincipal("territorioVentasDetalle", valor)} />
        <CampoInvestigacionAnalista etiqueta="(%) Ventas en el Extranjero" valor={datosInvestigacion.operacionPrincipal.ventasExtranjeroPorcentaje} soloLectura={esSoloLectura} onChange={(valor) => actualizarOperacionPrincipal("ventasExtranjeroPorcentaje", valor)} />
        <CampoInvestigacionAnalista etiqueta="Detalle Ventas Extranjero" valor={datosInvestigacion.operacionPrincipal.ventasExtranjeroDetalle} soloLectura={esSoloLectura} onChange={(valor) => actualizarOperacionPrincipal("ventasExtranjeroDetalle", valor)} />
        <CampoInvestigacionAnalista etiqueta="(%) Compras Nacionales" valor={datosInvestigacion.operacionPrincipal.comprasNacionalesPorcentaje} soloLectura={esSoloLectura} onChange={(valor) => actualizarPorcentajesComplementarios("comprasNacionalesPorcentaje", "comprasExtranjeroPorcentaje", valor)} />
        <CampoInvestigacionAnalista etiqueta="Detalle Compras Nacionales" valor={datosInvestigacion.operacionPrincipal.comprasNacionalesDetalle} soloLectura={esSoloLectura} onChange={(valor) => actualizarOperacionPrincipal("comprasNacionalesDetalle", valor)} />
        <CampoInvestigacionAnalista etiqueta="(%) Compras en el Extranjero" valor={datosInvestigacion.operacionPrincipal.comprasExtranjeroPorcentaje} soloLectura={esSoloLectura} onChange={(valor) => actualizarPorcentajesComplementarios("comprasExtranjeroPorcentaje", "comprasNacionalesPorcentaje", valor)} />
        <CampoInvestigacionAnalista etiqueta="Detalle Compras Extranjero" valor={datosInvestigacion.operacionPrincipal.comprasExtranjeroDetalle} soloLectura={esSoloLectura} onChange={(valor) => actualizarOperacionPrincipal("comprasExtranjeroDetalle", valor)} />
        <CampoInvestigacionAnalista etiqueta="N. de Empleados" valor={datosInvestigacion.operacionPrincipal.numeroEmpleados} soloLectura={esSoloLectura} onChange={(valor) => actualizarOperacionPrincipal("numeroEmpleados", valor)} />
        <CampoInvestigacionAnalista etiqueta="Detalle Empleados" valor={datosInvestigacion.operacionPrincipal.numeroEmpleadosDetalle} soloLectura={esSoloLectura} onChange={(valor) => actualizarOperacionPrincipal("numeroEmpleadosDetalle", valor)} />
        <AreaInvestigacionAnalista etiqueta="Comentarios sobre las Operaciones" valor={datosInvestigacion.operacionPrincipal.comentariosOperaciones} soloLectura={esSoloLectura} className="md:col-span-2" onChange={(valor) => actualizarOperacionPrincipal("comentariosOperaciones", valor)} />
      </div>
    );
  };

  const renderizarInformacionFinanciera = () => (
    <div className="space-y-5">
      <AreaInvestigacionAnalista etiqueta="Contenido" valor={datosInvestigacion.informacionFinanciera.contenido} soloLectura={esSoloLectura} filas={5} onChange={(valor) => actualizarInformacionFinanciera("contenido", valor)} />
      <AreaInvestigacionAnalista etiqueta="Comentarios Financieros" valor={datosInvestigacion.informacionFinanciera.comentariosFinancieros} soloLectura={esSoloLectura} filas={5} onChange={(valor) => actualizarInformacionFinanciera("comentariosFinancieros", valor)} />
      <AreaInvestigacionAnalista etiqueta="Activos" valor={datosInvestigacion.informacionFinanciera.activosFijos} soloLectura={esSoloLectura} filas={5} onChange={(valor) => actualizarInformacionFinanciera("activosFijos", valor)} />
      <AreaInvestigacionAnalista etiqueta="Seguros" valor={datosInvestigacion.informacionFinanciera.seguros} soloLectura={esSoloLectura} filas={5} onChange={(valor) => actualizarInformacionFinanciera("seguros", valor)} />
    </div>
  );

  const renderizarBalances = () => (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
          <input
            value={busquedaBalances}
            onChange={(event) => setBusquedaBalances(event.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 pl-9 pr-3 text-sm text-slate-500 outline-none"
            placeholder="Buscar balances..."
          />
        </label>
        <CustomButton variant="secondary" size="sm">Buscar</CustomButton>
        <CustomButton
          size="sm"
          disabled={esSoloLectura}
          onClick={() => {
            setIndiceBalanceSeleccionado(null);
            setEstaAbiertoModalBalance(true);
          }}
        >
          <Plus size={14} />
          Agregar Balance
        </CustomButton>
      </div>
      <div className="overflow-hidden rounded-2xl border border-gray-100">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Periodo</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Tipo de Balance</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Balance General</th>
              <th className="px-4 py-3">Perdida Ganancia</th>
              <th className="px-4 py-3">Cuentas</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {balancesFiltrados.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-sm text-slate-300">
                  Sin balances registrados.
                </td>
              </tr>
            ) : balancesPaginados.map((balance) => {
              const indiceReal = datosInvestigacion.balances.findIndex(
                (registro) => registro.codigo === balance.codigo && registro.periodo === balance.periodo,
              );

              return (
                <tr key={`${balance.codigo}-${balance.periodo}`} className="hover:bg-slate-50">
                  <td className="px-4 py-4 text-sm font-semibold text-slate-700">{balance.codigo}</td>
                  <td className="px-4 py-4 text-sm text-slate-500">{balance.periodo}</td>
                  <td className="px-4 py-4 text-sm text-slate-500">{balance.fecha}</td>
                  <td className="px-4 py-4 text-sm text-slate-500">{balance.tipoBalance || "-"}</td>
                  <td className="px-4 py-4 text-sm text-slate-500">{balance.tipo}</td>
                  <td className="px-4 py-4">
                    {balance.balanceGeneral ? (
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600">
                        <Check size={12} />
                      </span>
                    ) : (
                      <span className="text-sm text-slate-300">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {balance.perdidaGanancia ? (
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600">
                        <Check size={12} />
                      </span>
                    ) : (
                      <span className="text-sm text-slate-300">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-slate-400 transition-colors hover:border-brand-black hover:text-brand-black"
                      onClick={() => {
                        setIndiceBalanceSeleccionado(indiceReal);
                        setEstaAbiertoModalDetalleBalance(true);
                      }}
                    >
                      <Plus size={14} />
                    </button>
                  </td>
                  <td className="px-4 py-4 text-right text-slate-400">
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIndiceBalanceSeleccionado(indiceReal);
                          setEstaAbiertoModalBalance(true);
                        }}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setIndiceBalanceAEliminar(indiceReal)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <PaginacionInvestigacion
        paginaActual={paginaBalances}
        totalRegistros={balancesFiltrados.length}
        onPaginaChange={setPaginaBalances}
        etiquetaRegistros="balances"
      />
    </div>
  );

  const renderizarBancosProveedores = () => (
    <div className="space-y-5">
      <PestanasInvestigacionAnalista
        opciones={[
          { id: "referencias", etiqueta: "Referencias" },
          { id: "proveedores", etiqueta: "Proveedores" },
          { id: "bancos", etiqueta: "Bancos" },
        ]}
        valorActivo={pestanaBancosProveedores}
        onChange={(valor) => setPestanaBancosProveedores(valor as PestanaBancosProveedores)}
      />
      {pestanaBancosProveedores === "referencias" ? (
        <>
          <AreaInvestigacionAnalista etiqueta="Comentarios de los Proveedores" valor={datosInvestigacion.referencias.comentariosProveedores} soloLectura={esSoloLectura} filas={4} onChange={(valor) => actualizarReferencias("comentariosProveedores", valor)} />
          <AreaInvestigacionAnalista etiqueta="Referencias de Bancos" valor={datosInvestigacion.referencias.referenciasBancos} soloLectura={esSoloLectura} filas={4} onChange={(valor) => actualizarReferencias("referenciasBancos", valor)} />
          <AreaInvestigacionAnalista etiqueta="Litigios" valor={datosInvestigacion.referencias.litigios} soloLectura={esSoloLectura} filas={4} onChange={(valor) => actualizarReferencias("litigios", valor)} />
          <AreaInvestigacionAnalista etiqueta="Riesgo Principal" valor={datosInvestigacion.referencias.riesgoPrincipal} soloLectura={esSoloLectura} filas={4} onChange={(valor) => actualizarReferencias("riesgoPrincipal", valor)} />
          <AreaInvestigacionAnalista etiqueta="Superintendencia" valor={datosInvestigacion.referencias.superintendencia} soloLectura={esSoloLectura} filas={4} onChange={(valor) => actualizarReferencias("superintendencia", valor)} />
        </>
      ) : null}

      {pestanaBancosProveedores === "proveedores" ? (
        <div className="space-y-5">
          <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="grid gap-4 md:grid-cols-[1.25fr_0.85fr_1fr_0.7fr]">
              <div className="space-y-2">
                <CustomLabel className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-300">Nombre de Proveedor</CustomLabel>
                <input value={filtroProveedorNombre} onChange={(event) => setFiltroProveedorNombre(event.target.value)} placeholder="Ej. Schneider El" className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-slate-600 outline-none placeholder:text-slate-300" />
              </div>
              <div className="space-y-2">
                <CustomLabel className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-300">Tipo de Proveedor</CustomLabel>
                <CustomSelectorBuscable
                  options={opcionesFiltroTipoProveedor}
                  value={opcionesFiltroTipoProveedor.find((opcion) => opcion.string1 === filtroProveedorTipo)?.num1 ?? undefined}
                  onChange={(valor) => setFiltroProveedorTipo(opcionesFiltroTipoProveedor.find((opcion) => opcion.num1 === valor)?.string1 ?? "Todos")}
                  placeholder="Tipo"
                />
              </div>
              <div className="space-y-2">
                <CustomLabel className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-300">Nombre de Contacto</CustomLabel>
                <input value={filtroProveedorContacto} onChange={(event) => setFiltroProveedorContacto(event.target.value)} placeholder="Nombre completo" className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-slate-600 outline-none placeholder:text-slate-300" />
              </div>
              <div className="space-y-2">
                <CustomLabel className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-300">Teléfono</CustomLabel>
                <input value={filtroProveedorTelefono} onChange={(event) => setFiltroProveedorTelefono(event.target.value)} placeholder="+52..." className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-slate-600 outline-none placeholder:text-slate-300" />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <CustomButton
                size="sm"
                disabled={esSoloLectura}
                className="h-8 rounded-lg px-4 text-xs"
                onClick={() => {
                  setIndiceProveedorSeleccionado(null);
                  setEstaAbiertoModalProveedor(true);
                }}
              >
                <Plus size={14} />
                Agregar Proveedor
              </CustomButton>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300">
                <tr>
                  <th className="px-4 py-3">Nombre Proveedor</th>
                  <th className="px-4 py-3">Contacto</th>
                  <th className="px-4 py-3 text-center">Tipo</th>
                  <th className="px-4 py-3">Teléfono</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {proveedoresPaginados.map((proveedor) => {
                  const indiceReal = datosInvestigacion.proveedores.findIndex((item) => item.nombreEmpresa === proveedor.nombreEmpresa && item.telefono === proveedor.telefono);
                  return (
                    <tr key={`${proveedor.nombreEmpresa}-${proveedor.telefono}`}>
                      <td className="px-4 py-4 text-sm font-semibold leading-4 text-slate-700">{proveedor.nombreEmpresa}</td>
                      <td className="px-4 py-4 text-sm leading-4 text-slate-500">{proveedor.contacto || "-"}</td>
                      <td className="px-4 py-4 text-center text-sm">
                        <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-bold uppercase ${proveedor.tipoProveedor === "Nacional" ? "bg-green-50 text-green-600" : "bg-purple-50 text-purple-600"}`}>
                          {proveedor.tipoProveedor}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm leading-4 text-slate-500">{proveedor.telefono || "-"}</td>
                      <td className="px-4 py-4 text-right text-slate-400">
                        <div className="flex justify-end gap-3">
                          <button type="button" onClick={() => { setIndiceProveedorSeleccionado(indiceReal); setEstaAbiertoModalProveedor(true); }}><Pencil size={14} /></button>
                          <button type="button" onClick={() => setIndiceProveedorAEliminar(indiceReal)}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <PaginacionInvestigacion
            paginaActual={paginaProveedores}
            totalRegistros={proveedoresFiltrados.length}
            onPaginaChange={setPaginaProveedores}
            etiquetaRegistros="proveedores"
          />
        </div>
      ) : null}

      {pestanaBancosProveedores === "bancos" ? (
        <div className="space-y-5">
          <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="grid gap-4 md:grid-cols-[1.2fr_0.7fr]">
              <div className="space-y-2">
                <CustomLabel className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-300">Nombre del Banco</CustomLabel>
                <input value={filtroBancoNombre} onChange={(event) => setFiltroBancoNombre(event.target.value)} placeholder="Buscar banco..." className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-slate-600 outline-none placeholder:text-slate-300" />
              </div>
              <div className="space-y-2">
                <CustomLabel className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-300">Número de Cuenta</CustomLabel>
                <input value={filtroBancoCuenta} onChange={(event) => setFiltroBancoCuenta(event.target.value)} placeholder="0000 0000 0..." className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-slate-600 outline-none placeholder:text-slate-300" />
              </div>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-[0.7fr_auto] md:items-end">
              <div className="space-y-2">
                <CustomLabel className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-300">Teléfono</CustomLabel>
                <input value={filtroBancoTelefono} onChange={(event) => setFiltroBancoTelefono(event.target.value)} placeholder="Número..." className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-slate-600 outline-none placeholder:text-slate-300" />
              </div>
              <div className="flex justify-start md:justify-end">
                <CustomButton
                  size="sm"
                  disabled={esSoloLectura}
                  className="h-8 rounded-lg px-4 text-xs"
                  onClick={() => {
                    setIndiceBancoSeleccionado(null);
                    setEstaAbiertoModalBanco(true);
                  }}
                >
                  <Plus size={14} />
                  Agregar Banco
                </CustomButton>
              </div>
            </div>
            <div className="mt-4 min-w-0">
              <CustomLabel className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-300">Sectores</CustomLabel>
              <p className="mt-2 text-xs leading-5 text-slate-500">{filtroBancoSector || "Finanzas, Construcción, Manufactura, Energía, Telecomunicaciones, Comercio Exterior"}</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300">
                <tr>
                  <th className="px-4 py-3">Banco</th>
                  <th className="px-4 py-3">Número de Cuenta</th>
                  <th className="px-4 py-3 text-center">Sector</th>
                  <th className="px-4 py-3">Sectorista / Jefe de Cuenta</th>
                  <th className="px-4 py-3">Teléfono</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {bancosPaginados.map((banco) => {
                  const indiceReal = datosInvestigacion.bancos.findIndex((item) => item.banco === banco.banco && item.numeroCuenta === banco.numeroCuenta);
                  return (
                    <tr key={`${banco.banco}-${banco.numeroCuenta}`}>
                      <td className="px-4 py-4 text-sm font-semibold leading-4 text-slate-700">{banco.banco}</td>
                      <td className="px-4 py-4 text-sm leading-4 text-slate-500">{banco.numeroCuenta}</td>
                      <td className="px-4 py-4 text-center text-sm">
                        <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
                          banco.sector.toLowerCase().includes("finanzas")
                            ? "bg-blue-50 text-blue-600"
                            : banco.sector.toLowerCase().includes("comercio")
                              ? "bg-slate-100 text-slate-600"
                              : banco.sector.toLowerCase().includes("energia")
                                ? "bg-green-50 text-green-600"
                                : "bg-orange-50 text-orange-600"
                        }`}>{banco.sector}</span>
                      </td>
                      <td className="px-4 py-4 text-sm leading-4 text-slate-500">{banco.sectoristaJefeCuenta || "-"}</td>
                      <td className="px-4 py-4 text-sm leading-4 text-slate-500">{banco.telefono}</td>
                      <td className="px-4 py-4 text-right text-slate-400">
                        <div className="flex justify-end gap-3">
                          <button type="button" onClick={() => { setIndiceBancoSeleccionado(indiceReal); setEstaAbiertoModalBanco(true); }}><Pencil size={14} /></button>
                          <button type="button" onClick={() => setIndiceBancoAEliminar(indiceReal)}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <PaginacionInvestigacion
            paginaActual={paginaBancos}
            totalRegistros={bancosFiltrados.length}
            onPaginaChange={setPaginaBancos}
            etiquetaRegistros="bancos"
          />
        </div>
      ) : null}
    </div>
  );

  const renderizarDatosGenerales = () => (
    <div className="space-y-5">
      <AreaInvestigacionAnalista etiqueta="Información General" valor={datosInvestigacion.datosGenerales.informacionGeneral} soloLectura={esSoloLectura} filas={8} onChange={(valor) => actualizarDatosGenerales("informacionGeneral", valor)} />
      <AreaInvestigacionAnalista etiqueta="Opinión de Crédito" valor={datosInvestigacion.datosGenerales.opinionCredito} soloLectura={esSoloLectura} filas={8} onChange={(valor) => actualizarDatosGenerales("opinionCredito", valor)} />
    </div>
  );

  const renderizarDirectorioEjecutivo = () => (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative flex-1 lg:max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
          <input
            value={busquedaEjecutivo}
            onChange={(event) => setBusquedaEjecutivo(event.target.value)}
            className="h-10 w-full rounded-xl border border-gray-200 pl-9 pr-3 text-sm text-slate-500 outline-none"
            placeholder="Buscar ejecutivo..."
          />
        </label>
        <div className="flex flex-wrap gap-3">
          <CustomButton
            variant="secondary"
            size="sm"
            disabled={esSoloLectura || datosInvestigacion.directorioEjecutivo.length === 0 || porcentajeRestanteEjecutivos <= 0}
            onClick={completarPorcentajeEjecutivos}
          >
            Completar porcentaje
          </CustomButton>
          <CustomButton
            size="sm"
            disabled={esSoloLectura}
            onClick={() => {
              setIndiceEjecutivoSeleccionado(null);
              setPersonaDirectorioSeleccionada(null);
              setEstaAbiertoModalEjecutivo(true);
            }}
          >
            <Plus size={14} />
            Agregar Ejecutivo
          </CustomButton>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-300">
            <tr>
              <th className="w-10 px-3 py-3" />
              <th className="px-4 py-3">Ejecutivo</th>
              <th className="px-4 py-3">Cargo</th>
              <th className="px-4 py-3">% Part.</th>
              <th className="px-4 py-3">Lista</th>
              <th className="px-4 py-3">Detalle_Ejecutivo</th>
              <th className="px-4 py-3">Orden</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {ejecutivosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-300">
                  Sin ejecutivos registrados.
                </td>
              </tr>
            ) : ejecutivosPaginados.map((ejecutivo) => {
              const indiceReal = datosInvestigacion.directorioEjecutivo.findIndex((item) => item.id === ejecutivo.id);

              return (
                <tr key={ejecutivo.id} className="hover:bg-slate-50">
                  <td className="px-3 py-4 text-slate-300">
                    <GripVertical size={14} />
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-slate-700">{ejecutivo.ejecutivo}</td>
                  <td className="px-4 py-4 text-sm text-slate-500">{ejecutivo.cargo}</td>
                  <td className="px-4 py-4 text-sm text-slate-400">{ejecutivo.porcentaje || "0.00000000%"}</td>
                  <td className="px-4 py-4">
                    {ejecutivo.lista ? <Check size={16} className="text-green-500" /> : <span className="text-slate-300">-</span>}
                  </td>
                  <td className="px-4 py-4">
                    {ejecutivo.detalleEjecutivo ? <Check size={16} className="text-green-500" /> : <span className="text-slate-300">-</span>}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-500">{ejecutivo.orden}</td>
                  <td className="px-4 py-4 text-right text-slate-400">
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        disabled={esSoloLectura}
                        onClick={() => {
                          setIndiceEjecutivoSeleccionado(indiceReal);
                          setPersonaDirectorioSeleccionada(null);
                          setEstaAbiertoModalEjecutivo(true);
                        }}
                      >
                        <Pencil size={14} />
                      </button>
                      <button type="button" disabled={esSoloLectura} onClick={() => setIndiceEjecutivoAEliminar(indiceReal)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <PaginacionInvestigacion
        paginaActual={paginaEjecutivos}
        totalRegistros={ejecutivosFiltrados.length}
        onPaginaChange={setPaginaEjecutivos}
        etiquetaRegistros="ejecutivos"
        contenidoCentro={`Total % participación: ${formatearPorcentajeOchoDecimales(Math.min(totalPorcentajeEjecutivos, 100))}`}
      />
    </div>
  );

  const renderizarContenidoSeccion = () => {
    switch (idSeccionActiva) {
      case "identificacion":
        return renderizarIdentificacion();
      case "aspectos-legales":
        return (
          <div className="space-y-5">
            <PestanasInvestigacionAnalista
              opciones={[
                { id: "data", etiqueta: "Data" },
                { id: "companias", etiqueta: "Compañías Relacionadas" },
              ]}
              valorActivo={pestanaAspectosLegales}
              onChange={(valor) => setPestanaAspectosLegales(valor as PestanaAspectosLegales)}
            />
            {renderizarAspectosLegales()}
          </div>
        );
      case "ramo-operaciones":
        return (
          <div className="space-y-5">
            <PestanasInvestigacionAnalista
              opciones={[
                { id: "operaciones", etiqueta: "Operaciones" },
                {
                  id: "importaciones",
                  etiqueta: "Importaciones",
                  disabled: !importacionesHabilitadas,
                  tooltip: "Se habilitará cuando completes el porcentaje de compras en el extranjero.",
                },
                {
                  id: "exportaciones",
                  etiqueta: "Exportaciones",
                  disabled: !exportacionesHabilitadas,
                  tooltip: "Se habilitará cuando completes el porcentaje de ventas en el extranjero.",
                },
                { id: "locales", etiqueta: "Locales" },
              ]}
              valorActivo={pestanaRamoOperacionesVisible}
              onChange={(valor) => setPestanaRamoOperaciones(valor as PestanaRamoOperaciones)}
            />
            {renderizarRamoOperaciones()}
          </div>
        );
      case "informacion-financiera":
        return renderizarInformacionFinanciera();
      case "balances":
        return renderizarBalances();
      case "bancos-proveedores":
        return renderizarBancosProveedores();
      case "datos-generales":
        return renderizarDatosGenerales();
      case "directorio-ejecutivo":
        return renderizarDirectorioEjecutivo();
    }
  };

  return (
    <div ref={contenedorPantallaRef} className="space-y-6">
      <ResumenPedidoInvestigacionAnalista
        resumen={datosInvestigacion.resumen}
        esSoloLectura={esSoloLectura}
        mostrarBotonFinalizar={idSeccionActiva === "datos-generales" && !esSoloLectura}
        onFinalizarInvestigacion={() => setEstaAbiertoModalFinalizarInvestigacion(true)}
        onExtraerInformacion={() => abrirModalExtraccionInformacion("general")}
        onAbrirArchivos={() => setEstaAbiertoModalArchivosInvestigacion(true)}
      />

      <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
        <MenuSeccionesInvestigacionAnalista
          idSeccionActiva={idSeccionActiva}
          onSeleccionar={setIdSeccionActiva}
          estadoSecciones={estadoSecciones}
          secciones={seccionesInvestigacionAnalista}
        />

        <div className="space-y-5">
          <ContenedorSeccionInvestigacionAnalista numero={seccionActual.indice} titulo={seccionActual.titulo} botonExtra={botonExtraSeccion}>
            {renderizarContenidoSeccion()}
          </ContenedorSeccionInvestigacionAnalista>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
            <CustomButton
              variant="secondary"
              size="sm"
              disabled={esSoloLectura}
              onClick={() =>
                setEstadoSecciones((anterior) => ({
                  ...anterior,
                  [idSeccionActiva]: "borrador",
                }))
              }
            >
              Guardar Borrador
            </CustomButton>

            <div className="flex gap-3">
              <CustomButton
                variant="secondary"
                size="sm"
                disabled={indiceSeccionActiva === 0}
                onClick={() => irASeccion("anterior")}
              >
                <ArrowLeft size={14} />
                Anterior
              </CustomButton>

              {indiceSeccionActiva === seccionesInvestigacionAnalista.length - 1 ? (
                <CustomButton size="sm" disabled={esSoloLectura}>
                  <Check size={14} />
                  Finalizar Reporte
                </CustomButton>
              ) : (
                <CustomButton size="sm" onClick={() => irASeccion("siguiente")}>
                  Siguiente
                  <ArrowRight size={14} />
                </CustomButton>
              )}
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate("/analista/bandeja")}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 transition-colors hover:text-slate-700"
      >
        <ArrowLeft size={16} />
        Volver a la bandeja {idPedido ? `#${idPedido}` : ""}
      </button>

      <CustomModalListaPersonasAnalista
        estaAbierto={estaAbiertoModalCompanias}
        opcionesTipoPersona={opcionesTipoPersona}
        opcionesPais={opcionesPais}
        onCerrar={() => setEstaAbiertoModalCompanias(false)}
        onGuardar={agregarCompaniaRelacionada}
      />

      <CustomModalExtraccionInformacionAnalista
        estaAbierto={estaAbiertoModalExtraccionInformacion}
        alcance={alcanceExtraccionInformacion}
        tituloSeccion={tituloSeccionExtraccion}
        onCerrar={() => setEstaAbiertoModalExtraccionInformacion(false)}
        onExtraer={extraerInformacionDemo}
      />

      <CustomModalArchivosInvestigacionAnalista
        estaAbierto={estaAbiertoModalArchivosInvestigacion}
        archivos={archivosInvestigacion}
        faseActual={idSeccionActiva}
        secciones={seccionesInvestigacionAnalista}
        onCerrar={() => setEstaAbiertoModalArchivosInvestigacion(false)}
        onArchivosChange={setArchivosInvestigacion}
      />

      <CustomModalOperacionAnalista
        key={`${pestanaRamoOperacionesVisible}-${indiceOperacionSeleccionada ?? "nuevo"}-${estaAbiertoModalOperacion ? "abierto" : "cerrado"}`}
        estaAbierto={estaAbiertoModalOperacion}
        titulo={pestanaRamoOperacionesVisible === "importaciones" ? "Nueva Importación" : "Nueva Exportación"}
        subtitulo="Registro de operaciones"
        registroInicial={indiceOperacionSeleccionada != null ? registrosOperacionActivos[indiceOperacionSeleccionada] : null}
        onCerrar={() => {
          setIndiceOperacionSeleccionada(null);
          setEstaAbiertoModalOperacion(false);
        }}
        onGuardar={guardarOperacion}
      />

      <CustomModalLocalAnalista
        key={`${indiceLocalSeleccionado ?? "nuevo"}-${estaAbiertoModalLocal ? "abierto" : "cerrado"}`}
        estaAbierto={estaAbiertoModalLocal}
        registroInicial={indiceLocalSeleccionado != null ? datosInvestigacion.locales[indiceLocalSeleccionado] : null}
        onCerrar={() => {
          setIndiceLocalSeleccionado(null);
          setEstaAbiertoModalLocal(false);
        }}
        onGuardar={guardarLocal}
      />

      <CustomModalBalanceAnalista
        key={`${indiceBalanceSeleccionado ?? "nuevo"}-${estaAbiertoModalBalance ? "abierto" : "cerrado"}`}
        estaAbierto={estaAbiertoModalBalance}
        registroInicial={indiceBalanceSeleccionado != null ? datosInvestigacion.balances[indiceBalanceSeleccionado] : null}
        onCerrar={() => {
          setIndiceBalanceSeleccionado(null);
          setEstaAbiertoModalBalance(false);
        }}
        onGuardar={guardarBalance}
      />

      <CustomModalDetalleCuentasAnalista
        key={`${indiceBalanceSeleccionado ?? "sin-balance"}-${estaAbiertoModalDetalleBalance ? "abierto" : "cerrado"}`}
        estaAbierto={estaAbiertoModalDetalleBalance}
        detalleInicial={indiceBalanceSeleccionado != null ? datosInvestigacion.balances[indiceBalanceSeleccionado]?.detalleCuentas : undefined}
        tipoEstadoFinanciero={indiceBalanceSeleccionado != null ? datosInvestigacion.balances[indiceBalanceSeleccionado]?.tipoEstadoFinanciero : undefined}
        onCerrar={() => {
          setIndiceBalanceSeleccionado(null);
          setEstaAbiertoModalDetalleBalance(false);
        }}
        onGuardar={guardarDetalleCuentasBalance}
      />

      <CustomModalConfirmacionEliminacion
        isOpen={indiceBalanceAEliminar !== null}
        onClose={() => setIndiceBalanceAEliminar(null)}
        onConfirm={() => {
          if (indiceBalanceAEliminar == null) return;
          setDatosInvestigacion((anterior) => ({
            ...anterior,
            balances: anterior.balances.filter((_, indice) => indice !== indiceBalanceAEliminar),
          }));
          setIndiceBalanceAEliminar(null);
        }}
        title="Eliminar Balance"
      >
        <p><span className="font-bold">Código:</span> {indiceBalanceAEliminar != null ? datosInvestigacion.balances[indiceBalanceAEliminar]?.codigo ?? "-" : "-"}</p>
        <p><span className="font-bold">Periodo:</span> {indiceBalanceAEliminar != null ? datosInvestigacion.balances[indiceBalanceAEliminar]?.periodo ?? "-" : "-"}</p>
      </CustomModalConfirmacionEliminacion>

      <CustomModalProveedorAnalista
        key={`${indiceProveedorSeleccionado ?? "nuevo"}-${estaAbiertoModalProveedor ? "abierto" : "cerrado"}`}
        estaAbierto={estaAbiertoModalProveedor}
        registroInicial={indiceProveedorSeleccionado != null ? datosInvestigacion.proveedores[indiceProveedorSeleccionado] : null}
        onCerrar={() => {
          setIndiceProveedorSeleccionado(null);
          setEstaAbiertoModalProveedor(false);
        }}
        onGuardar={guardarProveedor}
      />

      <CustomModalBancoAnalista
        key={`${indiceBancoSeleccionado ?? "nuevo"}-${estaAbiertoModalBanco ? "abierto" : "cerrado"}`}
        estaAbierto={estaAbiertoModalBanco}
        registroInicial={indiceBancoSeleccionado != null ? datosInvestigacion.bancos[indiceBancoSeleccionado] : null}
        resultadosBusqueda={resultadosBusquedaBanco}
        onCerrar={() => {
          setIndiceBancoSeleccionado(null);
          setEstaAbiertoModalBanco(false);
        }}
        onGuardar={guardarBanco}
      />

      <CustomModalConfirmacionEliminacion
        isOpen={indiceProveedorAEliminar !== null}
        onClose={() => setIndiceProveedorAEliminar(null)}
        onConfirm={() => {
          if (indiceProveedorAEliminar == null) return;
          setDatosInvestigacion((anterior) => ({
            ...anterior,
            proveedores: anterior.proveedores.filter((_, indice) => indice !== indiceProveedorAEliminar),
          }));
          setIndiceProveedorAEliminar(null);
        }}
        title="Eliminar Proveedor"
      >
        <p><span className="font-bold">Proveedor:</span> {indiceProveedorAEliminar != null ? datosInvestigacion.proveedores[indiceProveedorAEliminar]?.nombreEmpresa ?? "-" : "-"}</p>
      </CustomModalConfirmacionEliminacion>

      <CustomModalConfirmacionEliminacion
        isOpen={indiceBancoAEliminar !== null}
        onClose={() => setIndiceBancoAEliminar(null)}
        onConfirm={() => {
          if (indiceBancoAEliminar == null) return;
          setDatosInvestigacion((anterior) => ({
            ...anterior,
            bancos: anterior.bancos.filter((_, indice) => indice !== indiceBancoAEliminar),
          }));
          setIndiceBancoAEliminar(null);
        }}
        title="Eliminar Banco"
      >
        <p><span className="font-bold">Banco:</span> {indiceBancoAEliminar != null ? datosInvestigacion.bancos[indiceBancoAEliminar]?.banco ?? "-" : "-"}</p>
      </CustomModalConfirmacionEliminacion>

      <CustomModalFinalizarInvestigacionAnalista
        estaAbierto={estaAbiertoModalFinalizarInvestigacion}
        onCerrar={() => setEstaAbiertoModalFinalizarInvestigacion(false)}
        onConfirmar={() => setEstaAbiertoModalFinalizarInvestigacion(false)}
      />

      <CustomModalRegistroEjecutivoAnalista
        key={`${indiceEjecutivoSeleccionado ?? "nuevo"}-${personaDirectorioSeleccionada?.id ?? "sin-persona"}-${estaAbiertoModalEjecutivo ? "abierto" : "cerrado"}`}
        estaAbierto={estaAbiertoModalEjecutivo}
        registroInicial={indiceEjecutivoSeleccionado != null ? datosInvestigacion.directorioEjecutivo[indiceEjecutivoSeleccionado] : null}
        personaSeleccionada={personaDirectorioSeleccionada}
        onCerrar={() => {
          setIndiceEjecutivoSeleccionado(null);
          setPersonaDirectorioSeleccionada(null);
          setEstaAbiertoModalEjecutivo(false);
        }}
        onBuscarEjecutivo={() => setEstaAbiertoModalBuscarEjecutivo(true)}
        onGuardar={guardarEjecutivo}
      />

      <CustomModalBuscarEjecutivoAnalista
        estaAbierto={estaAbiertoModalBuscarEjecutivo}
        registros={registrosPersonaDirectorio}
        onCerrar={() => setEstaAbiertoModalBuscarEjecutivo(false)}
        onSeleccionar={(registro) => {
          setPersonaDirectorioSeleccionada(registro);
          setEstaAbiertoModalBuscarEjecutivo(false);
          setEstaAbiertoModalEjecutivo(true);
        }}
        onAgregarEmpresaPersona={() => setEstaAbiertoModalRegistroPersona(true)}
      />

      <CustomModalRegistroPersonaDirectorioAnalista
        estaAbierto={estaAbiertoModalRegistroPersona}
        onCerrar={() => setEstaAbiertoModalRegistroPersona(false)}
        onGuardar={guardarPersonaDirectorio}
      />

      <CustomModalConfirmacionEliminacion
        isOpen={indiceEjecutivoAEliminar !== null}
        onClose={() => setIndiceEjecutivoAEliminar(null)}
        onConfirm={() => {
          if (indiceEjecutivoAEliminar == null) return;
          setDatosInvestigacion((anterior) => ({
            ...anterior,
            directorioEjecutivo: anterior.directorioEjecutivo.filter((_, indice) => indice !== indiceEjecutivoAEliminar),
          }));
          setIndiceEjecutivoAEliminar(null);
        }}
        title="Eliminar Ejecutivo"
      >
        <p><span className="font-bold">Ejecutivo:</span> {indiceEjecutivoAEliminar != null ? datosInvestigacion.directorioEjecutivo[indiceEjecutivoAEliminar]?.nombreCompleto ?? "-" : "-"}</p>
      </CustomModalConfirmacionEliminacion>
    </div>
  );
}

export default function InvestigacionAnalista() {
  const { idPedido } = useParams();
  const [searchParams] = useSearchParams();
  const modo = (searchParams.get("modo") as ModoInvestigacionAnalista | null) ?? "iniciar";

  return (
    <PantallaInvestigacionAnalista
      key={`${idPedido ?? "sin-id"}-${modo}`}
      idPedido={idPedido}
      modo={modo}
    />
  );
}
