import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Calculator,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { CustomCampoFechaInvestigacion } from "@maximilian/components/investigacion/CustomCampoFechaInvestigacion";
import { CustomModalPestanas } from "@maximilian/components/common/CustomModalPestanas";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
import { SelectorMaestroConAltaInvestigacionAnalista } from "@maximilian/components/investigacion/ControlesInforme";
import { informeService } from "@maximilian/services/informe.service";
import { servicioTablaMaestra } from "@maximilian/services/tablaMaestra.service";
import type {
  DetalleBalanceGeneralAnalista,
  DetalleCuentasBalanceAnalista,
  DetalleEstadoGananciaAnalista,
  DetalleRatiosBalanceAnalista,
} from "@maximilian/shared/types/investigacion.type";
import { TablaMaestraId } from "@maximilian/shared/types/tabla-maestra.type";
import { traducirOpcionesTablaMaestra } from "@maximilian/shared/utils/tabla-maestra-idioma.util";
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
  idIdioma?: number;
  soloLectura?: boolean;
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

function sanitizarNumero(valor: string, permitirNegativo = false) {
  return sanitizarMontoDosDecimales(valor, permitirNegativo);
}

function esValorCeroOBlanco(valor: string) {
  const texto = valor.trim();
  if (!texto || texto === "-" || texto === "-.") return true;
  return Math.abs(obtenerNumero(texto)) < 0.000001;
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
  "ebit",
  "ebitda",
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
  onCalcular,
  calculando = false,
  azul = false,
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
  onCalcular?: () => void;
  calculando?: boolean;
  azul?: boolean;
}) {
  const valorMostrado = mostrarComoPorcentaje
    ? `${formatearNumero(obtenerNumero(valor))}%`
    : valor;

  return (
    <div
      className={`space-y-2 rounded-lg border p-3 transition-colors ${azul ? "border-blue-200 bg-blue-50" : destacado ? "border-brand-wine/25 bg-white shadow-sm ring-1 ring-brand-wine/5" : "border-slate-200 bg-white hover:border-slate-300"} ${claseContenedor}`}
    >
      <div className="flex items-center justify-between gap-3">
        <CustomLabel
          as="p"
          className={`text-[10px] font-bold uppercase leading-4 tracking-[0.12em] ${azul ? "text-blue-700" : destacado ? "text-brand-wine" : "text-slate-600"}`}
        >
          {etiqueta}
        </CustomLabel>
        {onCalcular ? (
          <CustomButton
            type="button"
            variant="secondary"
            size="sm"
            className="h-8 shrink-0 px-3 text-xs"
            loading={calculando}
            loadingText=""
            onClick={onCalcular}
          >
            <Calculator size={14} />
            Calcular
          </CustomButton>
        ) : null}
      </div>
      <input
        value={valorMostrado}
        disabled={deshabilitado}
        onChange={(event) =>
          onChange(sanitizarNumero(event.target.value, permitirNegativo))
        }
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
        className={`h-10 w-full rounded-md border px-3 text-right text-sm tabular-nums outline-none transition-all focus:border-brand-black focus:ring-2 focus:ring-brand-black/5 disabled:cursor-not-allowed disabled:text-slate-500 ${azul ? "border-blue-300 bg-blue-100 text-blue-800 disabled:bg-blue-100 disabled:text-blue-700" : destacado ? "border-brand-wine/20 bg-brand-wine/5 text-brand-wine disabled:bg-brand-wine/5 disabled:text-brand-wine/70" : "border-slate-200 bg-white text-slate-700 disabled:bg-slate-100 disabled:text-slate-400"} ${negrita || destacado || azul ? "font-bold" : ""}`}
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
      <CustomLabel
        as="p"
        className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600"
      >
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
    return Number.isFinite(n)
      ? Math.floor(n / 10) * 10
      : Math.floor(anoActual / 10) * 10;
  };

  const [decadaBase, setDecadaBase] = useState(() => calcularDecadaBase(valor));
  const anos = Array.from({ length: 12 }, (_, i) => decadaBase + i);

  useEffect(() => {
    if (!abierto) return;
    const manejarClickFuera = (evento: MouseEvent) => {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(evento.target as Node)
      ) {
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
      <CustomLabel
        as="p"
        className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600"
      >
        {etiqueta}
      </CustomLabel>
      <div className="relative">
        <input
          value={valor}
          disabled={deshabilitado}
          onChange={(evento) =>
            onChange(evento.target.value.replace(/\D/g, "").slice(0, 4))
          }
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

  if (
    etiquetaNormalizada.includes("ano") ||
    etiquetaNormalizada.includes("year")
  ) {
    return "Ej. 2026";
  }

  if (
    etiquetaNormalizada.includes("duracion del periodo") ||
    etiquetaNormalizada.includes("length of period")
  ) {
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

function obtenerGrupoVisualTurquia(campoId: string) {
  if (
    [
      "year",
      "balance-date",
      "currency",
      "currency-iso",
      "length-period",
      "reliability-level",
      "exchange-rate",
      "balance-date-p",
      "currency-p",
      "exchange-rate-p",
    ].includes(campoId)
  ) {
    return "Datos del periodo";
  }

  if (["cash", "stocks", "creditors", "current-total"].includes(campoId)) {
    return "Activo corriente";
  }

  if (
    [
      "tangible-assets",
      "intangible-assets",
      "net-fixed",
      "total-assets-turquia",
    ].includes(campoId)
  ) {
    return "Activo no corriente";
  }

  if (
    [
      "loans",
      "debtors",
      "current-liabilities",
      "non-current-liabilities",
      "long-term-liabilities",
      "total-non-current-liabilities",
      "total-liabilities",
    ].includes(campoId)
  ) {
    return "Pasivo";
  }

  if (
    [
      "capital",
      "reserves",
      "retained-earnings",
      "profit-loss-for-year",
      "other-accounts",
      "total-equity",
      "total-liabilities-equity",
    ].includes(campoId)
  ) {
    return "Patrimonio";
  }

  if (
    ["turnover", "costs-goods-sold", "material-costs", "gross-profit"].includes(
      campoId,
    )
  ) {
    return "Ventas y costo";
  }

  if (
    [
      "other-operating-expenses",
      "costs-employees",
      "depreciation",
    ].includes(campoId)
  ) {
    return "Gastos operativos";
  }

  if (
    [
      "financial-revenue",
      "financial-expenses",
      "interest-paid",
      "financial-pl",
    ].includes(campoId)
  ) {
    return "Resultado financiero";
  }

  if (
    [
      "extra-other-revenue",
      "extra-other-expenses",
      "extra-other-pl",
    ].includes(campoId)
  ) {
    return "Otros resultados";
  }

  if (
    [
      "profit-loss-before-taxes",
      "taxation",
      "profit-loss-after-taxes",
      "ebit",
      "ebitda",
      "profit",
    ].includes(campoId)
  ) {
    return "Cierre del periodo";
  }

  return "";
}

export function CustomModalDetalleCuentasAnalista({
  estaAbierto,
  onCerrar,
  onGuardar,
  detalleInicial,
  tipoEstadoFinanciero,
  idIdioma,
  soloLectura = false,
}: PropsCustomModalDetalleCuentasAnalista) {
  const detalleBase = useMemo(
    () => detalleInicial ?? crearDetalleVacio(),
    [detalleInicial],
  );
  const [detalle, setDetalle] =
    useState<DetalleCuentasBalanceAnalista>(detalleBase);
  const [pestanaActiva, setPestanaActiva] = useState("balance-general");
  const { data: opcionesMonedaBase } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.MONEDA],
    queryFn: () => servicioTablaMaestra.list(TablaMaestraId.MONEDA),
    staleTime: Infinity,
  });
  const { data: opcionesNivelConfiabilidadBase } = useQuery({
    queryKey: ["masterTable", TablaMaestraId.NIVEL_CONFIABILIDAD],
    queryFn: () =>
      servicioTablaMaestra.list(TablaMaestraId.NIVEL_CONFIABILIDAD),
    staleTime: Infinity,
  });
  const opcionesMoneda = useMemo(() => traducirOpcionesTablaMaestra(opcionesMonedaBase, idIdioma), [idIdioma, opcionesMonedaBase]);
  const opcionesNivelConfiabilidad = useMemo(() => traducirOpcionesTablaMaestra(opcionesNivelConfiabilidadBase, idIdioma), [idIdioma, opcionesNivelConfiabilidadBase]);

  useEffect(() => {
    setDetalle(detalleBase);
  }, [detalleBase]);

  const mostrarRatios = ["Desagregado", "Totalizado", "Turquía"].includes(
    tipoEstadoFinanciero ?? "",
  );
  const esEstadoFinancieroTotalizado =
    normalizarTexto(tipoEstadoFinanciero) === "totalizado";
  const esEstadoFinancieroTurquia =
    normalizarTexto(tipoEstadoFinanciero).includes("turqu");
  const totalesHabilitados = detalle.totalesHabilitados ?? false;
  const registrosHabilitados = detalle.registrosHabilitados ?? false;
  const seccionesEstadoFinanciero = useMemo(
    () => obtenerConfiguracionEstadoFinanciero(tipoEstadoFinanciero),
    [tipoEstadoFinanciero],
  );
  useEffect(() => {
    if (!mostrarRatios && pestanaActiva === "ratios") {
      setPestanaActiva("balance-general");
    }
  }, [mostrarRatios, pestanaActiva]);

  const mutacionCalcular = useMutation({
    mutationFn: (campoObjetivo: string) =>
      informeService.calcularBalance({
        tipoEstadoFinanciero: tipoEstadoFinanciero ?? "",
        campoObjetivo,
        tipoBalanceTurquia: detalle.tipoBalanceTurquia,
        registros: detalle.registrosEstadoFinanciero ?? {},
        balanceGeneral: detalle.balanceGeneral as unknown as Record<
          string,
          string
        >,
        estadoGananciasPerdidas:
          detalle.estadoGananciasPerdidas as unknown as Record<string, string>,
      }),
    onSuccess: (registrosCalculados, campoObjetivo) => {
      const valorCalculado = registrosCalculados[campoObjetivo];
      if (valorCalculado == null) return;

      const equivalenciasBalanceTotalizado: Partial<
        Record<string, keyof DetalleBalanceGeneralAnalista>
      > = {
        "total-activo-corriente": "totalCorrientes",
        "total-activo-no-corriente": "totalNoCorrientes",
        "total-activo": "totalActivos",
        "total-pasivo-corriente": "totalPasivosCorrientes",
        "total-pasivo-no-corriente": "totalPasivosNoCorrientes",
        "total-pasivos": "totalPasivos",
        "total-patrimonio": "patrimonio",
        "total-pasivo-patrimonio": "totalPasivoPatrimonio",
      };
      const campoBalanceGeneral = equivalenciasBalanceTotalizado[campoObjetivo];
      const valorFormateado = formatearNumero(obtenerNumero(valorCalculado));
      const camposGananciaTurquia: Record<string, string> =
        esEstadoFinancieroTurquia &&
        ["profit-loss-after-taxes", "profit"].includes(campoObjetivo)
          ? {
              "profit-loss-after-taxes": valorFormateado,
              profit: valorFormateado,
            }
          : {};

      setDetalle((anterior) => ({
        ...anterior,
        balanceGeneral:
          esEstadoFinancieroTotalizado && campoBalanceGeneral
            ? {
                ...anterior.balanceGeneral,
                [campoBalanceGeneral]: valorFormateado,
              }
            : anterior.balanceGeneral,
        registrosEstadoFinanciero: {
          ...(anterior.registrosEstadoFinanciero ?? {}),
          [campoObjetivo]: valorFormateado,
          ...camposGananciaTurquia,
        },
      }));
    },
  });

  const mutacionCalcularRatios = useMutation({
    mutationFn: () =>
      informeService.calcularBalance({
        tipoEstadoFinanciero: tipoEstadoFinanciero ?? "",
        tipoBalanceTurquia: detalle.tipoBalanceTurquia,
        registros: detalle.registrosEstadoFinanciero ?? {},
        balanceGeneral: detalle.balanceGeneral as unknown as Record<
          string,
          string
        >,
        estadoGananciasPerdidas:
          detalle.estadoGananciasPerdidas as unknown as Record<string, string>,
      }),
    onSuccess: (registrosCalculados) => {
      const idsRatios = new Set(
        seccionesRatiosConfiguradas.flatMap((seccion) =>
          seccion.campos.map((campo) => campo.id),
        ),
      );
      const ratiosCalculados = Object.fromEntries(
        Object.entries(registrosCalculados)
          .filter(([campo]) => idsRatios.has(campo))
          .map(([campo, valor]) => [
            campo,
            formatearNumero(obtenerNumero(valor)),
          ]),
      );

      setDetalle((anterior) => ({
        ...anterior,
        registrosEstadoFinanciero: {
          ...(anterior.registrosEstadoFinanciero ?? {}),
          ...ratiosCalculados,
        },
      }));
    },
  });

  if (!estaAbierto) return null;

  const actualizarBalanceGeneral = (
    campo: keyof DetalleBalanceGeneralAnalista,
    valor: string,
  ) => {
    setDetalle((anterior) => ({
      ...anterior,
      balanceGeneral: {
        ...anterior.balanceGeneral,
        [campo]: valor,
      },
    }));
  };

  const actualizarEstadoGanancias = (
    campo: keyof DetalleEstadoGananciaAnalista,
    valor: string,
  ) => {
    setDetalle((anterior) => ({
      ...anterior,
      estadoGananciasPerdidas: {
        ...anterior.estadoGananciasPerdidas,
        [campo]: valor,
      },
    }));
  };

  const actualizarRatios = (
    campo: keyof DetalleRatiosBalanceAnalista,
    valor: string,
  ) => {
    setDetalle((anterior) => ({
      ...anterior,
      ratios: {
        ...anterior.ratios,
        [campo]: valor,
      },
    }));
  };

  const actualizarRegistroEstadoFinanciero = (campo: string, valor: string) => {
    const camposSincronizados: Record<string, string> = {};
    if (esEstadoFinancieroTurquia) {
      if (campo === "balance-date" || campo === "balance-date-p") {
        camposSincronizados["balance-date"] = valor;
        camposSincronizados["balance-date-p"] = valor;
      }
      if (campo === "exchange-rate" || campo === "exchange-rate-p") {
        camposSincronizados["exchange-rate"] = valor;
        camposSincronizados["exchange-rate-p"] = valor;
      }
    }

    setDetalle((anterior) => ({
      ...anterior,
      registrosEstadoFinanciero: {
        ...(anterior.registrosEstadoFinanciero ?? {}),
        [campo]: valor,
        ...camposSincronizados,
      },
    }));
  };

  const actualizarRegistrosEstadoFinanciero = (
    cambios: Record<string, string>,
  ) => {
    setDetalle((anterior) => ({
      ...anterior,
      registrosEstadoFinanciero: {
        ...(anterior.registrosEstadoFinanciero ?? {}),
        ...cambios,
      },
    }));
  };

  const seccionesBalanceConfiguradas = seccionesEstadoFinanciero.filter(
    (seccion) =>
      !/(resultado|ganancia|perdida|profit|ratio)/i.test(
        `${seccion.id} ${seccion.titulo}`,
      ),
  );
  const seccionesGananciasConfiguradas = seccionesEstadoFinanciero.filter(
    (seccion) =>
      /(resultado|ganancia|perdida|profit)/i.test(
        `${seccion.id} ${seccion.titulo}`,
      ),
  );
  const seccionesRatiosConfiguradas = seccionesEstadoFinanciero.filter(
    (seccion) => /ratio/i.test(`${seccion.id} ${seccion.titulo}`),
  );

  const esCampoTotalConfigurado = (etiqueta: string) => /total/i.test(etiqueta);
  const mostrarControlTotales =
    esEstadoFinancieroTotalizado ||
    seccionesBalanceConfiguradas.some(
      (seccion) =>
        esCampoTotalConfigurado(seccion.titulo) ||
        seccion.campos.some((campo) =>
          esCampoTotalConfigurado(`${campo.id} ${campo.etiqueta}`),
        ),
    );

  const renderizarControlesHabilitacion = () => {
    if (soloLectura) return null;

    return (
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 md:flex-row">
      <label
        className={`flex flex-1 cursor-pointer items-center justify-between gap-4 rounded-md border px-4 py-3 text-sm font-semibold transition-colors ${
          registrosHabilitados
            ? "border-brand-wine/30 bg-brand-wine/5 text-brand-wine"
            : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
        }`}
      >
        <span>Habilitar Registros</span>
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
      </label>

      {mostrarControlTotales ? (
        <label
          className={`flex flex-1 cursor-pointer items-center justify-between gap-4 rounded-md border px-4 py-3 text-sm font-semibold transition-colors ${
            totalesHabilitados
              ? "border-brand-wine/30 bg-brand-wine/5 text-brand-wine"
              : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
          }`}
        >
          <span>Habilitar Totales</span>
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
        </label>
      ) : null}
    </div>
    );
  };

  const renderizarSelectorTipoBalanceTurquia = () => {
    if (!esEstadoFinancieroTurquia) return null;

    const opciones = [
      {
        idEmpresa: 0,
        idTablaMaestra: 1,
        idMaestro: 0,
        descripcion: "Consolidado",
        num1: 1,
        num2: null,
        num3: null,
        string1: "Consolidado (C)",
        string2: "C",
        string3: null,
        date1: null,
        date2: null,
        date3: null,
      },
      {
        idEmpresa: 0,
        idTablaMaestra: 2,
        idMaestro: 0,
        descripcion: "Individual",
        num1: 2,
        num2: null,
        num3: null,
        string1: "Individual (I)",
        string2: "I",
        string3: null,
        date1: null,
        date2: null,
        date3: null,
      },
    ];
    const valorActual = detalle.tipoBalanceTurquia ?? "I";

    return (
      <div className="rounded-2xl border border-gray-100 bg-slate-50 p-4">
        <CustomLabel as="p" required>
          Alcance del balance de Turquía
        </CustomLabel>
        <div className="mt-2 grid items-center gap-3 md:grid-cols-[minmax(0,20rem)_1fr]">
          <CustomSelectorBuscable
            options={opciones}
            value={valorActual === "C" ? 1 : 2}
            displayValue={
              valorActual === "C" ? "Consolidado (C)" : "Individual (I)"
            }
            onChange={(valor) => {
              setDetalle((anterior) => ({
                ...anterior,
                tipoBalanceTurquia: valor === 1 ? "C" : "I",
              }));
            }}
            required
            mostrarTextoOpcionalEnLabel={false}
            placeholder="Seleccione el alcance"
            disabled={soloLectura}
          />
          <p className="text-xs text-slate-500">
            Consolidado aplica al grupo económico. Individual aplica a una sola
            empresa.
          </p>
        </div>
      </div>
    );
  };

  const renderizarBalanceGeneralTotalizado = () => (
    <div className="space-y-6">
      {renderizarControlesHabilitacion()}

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-5">
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-brand-black">
            • Activos
          </p>
          <CampoDetalle
            etiqueta="Total Activo Corriente"
            valor={detalle.balanceGeneral.totalCorrientes}
            onChange={(valor) =>
              actualizarBalanceGeneral("totalCorrientes", valor)
            }
            deshabilitado={soloLectura || !registrosHabilitados}
          />
          <CampoDetalle
            etiqueta="Total Activo No Corriente"
            valor={detalle.balanceGeneral.totalNoCorrientes}
            onChange={(valor) =>
              actualizarBalanceGeneral("totalNoCorrientes", valor)
            }
            deshabilitado={soloLectura || !registrosHabilitados}
          />
          <CampoDetalle
            etiqueta="Total Activo"
            valor={detalle.balanceGeneral.totalActivos}
            onChange={(valor) =>
              actualizarBalanceGeneral("totalActivos", valor)
            }
            negrita
            destacado
            claseContenedor="my-2"
            deshabilitado
            onCalcular={
              soloLectura ? undefined : () => mutacionCalcular.mutate("total-activo")
            }
            calculando={
              mutacionCalcular.isPending &&
              mutacionCalcular.variables === "total-activo"
            }
          />
        </div>

        <div className="space-y-5">
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-brand-black">
            • Pasivos y Patrimonio
          </p>
          <CampoDetalle
            etiqueta="Total Pasivo Corriente"
            valor={detalle.balanceGeneral.totalPasivosCorrientes}
            onChange={(valor) =>
              actualizarBalanceGeneral("totalPasivosCorrientes", valor)
            }
            deshabilitado={soloLectura || !registrosHabilitados}
          />
          <CampoDetalle
            etiqueta="Total Pasivo No Corriente"
            valor={detalle.balanceGeneral.totalPasivosNoCorrientes}
            onChange={(valor) =>
              actualizarBalanceGeneral("totalPasivosNoCorrientes", valor)
            }
            deshabilitado={soloLectura || !registrosHabilitados}
          />
          <CampoDetalle
            etiqueta="Total Pasivos"
            valor={detalle.balanceGeneral.totalPasivos}
            onChange={(valor) =>
              actualizarBalanceGeneral("totalPasivos", valor)
            }
            negrita
            destacado
            claseContenedor="my-2"
            deshabilitado
            onCalcular={
              soloLectura ? undefined : () => mutacionCalcular.mutate("total-pasivos")
            }
            calculando={
              mutacionCalcular.isPending &&
              mutacionCalcular.variables === "total-pasivos"
            }
          />
          <CampoDetalle
            etiqueta="Total Patrimonio"
            valor={detalle.balanceGeneral.patrimonio}
            onChange={(valor) => actualizarBalanceGeneral("patrimonio", valor)}
            permitirNegativo
            negrita
            destacado
            claseContenedor="my-2"
            deshabilitado={soloLectura || (!registrosHabilitados && !totalesHabilitados)}
          />
          <CampoDetalle
            etiqueta="Total Pasivos + Patrimonio"
            valor={detalle.balanceGeneral.totalPasivoPatrimonio}
            onChange={(valor) =>
              actualizarBalanceGeneral("totalPasivoPatrimonio", valor)
            }
            negrita
            destacado
            claseContenedor="my-2"
            deshabilitado
            onCalcular={
              soloLectura
                ? undefined
                : () => mutacionCalcular.mutate("total-pasivo-patrimonio")
            }
            calculando={
              mutacionCalcular.isPending &&
              mutacionCalcular.variables === "total-pasivo-patrimonio"
            }
          />
        </div>
      </div>
    </div>
  );

  const renderizarCamposConfigurados = ({
    secciones,
    bloquearTodos = false,
    usarHabilitacionTotales = false,
    accionEncabezado,
  }: {
    secciones: typeof seccionesEstadoFinanciero;
    bloquearTodos?: boolean;
    usarHabilitacionTotales?: boolean;
    accionEncabezado?: ReactNode;
  }) => (
    <div className="space-y-5">
      {secciones.map((seccion, indiceSeccion) => (
        <div
          key={seccion.id}
          className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex flex-col gap-3 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="border-l-4 border-brand-wine pl-3">
              <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-brand-black">
                {seccion.titulo}
              </h3>
            </div>
            {indiceSeccion === 0 ? accionEncabezado : null}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {seccion.campos.map((campo, indiceCampo) => {
              const esTotal = esCampoTotalConfigurado(campo.etiqueta);
              const esCalculado = camposCalculadosEstadoFinanciero.has(
                campo.id,
              );
              const esDestacado = esTotal || esCalculado;
              const esSeccionRatios = /ratio/i.test(
                `${seccion.id} ${seccion.titulo}`,
              );
              const esRatioPorcentaje = camposRatioPorcentaje.has(campo.id);
              const valorCampo =
                detalle.registrosEstadoFinanciero?.[campo.id] ?? "";
              const deshabilitadoBase = bloquearTodos
                ? true
                : usarHabilitacionTotales
                  ? esTotal
                    ? !totalesHabilitados
                    : !registrosHabilitados
                  : false;
              const deshabilitado = soloLectura || deshabilitadoBase || esCalculado;
              const tipoEntradaCampo =
                obtenerTipoEntradaCampoEstadoFinanciero(campo);
              const grupoVisual = esEstadoFinancieroTurquia
                ? obtenerGrupoVisualTurquia(campo.id)
                : "";
              const grupoVisualAnterior =
                esEstadoFinancieroTurquia && indiceCampo > 0
                  ? obtenerGrupoVisualTurquia(seccion.campos[indiceCampo - 1].id)
                  : "";
              const encabezadoGrupo =
                grupoVisual && grupoVisual !== grupoVisualAnterior ? (
                  <div className="md:col-span-2">
                    <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 first:mt-0">
                      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">
                        {grupoVisual}
                      </span>
                    </div>
                  </div>
                ) : null;
              const envolverCampo = (contenido: ReactNode) => (
                <div key={campo.id} className="contents">
                  {encabezadoGrupo}
                  {contenido}
                </div>
              );

              if (tipoEntradaCampo === "selector-ano") {
                return envolverCampo(
                  <CampoDetalleAno
                    etiqueta={campo.etiqueta}
                    valor={valorCampo}
                    onChange={(valor) =>
                      actualizarRegistroEstadoFinanciero(campo.id, valor)
                    }
                    deshabilitado={deshabilitado}
                  />,
                );
              }

              if (tipoEntradaCampo === "fecha") {
                return envolverCampo(
                  <CampoDetalleFecha
                    etiqueta={campo.etiqueta}
                    valor={valorCampo}
                    onChange={(valor) =>
                      actualizarRegistroEstadoFinanciero(campo.id, valor)
                    }
                    deshabilitado={deshabilitado}
                  />,
                );
              }

              if (tipoEntradaCampo === "entero") {
                return envolverCampo(
                  <CampoDetalleEntero
                    etiqueta={campo.etiqueta}
                    valor={valorCampo}
                    onChange={(valor) =>
                      actualizarRegistroEstadoFinanciero(campo.id, valor)
                    }
                    deshabilitado={deshabilitado}
                    placeholder={obtenerPlaceholderCampoEntero(campo.etiqueta)}
                  />,
                );
              }

              if (tipoEntradaCampo === "selector-moneda-nombre") {
                const idNumericoMoneda =
                  valorCampo && /^\d+$/.test(valorCampo.trim())
                    ? Number(valorCampo)
                    : null;
                const opcionMonedaActual =
                  idNumericoMoneda != null
                    ? opcionesMoneda?.find((o) => o.num1 === idNumericoMoneda)
                    : opcionesMoneda?.find((o) => o.string1 === valorCampo);

                return envolverCampo(
                  <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3 transition-colors hover:border-slate-300">
                    <CustomLabel
                      as="p"
                      className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600"
                    >
                      {campo.etiqueta}
                    </CustomLabel>
                    <CustomSelectorBuscable
                      options={opcionesMoneda}
                      value={opcionMonedaActual?.num1 ?? undefined}
                      displayValue={opcionMonedaActual?.string1 ?? ""}
                      onChange={(valor) => {
                        const idStr = String(valor ?? "");
                        if (campo.id === "currency") {
                          actualizarRegistrosEstadoFinanciero({
                            currency: idStr,
                            "currency-iso": idStr,
                            "currency-p": idStr,
                          });
                        } else if (campo.id === "currency-p") {
                          actualizarRegistrosEstadoFinanciero({
                            "currency-p": idStr,
                            currency: idStr,
                            "currency-iso": idStr,
                          });
                        } else {
                          actualizarRegistroEstadoFinanciero(campo.id, idStr);
                        }
                      }}
                      onClear={() => {
                        if (campo.id === "currency") {
                          actualizarRegistrosEstadoFinanciero({
                            currency: "",
                            "currency-iso": "",
                            "currency-p": "",
                          });
                        } else if (campo.id === "currency-p") {
                          actualizarRegistrosEstadoFinanciero({
                            "currency-p": "",
                            currency: "",
                            "currency-iso": "",
                          });
                        } else {
                          actualizarRegistroEstadoFinanciero(campo.id, "");
                        }
                      }}
                      optional
                      mostrarTextoOpcionalEnLabel={false}
                      placeholder="Seleccione moneda"
                      disabled={deshabilitado}
                    />
                  </div>,
                );
              }

              if (tipoEntradaCampo === "selector-moneda-codigo") {
                const idNumericoIso =
                  valorCampo && /^\d+$/.test(valorCampo.trim())
                    ? Number(valorCampo)
                    : null;
                const opcionIsoActual =
                  idNumericoIso != null
                    ? opcionesMoneda?.find((o) => o.num1 === idNumericoIso)
                    : opcionesMoneda?.find((o) => o.string2 === valorCampo);

                return envolverCampo(
                  <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3 transition-colors hover:border-slate-300">
                    <CustomLabel
                      as="p"
                      className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600"
                    >
                      {campo.etiqueta}
                    </CustomLabel>
                    <CustomSelectorBuscable
                      options={opcionesMoneda}
                      value={opcionIsoActual?.num1 ?? undefined}
                      displayValue={opcionIsoActual?.string2 ?? ""}
                      obtenerEtiquetaOpcion={(opcion) =>
                        opcion.string2 ?? opcion.string1 ?? ""
                      }
                      onChange={(valor) => {
                        const idStr = String(valor ?? "");
                        if (campo.id === "currency-iso") {
                          actualizarRegistrosEstadoFinanciero({
                            "currency-iso": idStr,
                            currency: idStr,
                            "currency-p": idStr,
                          });
                        } else {
                          actualizarRegistroEstadoFinanciero(campo.id, idStr);
                        }
                      }}
                      onClear={() => {
                        if (campo.id === "currency-iso") {
                          actualizarRegistrosEstadoFinanciero({
                            "currency-iso": "",
                            currency: "",
                            "currency-p": "",
                          });
                        } else {
                          actualizarRegistroEstadoFinanciero(campo.id, "");
                        }
                      }}
                      optional
                      mostrarTextoOpcionalEnLabel={false}
                      placeholder="Seleccione ISO"
                      disabled={deshabilitado}
                    />
                  </div>,
                );
              }

              if (tipoEntradaCampo === "selector-confiabilidad") {
                return envolverCampo(
                  <div className="rounded-lg border border-slate-200 bg-white p-3 transition-colors hover:border-slate-300">
                    <SelectorMaestroConAltaInvestigacionAnalista
                      etiqueta={campo.etiqueta}
                      valor={valorCampo}
                      soloLectura={deshabilitado}
                      idMaestro={TablaMaestraId.NIVEL_CONFIABILIDAD}
                      opcionesTablaMaestra={opcionesNivelConfiabilidad}
                      permiteAltaNueva
                      marcador="Seleccione nivel"
                      obtenerValorOpcion={(opcion) => String(opcion.num1 ?? "")}
                      onChange={(valor) =>
                        actualizarRegistroEstadoFinanciero(campo.id, valor)
                      }
                    />
                  </div>,
                );
              }

              return envolverCampo(
                <CampoDetalle
                  etiqueta={campo.etiqueta}
                  valor={valorCampo}
                  onChange={(valor) =>
                    actualizarRegistroEstadoFinanciero(campo.id, valor)
                  }
                  permitirNegativo
                  negrita={esDestacado}
                  destacado={esDestacado}
                  claseContenedor={
                    esDestacado && !esSeccionRatios ? "md:col-span-2 my-2" : ""
                  }
                  mostrarComoPorcentaje={esRatioPorcentaje}
                  deshabilitado={deshabilitado}
                  onCalcular={
                    esCalculado && !esSeccionRatios && !soloLectura
                      ? () => mutacionCalcular.mutate(campo.id)
                      : undefined
                  }
                  calculando={
                    mutacionCalcular.isPending &&
                    mutacionCalcular.variables === campo.id
                  }
                  azul={esEstadoFinancieroTurquia && campo.id === "profit"}
                />,
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  const renderizarBotonCalcularRatios = () => {
    if (soloLectura) return null;

    return (
      <CustomButton
      type="button"
      variant="wine"
      size="sm"
      className="h-8 shrink-0 px-3 text-xs"
      loading={mutacionCalcularRatios.isPending}
      loadingText="Calculando ratios..."
      onClick={() => mutacionCalcularRatios.mutate()}
    >
      <Calculator size={16} />
      Calcular ratios
    </CustomButton>
    );
  };

  const tabs = [
    {
      id: "balance-general",
      label: "Balance General",
      content: esEstadoFinancieroTotalizado ? (
        renderizarBalanceGeneralTotalizado()
      ) : (
        <div className="space-y-6">
          {renderizarControlesHabilitacion()}
          {renderizarSelectorTipoBalanceTurquia()}

          {seccionesBalanceConfiguradas.length > 0 ? (
            renderizarCamposConfigurados({
              secciones: seccionesBalanceConfiguradas,
              usarHabilitacionTotales: true,
            })
          ) : (
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-5">
                <p className="text-sm font-bold uppercase tracking-[0.12em] text-brand-black">
                  • Activos
                </p>
                <CampoDetalle
                  etiqueta="Total Corrientes"
                  valor={detalle.balanceGeneral.totalCorrientes}
                  onChange={(valor) =>
                    actualizarBalanceGeneral("totalCorrientes", valor)
                  }
                  deshabilitado={soloLectura || !registrosHabilitados}
                />
                <CampoDetalle
                  etiqueta="Total No Corrientes"
                  valor={detalle.balanceGeneral.totalNoCorrientes}
                  onChange={(valor) =>
                    actualizarBalanceGeneral("totalNoCorrientes", valor)
                  }
                  deshabilitado={soloLectura || !registrosHabilitados}
                />
                <CampoDetalle
                  etiqueta="Otros Activos"
                  valor={detalle.balanceGeneral.otrosActivos}
                  onChange={(valor) =>
                    actualizarBalanceGeneral("otrosActivos", valor)
                  }
                  deshabilitado={soloLectura || !registrosHabilitados}
                />
                <CampoDetalle
                  etiqueta="Total Activos"
                  valor={detalle.balanceGeneral.totalActivos}
                  onChange={(valor) =>
                    actualizarBalanceGeneral("totalActivos", valor)
                  }
                  negrita
                  destacado
                  claseContenedor="my-2"
                  deshabilitado={soloLectura || !totalesHabilitados}
                />
              </div>

              <div className="space-y-5">
                <p className="text-sm font-bold uppercase tracking-[0.12em] text-brand-black">
                  • Pasivos y Patrimonio
                </p>
                <CampoDetalle
                  etiqueta="Total Pasivos Corrientes"
                  valor={detalle.balanceGeneral.totalPasivosCorrientes}
                  onChange={(valor) =>
                    actualizarBalanceGeneral("totalPasivosCorrientes", valor)
                  }
                  deshabilitado={soloLectura || !registrosHabilitados}
                />
                <CampoDetalle
                  etiqueta="Total Pasivos No Corrientes"
                  valor={detalle.balanceGeneral.totalPasivosNoCorrientes}
                  onChange={(valor) =>
                    actualizarBalanceGeneral("totalPasivosNoCorrientes", valor)
                  }
                  deshabilitado={soloLectura || !registrosHabilitados}
                />
                <CampoDetalle
                  etiqueta="Otros Pasivos"
                  valor={detalle.balanceGeneral.otrosPasivos}
                  onChange={(valor) =>
                    actualizarBalanceGeneral("otrosPasivos", valor)
                  }
                  deshabilitado={soloLectura || !registrosHabilitados}
                />
                <CampoDetalle
                  etiqueta="Total Pasivos"
                  valor={detalle.balanceGeneral.totalPasivos}
                  onChange={(valor) =>
                    actualizarBalanceGeneral("totalPasivos", valor)
                  }
                  negrita
                  destacado
                  claseContenedor="my-2"
                  deshabilitado={soloLectura || !totalesHabilitados}
                />
                <CampoDetalle
                  etiqueta="Patrimonio"
                  valor={detalle.balanceGeneral.patrimonio}
                  onChange={(valor) =>
                    actualizarBalanceGeneral("patrimonio", valor)
                  }
                  permitirNegativo
                  deshabilitado={soloLectura || !registrosHabilitados}
                />
                <CampoDetalle
                  etiqueta="Total Pasivo y Patrimonio"
                  valor={detalle.balanceGeneral.totalPasivoPatrimonio}
                  onChange={(valor) =>
                    actualizarBalanceGeneral("totalPasivoPatrimonio", valor)
                  }
                  negrita
                  destacado
                  claseContenedor="my-2"
                  deshabilitado={soloLectura || !totalesHabilitados}
                />
              </div>
            </div>
          )}
        </div>
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
              <CampoDetalle
                etiqueta="Ventas Netas"
                valor={detalle.estadoGananciasPerdidas.ventasNetas}
                onChange={(valor) =>
                  actualizarEstadoGanancias("ventasNetas", valor)
                }
                deshabilitado={soloLectura}
              />
              <CampoDetalle
                etiqueta="Utilidad / Ganancia"
                valor={detalle.estadoGananciasPerdidas.utilidadGanancia}
                onChange={(valor) =>
                  actualizarEstadoGanancias("utilidadGanancia", valor)
                }
                permitirNegativo
                deshabilitado={soloLectura}
              />
            </div>
          )}
        </div>
      ),
    },
    {
      id: "ratios",
      label: "Ratios",
      disabled: !mostrarRatios,
      tooltip:
        "Los ratios se habilitan para estados financieros Desagregado, Totalizado o Turquía.",
      content: (
        <div className="space-y-5">
          {seccionesRatiosConfiguradas.length > 0 ? (
            renderizarCamposConfigurados({
              secciones: seccionesRatiosConfiguradas,
              bloquearTodos: true,
              accionEncabezado: renderizarBotonCalcularRatios(),
            })
          ) : (
            <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="border-l-4 border-brand-wine pl-3">
                  <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-brand-black">
                    Ratios
                  </h3>
                </div>
                {renderizarBotonCalcularRatios()}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
              <CampoDetalle
                etiqueta="Índice de Liquidez"
                valor={detalle.ratios.liquidez}
                onChange={(valor) => actualizarRatios("liquidez", valor)}
                permitirNegativo
                destacado
                deshabilitado
              />
              <CampoDetalle
                etiqueta="Capital de Trabajo"
                valor={detalle.ratios.capitalTrabajo}
                onChange={(valor) => actualizarRatios("capitalTrabajo", valor)}
                permitirNegativo
                destacado
                deshabilitado
              />
              <CampoDetalle
                etiqueta="Ratio de Endeudamiento"
                valor={detalle.ratios.endeudamiento}
                onChange={(valor) => actualizarRatios("endeudamiento", valor)}
                permitirNegativo
                destacado
                mostrarComoPorcentaje
                deshabilitado
              />
              <CampoDetalle
                etiqueta="Ratio de Rentabilidad"
                valor={detalle.ratios.rentabilidad}
                onChange={(valor) => actualizarRatios("rentabilidad", valor)}
                permitirNegativo
                destacado
                mostrarComoPorcentaje
                deshabilitado
              />
              </div>
            </div>
          )}
        </div>
      ),
    },
  ];

  const limpiarCerosDetalle = (
    detalleActual: DetalleCuentasBalanceAnalista,
  ): DetalleCuentasBalanceAnalista => ({
    ...detalleActual,
    balanceGeneral: {
      totalCorrientes: esValorCeroOBlanco(
        detalleActual.balanceGeneral.totalCorrientes,
      )
        ? ""
        : detalleActual.balanceGeneral.totalCorrientes,
      totalNoCorrientes: esValorCeroOBlanco(
        detalleActual.balanceGeneral.totalNoCorrientes,
      )
        ? ""
        : detalleActual.balanceGeneral.totalNoCorrientes,
      otrosActivos: esValorCeroOBlanco(
        detalleActual.balanceGeneral.otrosActivos,
      )
        ? ""
        : detalleActual.balanceGeneral.otrosActivos,
      totalActivos: esValorCeroOBlanco(
        detalleActual.balanceGeneral.totalActivos,
      )
        ? ""
        : detalleActual.balanceGeneral.totalActivos,
      totalPasivosCorrientes: esValorCeroOBlanco(
        detalleActual.balanceGeneral.totalPasivosCorrientes,
      )
        ? ""
        : detalleActual.balanceGeneral.totalPasivosCorrientes,
      totalPasivosNoCorrientes: esValorCeroOBlanco(
        detalleActual.balanceGeneral.totalPasivosNoCorrientes,
      )
        ? ""
        : detalleActual.balanceGeneral.totalPasivosNoCorrientes,
      otrosPasivos: esValorCeroOBlanco(
        detalleActual.balanceGeneral.otrosPasivos,
      )
        ? ""
        : detalleActual.balanceGeneral.otrosPasivos,
      totalPasivos: esValorCeroOBlanco(
        detalleActual.balanceGeneral.totalPasivos,
      )
        ? ""
        : detalleActual.balanceGeneral.totalPasivos,
      patrimonio: esValorCeroOBlanco(detalleActual.balanceGeneral.patrimonio)
        ? ""
        : detalleActual.balanceGeneral.patrimonio,
      totalPasivoPatrimonio: esValorCeroOBlanco(
        detalleActual.balanceGeneral.totalPasivoPatrimonio,
      )
        ? ""
        : detalleActual.balanceGeneral.totalPasivoPatrimonio,
    },
    estadoGananciasPerdidas: {
      ventasNetas: esValorCeroOBlanco(
        detalleActual.estadoGananciasPerdidas.ventasNetas,
      )
        ? ""
        : detalleActual.estadoGananciasPerdidas.ventasNetas,
      utilidadGanancia: esValorCeroOBlanco(
        detalleActual.estadoGananciasPerdidas.utilidadGanancia,
      )
        ? ""
        : detalleActual.estadoGananciasPerdidas.utilidadGanancia,
    },
    ratios: {
      liquidez: esValorCeroOBlanco(detalleActual.ratios.liquidez)
        ? ""
        : detalleActual.ratios.liquidez,
      capitalTrabajo: esValorCeroOBlanco(detalleActual.ratios.capitalTrabajo)
        ? ""
        : detalleActual.ratios.capitalTrabajo,
      endeudamiento: esValorCeroOBlanco(detalleActual.ratios.endeudamiento)
        ? ""
        : detalleActual.ratios.endeudamiento,
      rentabilidad: esValorCeroOBlanco(detalleActual.ratios.rentabilidad)
        ? ""
        : detalleActual.ratios.rentabilidad,
    },
    registrosEstadoFinanciero: Object.fromEntries(
      Object.entries(detalleActual.registrosEstadoFinanciero ?? {}).map(
        ([clave, valor]) => [clave, esValorCeroOBlanco(valor) ? "" : valor],
      ),
    ),
  });

  return (
    <CustomModalPestanas
      isOpen={estaAbierto}
      onClose={onCerrar}
      title="Detalle de Cuentas"
      subtitle={
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em]">
          <span className="text-[#8ea0c0]">Gestion de cuentas contables</span>
          {tipoEstadoFinanciero ? (
            <span className="rounded-full bg-brand-wine/10 px-2.5 py-1 text-brand-wine">
              {tipoEstadoFinanciero}
            </span>
          ) : null}
        </div>
      }
      tabs={tabs}
      activeTab={pestanaActiva}
      onTabChange={setPestanaActiva}
      tabVariant="underline"
      maxWidth="max-w-6xl"
      footer={
        soloLectura ? null : <div className="flex justify-end gap-3">
          <CustomButton
            size="sm"
            onClick={() => onGuardar(limpiarCerosDetalle(detalle))}
          >
            Guardar Cambios
          </CustomButton>
        </div>
      }
    />
  );
}
