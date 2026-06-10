import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { CustomCampoFechaInvestigacion } from "@maximilian/components/investigacion/CustomCampoFechaInvestigacion";
import { CustomModalPestanas } from "@maximilian/components/common/CustomModalPestanas";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
import { SelectorMaestroConAltaInvestigacionAnalista } from "@maximilian/components/investigacion/ControlesInforme";
import { servicioTablaMaestra } from "@maximilian/services/tablaMaestra.service";
import type {
  DetalleBalanceGeneralAnalista,
  DetalleCuentasBalanceAnalista,
  DetalleEstadoGananciaAnalista,
  DetalleRatiosBalanceAnalista,
} from "@maximilian/shared/types/investigacion.type";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import {
  obtenerConfiguracionEstadoFinanciero,
  obtenerTipoEntradaCampoEstadoFinanciero,
} from "@maximilian/shared/utils/estados-financieros.util";
import {
  formatearMontoDosDecimales,
  normalizarMontoDosDecimales,
  obtenerNumeroDesdeMonto,
  sanitizarMontoDosDecimales,
  seleccionarTextoCampoEditable,
} from "@maximilian/shared/utils/formato-monto.util";

interface PropsCustomModalDetalleCuentasAnalista {
  estaAbierto: boolean;
  onCerrar: () => void;
  onGuardar: (detalle: DetalleCuentasBalanceAnalista) => void;
  detalleInicial?: DetalleCuentasBalanceAnalista;
  tipoEstadoFinanciero?: string;
}

function crearDetalleVacio(): DetalleCuentasBalanceAnalista {
  return {
    balanceGeneral: {
      totalCorrientes: "0.00",
      totalNoCorrientes: "0.00",
      otrosActivos: "0.00",
      totalActivos: "0.00",
      totalPasivosCorrientes: "0.00",
      totalPasivosNoCorrientes: "0.00",
      otrosPasivos: "0.00",
      totalPasivos: "0.00",
      patrimonio: "0.00",
      totalPasivoPatrimonio: "0.00",
    },
    estadoGananciasPerdidas: {
      ventasNetas: "0.00",
      utilidadGanancia: "0.00",
    },
    ratios: {
      liquidez: "0.00",
      capitalTrabajo: "0.00",
      endeudamiento: "0.00",
      rentabilidad: "0.00",
    },
    totalesHabilitados: false,
    registrosHabilitados: false,
    registrosEstadoFinanciero: {},
  };
}

function obtenerNumero(valor: string) {
  return obtenerNumeroDesdeMonto(valor);
}

function formatearNumero(valor: number) {
  return formatearMontoDosDecimales(valor);
}

function dividirSeguro(numerador: number, denominador: number) {
  return Math.abs(denominador) < 0.000001 ? 0 : numerador / denominador;
}

function sumarRegistros(registros: Record<string, string>, campos: string[]) {
  return campos.reduce((total, campo) => total + obtenerNumero(registros[campo] ?? ""), 0);
}

function sonRegistrosIguales(registrosActuales: Record<string, string>, registrosSiguientes: Record<string, string>) {
  const claves = new Set([...Object.keys(registrosActuales), ...Object.keys(registrosSiguientes)]);

  for (const clave of claves) {
    if ((registrosActuales[clave] ?? "") !== (registrosSiguientes[clave] ?? "")) {
      return false;
    }
  }

  return true;
}

function sanitizarNumero(valor: string, permitirNegativo = false) {
  return sanitizarMontoDosDecimales(valor, permitirNegativo);
}

function esValorCeroOBlanco(valor: string) {
  const texto = valor.trim();
  if (!texto || texto === "-" || texto === "-.") return true;
  return Math.abs(obtenerNumero(texto)) < 0.000001;
}

function CampoDetalle({
  etiqueta,
  valor,
  onChange,
  negrita = false,
  destacado = false,
  claseContenedor = "",
  mostrarComoPorcentaje = false,
  deshabilitado = false,
  permitirNegativo = false,
}: {
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
  negrita?: boolean;
  destacado?: boolean;
  claseContenedor?: string;
  mostrarComoPorcentaje?: boolean;
  deshabilitado?: boolean;
  permitirNegativo?: boolean;
}) {
  const valorMostrado = mostrarComoPorcentaje ? `${formatearNumero(obtenerNumero(valor) * 100)}%` : valor;

  return (
    <div className={`space-y-2 rounded-lg ${destacado ? "border border-emerald-200 bg-emerald-50/70 p-3" : ""} ${claseContenedor}`}>
      <CustomLabel as="p" className={`text-[10px] font-bold uppercase tracking-[0.12em] ${destacado ? "text-emerald-700" : "text-slate-600"}`}>
        {etiqueta}
      </CustomLabel>
      <input
        value={valorMostrado}
        disabled={deshabilitado}
        onChange={(event) => onChange(sanitizarNumero(event.target.value, permitirNegativo))}
        onBlur={(event) => {
          const texto = event.target.value.trim();
          if (!texto || texto === "-" || texto === "-.") {
          onChange("0.00");
          return;
        }
          onChange(normalizarMontoDosDecimales(texto, permitirNegativo));
        }}
        onFocus={seleccionarTextoCampoEditable}
        placeholder="0.00"
        className={`h-10 w-full rounded-md border px-3 text-sm outline-none transition-all focus:border-brand-black focus:ring-2 focus:ring-brand-black/5 disabled:cursor-not-allowed disabled:text-slate-500 ${destacado ? "border-emerald-200 bg-white text-emerald-800 disabled:bg-emerald-50" : "border-gray-200 bg-slate-50 text-slate-600 disabled:bg-slate-100 disabled:text-slate-400"} ${negrita || destacado ? "font-bold" : ""}`}
      />
    </div>
  );
}

function CampoDetalleFecha({
  etiqueta,
  valor,
  onChange,
  deshabilitado = false,
}: {
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
  deshabilitado?: boolean;
}) {
  return (
    <CustomCampoFechaInvestigacion
      etiqueta={etiqueta}
      valor={valor}
      onChange={onChange}
      soloLectura={deshabilitado}
    />
  );
}

function CampoDetalleEntero({
  etiqueta,
  valor,
  onChange,
  deshabilitado = false,
  placeholder = "0",
}: {
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
  deshabilitado?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <CustomLabel as="p" className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
        {etiqueta}
      </CustomLabel>
      <input
        value={valor}
        disabled={deshabilitado}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, ""))}
        onFocus={seleccionarTextoCampoEditable}
        placeholder={placeholder}
        className="h-10 w-full rounded-md border border-gray-200 bg-slate-50 px-3 text-sm text-slate-600 outline-none transition-all focus:border-brand-black focus:ring-2 focus:ring-brand-black/5 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
      />
    </div>
  );
}

function CampoDetalleAno({
  etiqueta,
  valor,
  onChange,
  deshabilitado = false,
}: {
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
  deshabilitado?: boolean;
}) {
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);
  const anoActual = new Date().getFullYear();

  const calcularDecadaBase = (v: string) => {
    const n = Number.parseInt(v, 10);
    return Number.isFinite(n) ? Math.floor(n / 10) * 10 : Math.floor(anoActual / 10) * 10;
  };

  const [decadaBase, setDecadaBase] = useState(() => calcularDecadaBase(valor));
  const anos = Array.from({ length: 12 }, (_, i) => decadaBase + i);

  useEffect(() => {
    if (!abierto) return;
    const manejarClickFuera = (evento: MouseEvent) => {
      if (contenedorRef.current && !contenedorRef.current.contains(evento.target as Node)) {
        setAbierto(false);
      }
    };
    document.addEventListener("mousedown", manejarClickFuera);
    return () => document.removeEventListener("mousedown", manejarClickFuera);
  }, [abierto]);

  const abrirPicker = () => {
    setDecadaBase(calcularDecadaBase(valor));
    setAbierto(true);
  };

  return (
    <div className="space-y-2" ref={contenedorRef}>
      <CustomLabel as="p" className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
        {etiqueta}
      </CustomLabel>
      <div className="relative">
        <input
          value={valor}
          disabled={deshabilitado}
          onChange={(evento) => onChange(evento.target.value.replace(/\D/g, "").slice(0, 4))}
          onFocus={seleccionarTextoCampoEditable}
          placeholder="Ej. 2026"
          className="h-10 w-full rounded-md border border-gray-200 bg-slate-50 px-3 pr-9 text-sm text-slate-600 outline-none transition-all focus:border-brand-black focus:ring-2 focus:ring-brand-black/5 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
        />
        <button
          type="button"
          disabled={deshabilitado}
          onClick={abrirPicker}
          className="absolute right-0 top-0 flex h-10 w-9 items-center justify-center text-slate-400 hover:text-slate-600 disabled:cursor-not-allowed"
        >
          <ChevronDown className="h-4 w-4" />
        </button>

        {abierto && (
          <div className="absolute z-20 mt-1 w-52 rounded-xl border border-gray-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-2 py-2">
              <button
                type="button"
                onClick={() => setDecadaBase((d) => d - 12)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-bold text-slate-700">
                {decadaBase} – {decadaBase + 11}
              </span>
              <button
                type="button"
                onClick={() => setDecadaBase((d) => d + 12)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1 p-2">
              {anos.map((ano) => {
                const seleccionado = valor === String(ano);
                const esActual = ano === anoActual;
                return (
                  <button
                    key={ano}
                    type="button"
                    onClick={() => {
                      onChange(String(ano));
                      setAbierto(false);
                    }}
                    className={`rounded-lg py-2 text-sm font-medium transition-colors ${
                      seleccionado
                        ? "bg-brand-black text-white"
                        : esActual
                          ? "border border-brand-black/30 text-brand-black hover:bg-slate-50"
                          : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {ano}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function obtenerPlaceholderCampoEntero(etiqueta: string) {
  const etiquetaNormalizada = etiqueta.trim().toLowerCase();

  if (etiquetaNormalizada.includes("ano") || etiquetaNormalizada.includes("year")) {
    return "Ej. 2026";
  }

  if (etiquetaNormalizada.includes("duracion del periodo") || etiquetaNormalizada.includes("length of period")) {
    return "Ej. 12";
  }

  return "0";
}

function normalizarTexto(valor?: string) {
  return (valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const camposCalculadosEstadoFinanciero = new Set([
  "total-activo-corriente",
  "total-activo-no-corriente",
  "total-activo",
  "total-pasivo-corriente",
  "total-pasivo-no-corriente",
  "total-pasivos",
  "total-patrimonio",
  "total-pasivo-patrimonio",
  "ganancia-bruta",
  "ganancia-operativa",
  "ganancia-antes-impuestos",
  "ganancia-neta",
  "liquidity-ratio",
  "working-capital-ratio",
  "current-indebtedness-ratio",
  "profitability-ratio",
  "liquidity-ratio-totalizado",
  "working-capital-ratio-totalizado",
  "current-indebtedness-ratio-totalizado",
  "profitability-ratio-totalizado",
  "total-activos-bancos",
  "total-pasivo-bancos",
  "total-patrimonio-bancos",
  "total-pasivo-patrimonio-bancos",
  "total-activos-seguros",
  "total-pasivo-seguros",
  "total-patrimonio-seguros",
  "total-pasivo-patrimonio-seguros",
  "current-total",
  "net-fixed",
  "total-assets-turquia",
  "current-liabilities",
  "total-non-current-liabilities",
  "total-liabilities",
  "total-equity",
  "total-liabilities-equity",
  "gross-profit",
  "financial-pl",
  "extra-other-pl",
  "profit-loss-before-taxes",
  "profit-loss-after-taxes",
  "profit",
  "liquidity-index",
  "working-capital",
  "indebtedness-ratio",
  "profitability-ratio-turquia",
]);

const camposRatioPorcentaje = new Set([
  "current-indebtedness-ratio",
  "profitability-ratio",
  "current-indebtedness-ratio-totalizado",
  "profitability-ratio-totalizado",
  "indebtedness-ratio",
  "profitability-ratio-turquia",
]);

function calcularRegistrosEstadoFinanciero(tipoEstadoFinanciero: string | undefined, registros: Record<string, string>, permiteEditarTotales: boolean) {
  const clave = normalizarTexto(tipoEstadoFinanciero);
  const siguiente = { ...registros };
  const n = (campo: string) => obtenerNumero(siguiente[campo] ?? "");
  const asignar = (campo: string, valor: number, forzar = true) => {
    if (!forzar) return;
    siguiente[campo] = formatearNumero(valor);
  };

  if (clave.includes("desagregado")) {
    asignar("total-activo-corriente", sumarRegistros(siguiente, [
      "efectivo-equivalente",
      "otros-activos-financieros-corriente",
      "cuentas-cobrar-corriente",
      "inventarios-corriente",
      "activos-biologicos-corriente",
      "activos-impuestos-ganancias",
      "otros-activos-no-financieros-corriente",
    ]), !permiteEditarTotales);
    asignar("total-activo-no-corriente", sumarRegistros(siguiente, [
      "otros-activos-financieros-no-corriente",
      "inversiones-subsidiarias",
      "cuentas-cobrar-no-corriente",
      "inventarios-no-corriente",
      "activos-biologicos-no-corriente",
      "propiedades-inversion",
      "propiedades-planta-equipo",
      "intangibles",
      "activos-impuestos-diferidos",
      "activos-impuestos-corrientes",
      "plusvalia",
      "otros-activos-no-financieros-no-corriente",
    ]), !permiteEditarTotales);
    asignar("total-activo", n("total-activo-corriente") + n("total-activo-no-corriente"), !permiteEditarTotales);
    asignar("total-pasivo-corriente", sumarRegistros(siguiente, [
      "otros-pasivos-financieros-corriente",
      "cuentas-pagar-corriente",
      "beneficios-empleados-corriente",
      "otras-provisiones-corriente",
      "impuestos-ganancias-corriente",
      "otros-pasivos-no-financieros-corriente",
    ]), !permiteEditarTotales);
    asignar("total-pasivo-no-corriente", sumarRegistros(siguiente, [
      "otros-pasivos-financieros-no-corriente",
      "cuentas-pagar-no-corriente",
      "beneficios-empleados-no-corriente",
      "otras-provisiones-no-corriente",
      "impuestos-diferidos-no-corriente",
      "impuestos-corrientes-no-corriente",
      "otros-pasivos-no-financieros-no-corriente",
    ]), !permiteEditarTotales);
    asignar("total-pasivos", n("total-pasivo-corriente") + n("total-pasivo-no-corriente"), !permiteEditarTotales);
    asignar("total-patrimonio", sumarRegistros(siguiente, [
      "capital-emitido",
      "primas-emision",
      "acciones-inversion",
      "acciones-cartera",
      "otras-reservas-capital",
      "resultados-acumulados",
      "otras-reservas-patrimonio",
    ]), !permiteEditarTotales);
    asignar("total-pasivo-patrimonio", n("total-pasivos") + n("total-patrimonio"), !permiteEditarTotales);
    asignar("ganancia-bruta", n("ingresos-ordinarios") + n("costo-ventas"));
    asignar("ganancia-operativa", n("ganancia-bruta") + sumarRegistros(siguiente, [
      "gastos-ventas",
      "gastos-administracion",
      "otros-ingresos-operativos",
      "otros-gastos-operativos",
      "otras-ganancias-perdidas",
    ]));
    asignar("ganancia-antes-impuestos", n("ganancia-operativa") + sumarRegistros(siguiente, [
      "ingresos-financieros",
      "ingresos-intereses",
      "gastos-financieros",
      "deterioro-valor",
      "otros-ingresos-subsidiarias",
      "diferencias-cambio",
    ]));
    asignar("ganancia-neta", n("ganancia-antes-impuestos") + sumarRegistros(siguiente, [
      "ingreso-gasto-impuesto",
      "operaciones-descontinuadas",
    ]));
    asignar("liquidity-ratio", dividirSeguro(n("total-activo-corriente"), n("total-pasivo-corriente")));
    asignar("working-capital-ratio", n("total-activo-corriente") - n("total-pasivo-corriente"));
    asignar("current-indebtedness-ratio", dividirSeguro(n("total-pasivo-corriente"), n("total-patrimonio")));
    asignar("profitability-ratio", dividirSeguro(n("ganancia-neta"), n("ingresos-ordinarios")));
  }

  if (clave.includes("totalizado")) {
    asignar("total-activo", n("total-activo-corriente") + n("total-activo-no-corriente"), !permiteEditarTotales);
    asignar("total-pasivos", n("total-pasivo-corriente") + n("total-pasivo-no-corriente"), !permiteEditarTotales);
    asignar("total-pasivo-patrimonio", n("total-pasivos") + n("total-patrimonio"), !permiteEditarTotales);
    asignar("liquidity-ratio-totalizado", dividirSeguro(n("total-activo-corriente"), n("total-pasivo-corriente")));
    asignar("working-capital-ratio-totalizado", n("total-activo-corriente") - n("total-pasivo-corriente"));
    asignar("current-indebtedness-ratio-totalizado", dividirSeguro(n("total-pasivo-corriente"), n("total-patrimonio")));
    asignar("profitability-ratio-totalizado", dividirSeguro(n("ganancia-neta-totalizado"), n("ingresos-ordinarios-totalizado")));
  }

  if (clave.includes("banco")) {
    asignar("total-activos-bancos", sumarRegistros(siguiente, [
      "disponible",
      "fondos-interbancarios-activo",
      "inversiones-valor-razonable",
      "cartera-creditos",
      "derivados-negociacion-activo",
      "derivados-cobertura-activo",
      "bienes-realizables",
      "participaciones-subsidiarias",
      "inmueble-mobiliario-equipo",
      "impuesto-renta-diferido",
      "otros-activos-bancos",
    ]), !permiteEditarTotales);
    asignar("total-pasivo-bancos", sumarRegistros(siguiente, [
      "obligaciones-publico",
      "fondos-interbancarios-pasivo",
      "adeudos-financieras",
      "derivados-negociacion-pasivo",
      "derivados-cobertura-pasivo",
      "cuentas-pagar-provisiones",
    ]), !permiteEditarTotales);
    asignar("total-patrimonio-bancos", sumarRegistros(siguiente, [
      "capital-social-bancos",
      "reservas-bancos",
      "resultados-no-realizados",
      "resultado-ejercicio-bancos",
    ]), !permiteEditarTotales);
    asignar("total-pasivo-patrimonio-bancos", n("total-pasivo-bancos") + n("total-patrimonio-bancos"), !permiteEditarTotales);
  }

  if (clave.includes("seguro")) {
    asignar("total-activos-seguros", sumarRegistros(siguiente, [
      "efectivo-disponible",
      "inversiones-financieras-seguros",
      "prestamos-intereses-netos",
      "primas-cobrar",
      "deudas-reaseguradores",
      "activos-venta",
      "propiedades-inversion-seguros",
      "propiedad-planta-equipo-seguros",
      "otros-activos-seguros",
    ]), !permiteEditarTotales);
    asignar("total-pasivo-seguros", sumarRegistros(siguiente, [
      "obligaciones-asegurados",
      "reservas-siniestros",
      "reservas-tecnicas",
      "obligaciones-reaseguradores",
      "obligaciones-financieras-seguros",
      "cuentas-pagar-seguros",
      "otros-pasivos-seguros",
    ]), !permiteEditarTotales);
    asignar("total-patrimonio-seguros", sumarRegistros(siguiente, [
      "capital-social-seguros",
      "aportes-capital-no-capitalizados",
      "resultados-acumulados-seguros",
      "patrimonio-restringido",
    ]), !permiteEditarTotales);
    asignar("total-pasivo-patrimonio-seguros", n("total-pasivo-seguros") + n("total-patrimonio-seguros"), !permiteEditarTotales);
  }

  if (clave.includes("turquia")) {
    asignar("current-total", n("cash") + n("stocks") + n("creditors"), !permiteEditarTotales);
    asignar("net-fixed", n("tangible-assets") + n("intangible-assets"), !permiteEditarTotales);
    asignar("total-assets-turquia", n("current-total") + n("net-fixed"), !permiteEditarTotales);
    asignar("current-liabilities", n("loans") + n("debtors"), !permiteEditarTotales);
    asignar("total-non-current-liabilities", n("non-current-liabilities") + n("long-term-liabilities"), !permiteEditarTotales);
    asignar("total-liabilities", n("current-liabilities") + n("total-non-current-liabilities"), !permiteEditarTotales);
    asignar("total-equity", n("equity"), !permiteEditarTotales);
    asignar("total-liabilities-equity", n("total-liabilities") + n("total-equity"), !permiteEditarTotales);
    asignar("gross-profit", n("turnover") + n("costs-goods-sold") + n("material-costs"));
    asignar("financial-pl", n("financial-revenue") + n("financial-expenses") + n("interest-paid"));
    asignar("extra-other-pl", n("extra-other-revenue") + n("extra-other-expenses"));
    asignar("profit-loss-before-taxes", n("gross-profit") + sumarRegistros(siguiente, [
      "other-operating-expenses",
      "costs-employees",
      "depreciation",
      "financial-pl",
      "extra-other-pl",
    ]));
    asignar("profit-loss-after-taxes", n("profit-loss-before-taxes") + n("taxation"));
    asignar("profit", n("profit-loss-after-taxes"));
    asignar("liquidity-index", dividirSeguro(n("current-total"), n("current-liabilities")));
    asignar("working-capital", n("current-total") - n("current-liabilities"));
    asignar("indebtedness-ratio", dividirSeguro(n("current-liabilities"), n("total-equity")));
    asignar("profitability-ratio-turquia", dividirSeguro(n("profit-loss-after-taxes"), n("turnover")));
  }

  return siguiente;
}

export function CustomModalDetalleCuentasAnalista({
  estaAbierto,
  onCerrar,
  onGuardar,
  detalleInicial,
  tipoEstadoFinanciero,
}: PropsCustomModalDetalleCuentasAnalista) {
  const detalleBase = useMemo(() => detalleInicial ?? crearDetalleVacio(), [detalleInicial]);
  const [detalle, setDetalle] = useState<DetalleCuentasBalanceAnalista>(detalleBase);
  const [pestanaActiva, setPestanaActiva] = useState("balance-general");
  const { data: opcionesMoneda } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.MONEDA],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.MONEDA),
    staleTime: Infinity,
  });
  const { data: opcionesNivelConfiabilidad } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.NIVEL_CONFIABILIDAD],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.NIVEL_CONFIABILIDAD),
    staleTime: Infinity,
  });

  useEffect(() => {
    setDetalle(detalleBase);
  }, [detalleBase]);

  const mostrarRatios = ["Desagregado", "Totalizado", "Turquía"].includes(tipoEstadoFinanciero ?? "");
  const esEstadoFinancieroTotalizado = normalizarTexto(tipoEstadoFinanciero) === "totalizado";
  const totalesHabilitados = detalle.totalesHabilitados ?? false;
  const registrosHabilitados = detalle.registrosHabilitados ?? false;
  const seccionesEstadoFinanciero = useMemo(
    () => obtenerConfiguracionEstadoFinanciero(tipoEstadoFinanciero),
    [tipoEstadoFinanciero],
  );
  const advertenciasTotales = useMemo(() => {
    if (!totalesHabilitados) return [];

    const totalActivos = obtenerNumero(detalle.balanceGeneral.totalActivos);
    const totalPasivos = obtenerNumero(detalle.balanceGeneral.totalPasivos);
    const totalPasivoPatrimonio = obtenerNumero(detalle.balanceGeneral.totalPasivoPatrimonio);
    const patrimonio = obtenerNumero(detalle.balanceGeneral.patrimonio);
    const totalActivosMinimo = obtenerNumero(detalle.balanceGeneral.totalCorrientes)
      + obtenerNumero(detalle.balanceGeneral.totalNoCorrientes)
      + obtenerNumero(detalle.balanceGeneral.otrosActivos);
    const totalPasivosMinimo = obtenerNumero(detalle.balanceGeneral.totalPasivosCorrientes)
      + obtenerNumero(detalle.balanceGeneral.totalPasivosNoCorrientes)
      + obtenerNumero(detalle.balanceGeneral.otrosPasivos);
    const totalPasivoPatrimonioMinimo = totalPasivos + patrimonio;
    const advertencias: string[] = [];

    if (Math.abs(totalActivos - totalActivosMinimo) > 0.000001) {
      advertencias.push(`Total Activos debe ser igual a la suma de los campos de activos (${formatearNumero(totalActivosMinimo)}).`);
    }

    if (Math.abs(totalPasivos - totalPasivosMinimo) > 0.000001) {
      advertencias.push(`Total Pasivos debe ser igual a la suma de los campos de pasivos (${formatearNumero(totalPasivosMinimo)}).`);
    }

    if (Math.abs(totalPasivoPatrimonio - totalPasivoPatrimonioMinimo) > 0.000001) {
      advertencias.push(`Total Pasivo y Patrimonio debe ser igual a Total Pasivos + Patrimonio (${formatearNumero(totalPasivoPatrimonioMinimo)}).`);
    }

    if (Math.abs(totalActivos - totalPasivoPatrimonio) > 0.000001) {
      advertencias.push("Total Activos debe ser igual a Total Pasivo y Patrimonio.");
    }

    return advertencias;
  }, [detalle, totalesHabilitados]);

  useEffect(() => {
    if (!mostrarRatios && pestanaActiva === "ratios") {
      setPestanaActiva("balance-general");
    }
  }, [mostrarRatios, pestanaActiva]);

  useEffect(() => {
    setDetalle((anterior) => {
      const totalActivosCalculado = obtenerNumero(anterior.balanceGeneral.totalCorrientes)
        + obtenerNumero(anterior.balanceGeneral.totalNoCorrientes)
        + obtenerNumero(anterior.balanceGeneral.otrosActivos);
      const totalPasivosCalculado = obtenerNumero(anterior.balanceGeneral.totalPasivosCorrientes)
        + obtenerNumero(anterior.balanceGeneral.totalPasivosNoCorrientes)
        + obtenerNumero(anterior.balanceGeneral.otrosPasivos);
      const totalActivosTexto = formatearNumero(totalActivosCalculado);
      const totalPasivosTexto = formatearNumero(totalPasivosCalculado);
      const totalPasivoPatrimonioTexto = formatearNumero(totalPasivosCalculado + obtenerNumero(anterior.balanceGeneral.patrimonio));

      if (totalesHabilitados) {
        return anterior;
      }

      if (
        anterior.balanceGeneral.totalActivos === totalActivosTexto
        && anterior.balanceGeneral.totalPasivos === totalPasivosTexto
        && anterior.balanceGeneral.totalPasivoPatrimonio === totalPasivoPatrimonioTexto
      ) {
        return anterior;
      }

      return {
        ...anterior,
        balanceGeneral: {
          ...anterior.balanceGeneral,
          totalActivos: totalActivosTexto,
          totalPasivos: totalPasivosTexto,
          totalPasivoPatrimonio: totalPasivoPatrimonioTexto,
        },
      };
    });
  }, [
    detalle.balanceGeneral.totalCorrientes,
    detalle.balanceGeneral.totalNoCorrientes,
    detalle.balanceGeneral.otrosActivos,
    detalle.balanceGeneral.totalPasivosCorrientes,
    detalle.balanceGeneral.totalPasivosNoCorrientes,
    detalle.balanceGeneral.otrosPasivos,
    detalle.balanceGeneral.totalPasivos,
    detalle.balanceGeneral.patrimonio,
    totalesHabilitados,
  ]);

  useEffect(() => {
    setDetalle((anterior) => {
      const registrosActuales = anterior.registrosEstadoFinanciero ?? {};
      const registrosBase = esEstadoFinancieroTotalizado
        ? {
            ...registrosActuales,
            "total-activo-corriente": anterior.balanceGeneral.totalCorrientes,
            "total-activo-no-corriente": anterior.balanceGeneral.totalNoCorrientes,
            "total-activo": anterior.balanceGeneral.totalActivos,
            "total-pasivo-corriente": anterior.balanceGeneral.totalPasivosCorrientes,
            "total-pasivo-no-corriente": anterior.balanceGeneral.totalPasivosNoCorrientes,
            "total-pasivos": anterior.balanceGeneral.totalPasivos,
            "total-patrimonio": anterior.balanceGeneral.patrimonio,
            "total-pasivo-patrimonio": anterior.balanceGeneral.totalPasivoPatrimonio,
          }
        : registrosActuales;
      const registrosCalculados = calcularRegistrosEstadoFinanciero(
        tipoEstadoFinanciero,
        registrosBase,
        anterior.totalesHabilitados ?? false,
      );

      if (sonRegistrosIguales(registrosActuales, registrosCalculados)) {
        return anterior;
      }

      return {
        ...anterior,
        registrosEstadoFinanciero: registrosCalculados,
      };
    });
  }, [
    detalle.balanceGeneral.patrimonio,
    detalle.balanceGeneral.totalActivos,
    detalle.balanceGeneral.totalCorrientes,
    detalle.balanceGeneral.totalNoCorrientes,
    detalle.balanceGeneral.totalPasivoPatrimonio,
    detalle.balanceGeneral.totalPasivos,
    detalle.balanceGeneral.totalPasivosCorrientes,
    detalle.balanceGeneral.totalPasivosNoCorrientes,
    detalle.registrosEstadoFinanciero,
    esEstadoFinancieroTotalizado,
    tipoEstadoFinanciero,
    totalesHabilitados,
  ]);

  if (!estaAbierto) return null;

  const actualizarBalanceGeneral = (campo: keyof DetalleBalanceGeneralAnalista, valor: string) => {
    setDetalle((anterior) => ({
      ...anterior,
      balanceGeneral: {
        ...anterior.balanceGeneral,
        [campo]: valor,
      },
    }));
  };

  const actualizarEstadoGanancias = (campo: keyof DetalleEstadoGananciaAnalista, valor: string) => {
    setDetalle((anterior) => ({
      ...anterior,
      estadoGananciasPerdidas: {
        ...anterior.estadoGananciasPerdidas,
        [campo]: valor,
      },
    }));
  };

  const actualizarRatios = (campo: keyof DetalleRatiosBalanceAnalista, valor: string) => {
    setDetalle((anterior) => ({
      ...anterior,
      ratios: {
        ...anterior.ratios,
        [campo]: valor,
      },
    }));
  };

  const actualizarRegistroEstadoFinanciero = (campo: string, valor: string) => {
    setDetalle((anterior) => ({
      ...anterior,
      registrosEstadoFinanciero: {
        ...(anterior.registrosEstadoFinanciero ?? {}),
        [campo]: valor,
      },
    }));
  };

  const actualizarRegistrosEstadoFinanciero = (cambios: Record<string, string>) => {
    setDetalle((anterior) => ({
      ...anterior,
      registrosEstadoFinanciero: {
        ...(anterior.registrosEstadoFinanciero ?? {}),
        ...cambios,
      },
    }));
  };

  const seccionesBalanceConfiguradas = seccionesEstadoFinanciero.filter(
    (seccion) => !/(resultado|ganancia|perdida|profit|ratio)/i.test(`${seccion.id} ${seccion.titulo}`),
  );
  const seccionesGananciasConfiguradas = seccionesEstadoFinanciero.filter(
    (seccion) => /(resultado|ganancia|perdida|profit)/i.test(`${seccion.id} ${seccion.titulo}`),
  );
  const seccionesRatiosConfiguradas = seccionesEstadoFinanciero.filter(
    (seccion) => /ratio/i.test(`${seccion.id} ${seccion.titulo}`),
  );

  const esCampoTotalConfigurado = (etiqueta: string) => /total/i.test(etiqueta);
  const mostrarControlTotales = esEstadoFinancieroTotalizado || seccionesBalanceConfiguradas.some((seccion) => (
    esCampoTotalConfigurado(seccion.titulo)
    || seccion.campos.some((campo) => esCampoTotalConfigurado(`${campo.id} ${campo.etiqueta}`))
  ));

  const renderizarControlesHabilitacion = () => (
    <div className="flex flex-col gap-3 md:flex-row">
      <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          checked={registrosHabilitados}
          onChange={(event) => {
            const estaHabilitado = event.target.checked;
            setDetalle((anterior) => ({
              ...anterior,
              registrosHabilitados: estaHabilitado,
            }));
          }}
          className="h-4 w-4 accent-brand-wine"
        />
        Habilitar Registros
      </label>

      {mostrarControlTotales ? (
        <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={totalesHabilitados}
            onChange={(event) => {
              const estaHabilitado = event.target.checked;
              setDetalle((anterior) => ({
                ...anterior,
                totalesHabilitados: estaHabilitado,
              }));
            }}
            className="h-4 w-4 accent-brand-wine"
          />
          Habilitar Totales
        </label>
      ) : null}
    </div>
  );

  const renderizarBalanceGeneralTotalizado = () => (
    <div className="space-y-6">
      {renderizarControlesHabilitacion()}

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-5">
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-brand-black">• Activos</p>
          <CampoDetalle
            etiqueta="Total Activo Corriente"
            valor={detalle.balanceGeneral.totalCorrientes}
            onChange={(valor) => actualizarBalanceGeneral("totalCorrientes", valor)}
            deshabilitado={!registrosHabilitados}
          />
          <CampoDetalle
            etiqueta="Total Activo No Corriente"
            valor={detalle.balanceGeneral.totalNoCorrientes}
            onChange={(valor) => actualizarBalanceGeneral("totalNoCorrientes", valor)}
            deshabilitado={!registrosHabilitados}
          />
          <CampoDetalle
            etiqueta="Total Activo"
            valor={detalle.balanceGeneral.totalActivos}
            onChange={(valor) => actualizarBalanceGeneral("totalActivos", valor)}
            negrita
            destacado
            claseContenedor="my-2"
            deshabilitado={!totalesHabilitados}
          />
        </div>

        <div className="space-y-5">
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-brand-black">• Pasivos y Patrimonio</p>
          <CampoDetalle
            etiqueta="Total Pasivo Corriente"
            valor={detalle.balanceGeneral.totalPasivosCorrientes}
            onChange={(valor) => actualizarBalanceGeneral("totalPasivosCorrientes", valor)}
            deshabilitado={!registrosHabilitados}
          />
          <CampoDetalle
            etiqueta="Total Pasivo No Corriente"
            valor={detalle.balanceGeneral.totalPasivosNoCorrientes}
            onChange={(valor) => actualizarBalanceGeneral("totalPasivosNoCorrientes", valor)}
            deshabilitado={!registrosHabilitados}
          />
          <CampoDetalle
            etiqueta="Total Pasivos"
            valor={detalle.balanceGeneral.totalPasivos}
            onChange={(valor) => actualizarBalanceGeneral("totalPasivos", valor)}
            negrita
            destacado
            claseContenedor="my-2"
            deshabilitado={!totalesHabilitados}
          />
          <CampoDetalle
            etiqueta="Total Patrimonio"
            valor={detalle.balanceGeneral.patrimonio}
            onChange={(valor) => actualizarBalanceGeneral("patrimonio", valor)}
            permitirNegativo
            negrita
            destacado
            claseContenedor="my-2"
            deshabilitado={!registrosHabilitados}
          />
          <CampoDetalle
            etiqueta="Total Pasivos + Patrimonio"
            valor={detalle.balanceGeneral.totalPasivoPatrimonio}
            onChange={(valor) => actualizarBalanceGeneral("totalPasivoPatrimonio", valor)}
            negrita
            destacado
            claseContenedor="my-2"
            deshabilitado={!totalesHabilitados}
          />
        </div>
      </div>

      {totalesHabilitados && advertenciasTotales.length > 0 ? (
        <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-4">
          {advertenciasTotales.map((advertencia) => (
            <p key={advertencia} className="text-sm text-amber-700">
              {advertencia}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );

  const renderizarCamposConfigurados = ({
    secciones,
    bloquearTodos = false,
    usarHabilitacionTotales = false,
  }: {
    secciones: typeof seccionesEstadoFinanciero;
    bloquearTodos?: boolean;
    usarHabilitacionTotales?: boolean;
  }) => (
    <div className="space-y-5">
      {secciones.map((seccion) => (
        <div key={seccion.id} className="space-y-4 rounded-2xl border border-gray-100 p-4">
          <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-brand-black">{seccion.titulo}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {seccion.campos.map((campo) => {
              const esTotal = esCampoTotalConfigurado(campo.etiqueta);
              const esCalculado = camposCalculadosEstadoFinanciero.has(campo.id);
              const esDestacado = esTotal || esCalculado;
              const esSeccionRatios = /ratio/i.test(`${seccion.id} ${seccion.titulo}`);
              const esRatioPorcentaje = camposRatioPorcentaje.has(campo.id);
              const valorCampo = detalle.registrosEstadoFinanciero?.[campo.id] ?? "";
              const deshabilitadoBase = bloquearTodos
                ? true
                : usarHabilitacionTotales
                  ? (esTotal ? !totalesHabilitados : !registrosHabilitados)
                  : false;
              const deshabilitado = deshabilitadoBase || (esCalculado && !esTotal);
              const tipoEntradaCampo = obtenerTipoEntradaCampoEstadoFinanciero(campo);

              if (tipoEntradaCampo === "selector-ano") {
                return (
                  <CampoDetalleAno
                    key={campo.id}
                    etiqueta={campo.etiqueta}
                    valor={valorCampo}
                    onChange={(valor) => actualizarRegistroEstadoFinanciero(campo.id, valor)}
                    deshabilitado={deshabilitado}
                  />
                );
              }

              if (tipoEntradaCampo === "fecha") {
                return (
                  <CampoDetalleFecha
                    key={campo.id}
                    etiqueta={campo.etiqueta}
                    valor={valorCampo}
                    onChange={(valor) => actualizarRegistroEstadoFinanciero(campo.id, valor)}
                    deshabilitado={deshabilitado}
                  />
                );
              }

              if (tipoEntradaCampo === "entero") {
                return (
                  <CampoDetalleEntero
                    key={campo.id}
                    etiqueta={campo.etiqueta}
                    valor={valorCampo}
                    onChange={(valor) => actualizarRegistroEstadoFinanciero(campo.id, valor)}
                    deshabilitado={deshabilitado}
                    placeholder={obtenerPlaceholderCampoEntero(campo.etiqueta)}
                  />
                );
              }

              if (tipoEntradaCampo === "selector-moneda-nombre") {
                const idNumericoMoneda = valorCampo && /^\d+$/.test(valorCampo.trim()) ? Number(valorCampo) : null;
                const opcionMonedaActual = idNumericoMoneda != null
                  ? opcionesMoneda?.find((o) => o.num1 === idNumericoMoneda)
                  : opcionesMoneda?.find((o) => o.string1 === valorCampo);

                return (
                  <div key={campo.id} className="space-y-2">
                    <CustomLabel as="p" className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
                      {campo.etiqueta}
                    </CustomLabel>
                    <CustomSelectorBuscable
                      options={opcionesMoneda}
                      value={opcionMonedaActual?.num1 ?? undefined}
                      displayValue={opcionMonedaActual?.string1 ?? ""}
                      onChange={(valor) => {
                        const idStr = String(valor ?? "");
                        if (campo.id === "currency") {
                          actualizarRegistrosEstadoFinanciero({ currency: idStr, "currency-iso": idStr, "currency-p": idStr });
                        } else if (campo.id === "currency-p") {
                          actualizarRegistrosEstadoFinanciero({ "currency-p": idStr, currency: idStr, "currency-iso": idStr });
                        } else {
                          actualizarRegistroEstadoFinanciero(campo.id, idStr);
                        }
                      }}
                      onClear={() => {
                        if (campo.id === "currency") {
                          actualizarRegistrosEstadoFinanciero({ currency: "", "currency-iso": "", "currency-p": "" });
                        } else if (campo.id === "currency-p") {
                          actualizarRegistrosEstadoFinanciero({ "currency-p": "", currency: "", "currency-iso": "" });
                        } else {
                          actualizarRegistroEstadoFinanciero(campo.id, "");
                        }
                      }}
                      optional
                      mostrarTextoOpcionalEnLabel={false}
                      placeholder="Seleccione moneda"
                      disabled={deshabilitado}
                    />
                  </div>
                );
              }

              if (tipoEntradaCampo === "selector-moneda-codigo") {
                const idNumericoIso = valorCampo && /^\d+$/.test(valorCampo.trim()) ? Number(valorCampo) : null;
                const opcionIsoActual = idNumericoIso != null
                  ? opcionesMoneda?.find((o) => o.num1 === idNumericoIso)
                  : opcionesMoneda?.find((o) => o.string2 === valorCampo);

                return (
                  <div key={campo.id} className="space-y-2">
                    <CustomLabel as="p" className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
                      {campo.etiqueta}
                    </CustomLabel>
                    <CustomSelectorBuscable
                      options={opcionesMoneda}
                      value={opcionIsoActual?.num1 ?? undefined}
                      displayValue={opcionIsoActual?.string2 ?? ""}
                      obtenerEtiquetaOpcion={(opcion) => opcion.string2 ?? opcion.string1 ?? ""}
                      onChange={(valor) => {
                        const idStr = String(valor ?? "");
                        if (campo.id === "currency-iso") {
                          actualizarRegistrosEstadoFinanciero({ "currency-iso": idStr, currency: idStr, "currency-p": idStr });
                        } else {
                          actualizarRegistroEstadoFinanciero(campo.id, idStr);
                        }
                      }}
                      onClear={() => {
                        if (campo.id === "currency-iso") {
                          actualizarRegistrosEstadoFinanciero({ "currency-iso": "", currency: "", "currency-p": "" });
                        } else {
                          actualizarRegistroEstadoFinanciero(campo.id, "");
                        }
                      }}
                      optional
                      mostrarTextoOpcionalEnLabel={false}
                      placeholder="Seleccione ISO"
                      disabled={deshabilitado}
                    />
                  </div>
                );
              }

              if (tipoEntradaCampo === "selector-confiabilidad") {
                return (
                  <div key={campo.id}>
                    <SelectorMaestroConAltaInvestigacionAnalista
                      etiqueta={campo.etiqueta}
                      valor={valorCampo}
                      soloLectura={deshabilitado}
                      idMaestro={TablaMaestraId.NIVEL_CONFIABILIDAD}
                      opcionesTablaMaestra={opcionesNivelConfiabilidad}
                      permiteAltaNueva
                      marcador="Seleccione nivel"
                      obtenerValorOpcion={(opcion) => String(opcion.num1 ?? "")}
                      onChange={(valor) => actualizarRegistroEstadoFinanciero(campo.id, valor)}
                    />
                  </div>
                );
              }

              return (
                <CampoDetalle
                  key={campo.id}
                  etiqueta={campo.etiqueta}
                  valor={valorCampo}
                  onChange={(valor) => actualizarRegistroEstadoFinanciero(campo.id, valor)}
                  permitirNegativo
                  negrita={esDestacado}
                  destacado={esDestacado}
                  claseContenedor={esDestacado && !esSeccionRatios ? "md:col-span-2 my-2" : ""}
                  mostrarComoPorcentaje={esRatioPorcentaje}
                  deshabilitado={deshabilitado}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  const tabs = [
    {
      id: "balance-general",
      label: "Balance General",
      content: (
        esEstadoFinancieroTotalizado
          ? renderizarBalanceGeneralTotalizado()
          : (
            <div className="space-y-6">
              {renderizarControlesHabilitacion()}

              {seccionesBalanceConfiguradas.length > 0 ? (
                renderizarCamposConfigurados({
                  secciones: seccionesBalanceConfiguradas,
                  usarHabilitacionTotales: true,
                })
              ) : (
                <div className="grid gap-8 lg:grid-cols-2">
                  <div className="space-y-5">
                    <p className="text-sm font-bold uppercase tracking-[0.12em] text-brand-black">• Activos</p>
                    <CampoDetalle etiqueta="Total Corrientes" valor={detalle.balanceGeneral.totalCorrientes} onChange={(valor) => actualizarBalanceGeneral("totalCorrientes", valor)} deshabilitado={!registrosHabilitados} />
                    <CampoDetalle etiqueta="Total No Corrientes" valor={detalle.balanceGeneral.totalNoCorrientes} onChange={(valor) => actualizarBalanceGeneral("totalNoCorrientes", valor)} deshabilitado={!registrosHabilitados} />
                    <CampoDetalle etiqueta="Otros Activos" valor={detalle.balanceGeneral.otrosActivos} onChange={(valor) => actualizarBalanceGeneral("otrosActivos", valor)} deshabilitado={!registrosHabilitados} />
                    <CampoDetalle etiqueta="Total Activos" valor={detalle.balanceGeneral.totalActivos} onChange={(valor) => actualizarBalanceGeneral("totalActivos", valor)} negrita destacado claseContenedor="my-2" deshabilitado={!totalesHabilitados} />
                    {totalesHabilitados && advertenciasTotales.find((advertencia) => advertencia.startsWith("Total Activos")) ? (
                      <p className="text-sm text-amber-700">
                        {advertenciasTotales.find((advertencia) => advertencia.startsWith("Total Activos"))}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-5">
                    <p className="text-sm font-bold uppercase tracking-[0.12em] text-brand-black">• Pasivos y Patrimonio</p>
                    <CampoDetalle etiqueta="Total Pasivos Corrientes" valor={detalle.balanceGeneral.totalPasivosCorrientes} onChange={(valor) => actualizarBalanceGeneral("totalPasivosCorrientes", valor)} deshabilitado={!registrosHabilitados} />
                    <CampoDetalle etiqueta="Total Pasivos No Corrientes" valor={detalle.balanceGeneral.totalPasivosNoCorrientes} onChange={(valor) => actualizarBalanceGeneral("totalPasivosNoCorrientes", valor)} deshabilitado={!registrosHabilitados} />
                    <CampoDetalle etiqueta="Otros Pasivos" valor={detalle.balanceGeneral.otrosPasivos} onChange={(valor) => actualizarBalanceGeneral("otrosPasivos", valor)} deshabilitado={!registrosHabilitados} />
                    <CampoDetalle etiqueta="Total Pasivos" valor={detalle.balanceGeneral.totalPasivos} onChange={(valor) => actualizarBalanceGeneral("totalPasivos", valor)} negrita destacado claseContenedor="my-2" deshabilitado={!totalesHabilitados} />
                    {totalesHabilitados && advertenciasTotales.find((advertencia) => advertencia.startsWith("Total Pasivos")) ? (
                      <p className="text-sm text-amber-700">
                        {advertenciasTotales.find((advertencia) => advertencia.startsWith("Total Pasivos"))}
                      </p>
                    ) : null}
                    <CampoDetalle etiqueta="Patrimonio" valor={detalle.balanceGeneral.patrimonio} onChange={(valor) => actualizarBalanceGeneral("patrimonio", valor)} permitirNegativo deshabilitado={!registrosHabilitados} />
                    <CampoDetalle etiqueta="Total Pasivo y Patrimonio" valor={detalle.balanceGeneral.totalPasivoPatrimonio} onChange={(valor) => actualizarBalanceGeneral("totalPasivoPatrimonio", valor)} negrita destacado claseContenedor="my-2" deshabilitado={!totalesHabilitados} />
                    {totalesHabilitados && advertenciasTotales.find((advertencia) => advertencia.startsWith("Total Pasivo y Patrimonio")) ? (
                      <p className="text-sm text-amber-700">
                        {advertenciasTotales.find((advertencia) => advertencia.startsWith("Total Pasivo y Patrimonio"))}
                      </p>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          )
      ),
    },
    {
      id: "estado-ganancias",
      label: "Estado de Ganancias y Pérdidas",
      content: (
        <div className="space-y-6">
          {seccionesGananciasConfiguradas.length > 0 ? (
            renderizarCamposConfigurados({
              secciones: seccionesGananciasConfiguradas,
            })
          ) : (
            <div className="grid gap-8 md:grid-cols-2">
              <CampoDetalle etiqueta="Ventas Netas" valor={detalle.estadoGananciasPerdidas.ventasNetas} onChange={(valor) => actualizarEstadoGanancias("ventasNetas", valor)} />
              <CampoDetalle etiqueta="Utilidad / Ganancia" valor={detalle.estadoGananciasPerdidas.utilidadGanancia} onChange={(valor) => actualizarEstadoGanancias("utilidadGanancia", valor)} permitirNegativo />
            </div>
          )}
        </div>
      ),
    },
    {
      id: "ratios",
      label: "Ratios",
      disabled: !mostrarRatios,
      tooltip: "Los ratios se habilitan para estados financieros Desagregado, Totalizado o Turquía.",
      content: (
        <div className="space-y-6">
          {seccionesRatiosConfiguradas.length > 0 ? (
            renderizarCamposConfigurados({
              secciones: seccionesRatiosConfiguradas,
              bloquearTodos: true,
            })
          ) : (
            <div className="grid gap-8 md:grid-cols-2">
              <CampoDetalle etiqueta="Índice de Liquidez" valor={detalle.ratios.liquidez} onChange={(valor) => actualizarRatios("liquidez", valor)} permitirNegativo destacado deshabilitado />
              <CampoDetalle etiqueta="Capital de Trabajo" valor={detalle.ratios.capitalTrabajo} onChange={(valor) => actualizarRatios("capitalTrabajo", valor)} permitirNegativo destacado deshabilitado />
              <CampoDetalle etiqueta="Ratio de Endeudamiento" valor={detalle.ratios.endeudamiento} onChange={(valor) => actualizarRatios("endeudamiento", valor)} permitirNegativo destacado mostrarComoPorcentaje deshabilitado />
              <CampoDetalle etiqueta="Ratio de Rentabilidad" valor={detalle.ratios.rentabilidad} onChange={(valor) => actualizarRatios("rentabilidad", valor)} permitirNegativo destacado mostrarComoPorcentaje deshabilitado />
            </div>
          )}
        </div>
      ),
    },
  ];

  const validarTotalesBalance = () => {
    if (!esEstadoFinancieroTotalizado && seccionesBalanceConfiguradas.length > 0) {
      const r = detalle.registrosEstadoFinanciero ?? {};
      const n = (campo: string) => obtenerNumero(r[campo] ?? "");
      const clave = normalizarTexto(tipoEstadoFinanciero);

      type ParValidacion = { activos: string; pasivoPatrimonio: string };
      const par: ParValidacion | null = clave.includes("desagregado")
        ? { activos: "total-activo", pasivoPatrimonio: "total-pasivo-patrimonio" }
        : clave.includes("banco")
          ? { activos: "total-activos-bancos", pasivoPatrimonio: "total-pasivo-patrimonio-bancos" }
          : clave.includes("seguro")
            ? { activos: "total-activos-seguros", pasivoPatrimonio: "total-pasivo-patrimonio-seguros" }
            : clave.includes("turquia")
              ? { activos: "total-assets-turquia", pasivoPatrimonio: "total-liabilities-equity" }
              : null;

      if (par) {
        const totalActivos = n(par.activos);
        const totalPasivoPatrimonio = n(par.pasivoPatrimonio);
        if (
          (totalActivos !== 0 || totalPasivoPatrimonio !== 0)
          && Math.abs(totalActivos - totalPasivoPatrimonio) > 0.01
        ) {
          toast.error(
            `Total Activos debe ser igual a Total Pasivos + Patrimonio (${formatearNumero(totalPasivoPatrimonio)}).`,
          );
          return false;
        }
      }

      return true;
    }

    const totalActivos = obtenerNumero(detalle.balanceGeneral.totalActivos);
    const totalPasivos = obtenerNumero(detalle.balanceGeneral.totalPasivos);
    const patrimonio = obtenerNumero(detalle.balanceGeneral.patrimonio);
    const totalPasivoPatrimonio = obtenerNumero(detalle.balanceGeneral.totalPasivoPatrimonio);
    const totalPasivoPatrimonioMinimo = totalPasivos + patrimonio;

    if (totalesHabilitados) {
      if (Math.abs(totalPasivoPatrimonio - totalPasivoPatrimonioMinimo) > 0.000001) {
        toast.error("Total Pasivo y Patrimonio debe ser igual a Total Pasivos + Patrimonio.");
        return false;
      }

      if (Math.abs(totalActivos - totalPasivoPatrimonio) > 0.000001) {
        toast.error("Total Activos debe ser igual a Total Pasivo y Patrimonio.");
        return false;
      }

      return true;
    }

    if (Math.abs(totalPasivoPatrimonio - totalPasivoPatrimonioMinimo) > 0.000001) {
      toast.error("Total Pasivo y Patrimonio debe ser igual a Total Pasivos + Patrimonio.");
      return false;
    }

    if (Math.abs(totalActivos - totalPasivoPatrimonioMinimo) > 0.000001) {
      toast.error("Total Activos debe ser igual a la suma de Total Pasivos + Patrimonio.");
      return false;
    }

    return true;
  };

  const limpiarCerosDetalle = (detalleActual: DetalleCuentasBalanceAnalista): DetalleCuentasBalanceAnalista => ({
    ...detalleActual,
    balanceGeneral: {
      totalCorrientes: esValorCeroOBlanco(detalleActual.balanceGeneral.totalCorrientes) ? "" : detalleActual.balanceGeneral.totalCorrientes,
      totalNoCorrientes: esValorCeroOBlanco(detalleActual.balanceGeneral.totalNoCorrientes) ? "" : detalleActual.balanceGeneral.totalNoCorrientes,
      otrosActivos: esValorCeroOBlanco(detalleActual.balanceGeneral.otrosActivos) ? "" : detalleActual.balanceGeneral.otrosActivos,
      totalActivos: esValorCeroOBlanco(detalleActual.balanceGeneral.totalActivos) ? "" : detalleActual.balanceGeneral.totalActivos,
      totalPasivosCorrientes: esValorCeroOBlanco(detalleActual.balanceGeneral.totalPasivosCorrientes) ? "" : detalleActual.balanceGeneral.totalPasivosCorrientes,
      totalPasivosNoCorrientes: esValorCeroOBlanco(detalleActual.balanceGeneral.totalPasivosNoCorrientes) ? "" : detalleActual.balanceGeneral.totalPasivosNoCorrientes,
      otrosPasivos: esValorCeroOBlanco(detalleActual.balanceGeneral.otrosPasivos) ? "" : detalleActual.balanceGeneral.otrosPasivos,
      totalPasivos: esValorCeroOBlanco(detalleActual.balanceGeneral.totalPasivos) ? "" : detalleActual.balanceGeneral.totalPasivos,
      patrimonio: esValorCeroOBlanco(detalleActual.balanceGeneral.patrimonio) ? "" : detalleActual.balanceGeneral.patrimonio,
      totalPasivoPatrimonio: esValorCeroOBlanco(detalleActual.balanceGeneral.totalPasivoPatrimonio) ? "" : detalleActual.balanceGeneral.totalPasivoPatrimonio,
    },
    estadoGananciasPerdidas: {
      ventasNetas: esValorCeroOBlanco(detalleActual.estadoGananciasPerdidas.ventasNetas) ? "" : detalleActual.estadoGananciasPerdidas.ventasNetas,
      utilidadGanancia: esValorCeroOBlanco(detalleActual.estadoGananciasPerdidas.utilidadGanancia) ? "" : detalleActual.estadoGananciasPerdidas.utilidadGanancia,
    },
    ratios: {
      liquidez: esValorCeroOBlanco(detalleActual.ratios.liquidez) ? "" : detalleActual.ratios.liquidez,
      capitalTrabajo: esValorCeroOBlanco(detalleActual.ratios.capitalTrabajo) ? "" : detalleActual.ratios.capitalTrabajo,
      endeudamiento: esValorCeroOBlanco(detalleActual.ratios.endeudamiento) ? "" : detalleActual.ratios.endeudamiento,
      rentabilidad: esValorCeroOBlanco(detalleActual.ratios.rentabilidad) ? "" : detalleActual.ratios.rentabilidad,
    },
    registrosEstadoFinanciero: Object.fromEntries(
      Object.entries(detalleActual.registrosEstadoFinanciero ?? {}).map(([clave, valor]) => [
        clave,
        esValorCeroOBlanco(valor) ? "" : valor,
      ]),
    ),
  });

  return (
    <CustomModalPestanas
      isOpen={estaAbierto}
      onClose={onCerrar}
      title="Detalle de Cuentas"
      subtitle={<p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8ea0c0]">Gestión de cuentas contables</p>}
      tabs={tabs}
      activeTab={pestanaActiva}
      onTabChange={setPestanaActiva}
      tabVariant="underline"
      maxWidth="max-w-5xl"
      footer={(
        <div className="flex justify-end gap-3">
          <CustomButton variant="secondary" size="sm" onClick={onCerrar}>
            Cancelar
          </CustomButton>
          <CustomButton
            size="sm"
            onClick={() => {
              if (!validarTotalesBalance()) return;
              onGuardar(limpiarCerosDetalle(detalle));
            }}
          >
            Guardar Cambios
          </CustomButton>
        </div>
      )}
    />
  );
}
