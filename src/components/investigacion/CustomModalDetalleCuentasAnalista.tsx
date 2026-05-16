import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { CustomModalPestanas } from "@maximilian/components/common/CustomModalPestanas";
import { CustomSelectorBuscable } from "@maximilian/components/common/CustomSelectorBuscable";
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
  const numero = Number.parseFloat(valor.replace(",", "."));
  return Number.isFinite(numero) ? numero : 0;
}

function formatearNumero(valor: number) {
  return valor.toFixed(2);
}

function sanitizarNumero(valor: string, permitirNegativo = false) {
  let valorNormalizado = valor.replace(",", ".").replace(permitirNegativo ? /[^0-9.-]/g : /[^0-9.]/g, "");

  if (permitirNegativo) {
    const tieneNegativoInicial = valorNormalizado.startsWith("-");
    valorNormalizado = valorNormalizado.replace(/-/g, "");
    valorNormalizado = `${tieneNegativoInicial ? "-" : ""}${valorNormalizado}`;
  }

  const signo = valorNormalizado.startsWith("-") ? "-" : "";
  const valorSinSigno = signo ? valorNormalizado.slice(1) : valorNormalizado;
  const partes = valorSinSigno.split(".");
  const entero = partes[0] ?? "";
  const decimal = partes[1] ?? "";
  const compuesto = partes.length > 1 ? `${entero}.${decimal.slice(0, 2)}` : entero;

  if (!compuesto) return signo;

  return `${signo}${compuesto}`;
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
  deshabilitado = false,
  permitirNegativo = false,
}: {
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
  negrita?: boolean;
  deshabilitado?: boolean;
  permitirNegativo?: boolean;
}) {
  return (
    <div className="space-y-2">
      <CustomLabel as="p" className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
        {etiqueta}
      </CustomLabel>
      <input
        value={valor}
        disabled={deshabilitado}
        onChange={(event) => onChange(sanitizarNumero(event.target.value, permitirNegativo))}
        onBlur={(event) => {
          const texto = event.target.value.trim();
          if (!texto || texto === "-" || texto === "-.") {
            onChange("0.00");
            return;
          }
          onChange(formatearNumero(obtenerNumero(texto)));
        }}
        placeholder="0.00"
        className={`h-10 w-full rounded-md border border-gray-200 bg-slate-50 px-3 text-sm text-slate-600 outline-none transition-all focus:border-brand-black focus:ring-2 focus:ring-brand-black/5 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 ${negrita ? "font-bold text-brand-black" : ""}`}
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
    <div className="space-y-2">
      <CustomLabel as="p" className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
        {etiqueta}
      </CustomLabel>
      <input
        type="date"
        value={valor}
        disabled={deshabilitado}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-md border border-gray-200 bg-slate-50 px-3 text-sm text-slate-600 outline-none transition-all focus:border-brand-black focus:ring-2 focus:ring-brand-black/5 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
      />
    </div>
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
        placeholder={placeholder}
        className="h-10 w-full rounded-md border border-gray-200 bg-slate-50 px-3 text-sm text-slate-600 outline-none transition-all focus:border-brand-black focus:ring-2 focus:ring-brand-black/5 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
      />
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

  useEffect(() => {
    setDetalle(detalleBase);
  }, [detalleBase]);

  const mostrarRatios = ["Desagregado", "Totalizado", "Turquía"].includes(tipoEstadoFinanciero ?? "");
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

    if (totalActivos + 0.000001 < totalActivosMinimo) {
      advertencias.push(`Total Activos debe ser mayor o igual a la suma de los campos de activos (${formatearNumero(totalActivosMinimo)}).`);
    }

    if (totalPasivos + 0.000001 < totalPasivosMinimo) {
      advertencias.push(`Total Pasivos debe ser mayor o igual a la suma de los campos de pasivos (${formatearNumero(totalPasivosMinimo)}).`);
    }

    if (totalPasivoPatrimonio + 0.000001 < totalPasivoPatrimonioMinimo) {
      advertencias.push(`Total Pasivo y Patrimonio debe ser mayor o igual a Total Pasivos + Patrimonio (${formatearNumero(totalPasivoPatrimonioMinimo)}).`);
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
  const opcionesConfiabilidad = useMemo(
    () => [
      { idEmpresa: 0, idTablaMaestra: null, idMaestro: 0, descripcion: "", num1: 1, num2: null, num3: null, string1: "ACTUAL", string2: null, string3: null, date1: null, date2: null, date3: null },
      { idEmpresa: 0, idTablaMaestra: null, idMaestro: 0, descripcion: "", num1: 2, num2: null, num3: null, string1: "PRELIMINAR", string2: null, string3: null, date1: null, date2: null, date3: null },
      { idEmpresa: 0, idTablaMaestra: null, idMaestro: 0, descripcion: "", num1: 3, num2: null, num3: null, string1: "ESTIMADO", string2: null, string3: null, date1: null, date2: null, date3: null },
    ],
    [],
  );

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
    </div>
  );

  const renderizarCamposConfigurados = (secciones: typeof seccionesEstadoFinanciero) => (
    <div className="space-y-5">
      {secciones.map((seccion) => (
        <div key={seccion.id} className="space-y-4 rounded-2xl border border-gray-100 p-4">
          <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-brand-black">{seccion.titulo}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {seccion.campos.map((campo) => {
              const esTotal = esCampoTotalConfigurado(campo.etiqueta);
              const valorCampo = detalle.registrosEstadoFinanciero?.[campo.id] ?? "";
              const deshabilitado = esTotal ? !totalesHabilitados : !registrosHabilitados;
              const tipoEntradaCampo = obtenerTipoEntradaCampoEstadoFinanciero(campo);

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
                return (
                  <div key={campo.id} className="space-y-2">
                    <CustomLabel as="p" className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
                      {campo.etiqueta}
                    </CustomLabel>
                    <CustomSelectorBuscable
                      options={opcionesMoneda}
                      value={opcionesMoneda?.find((opcion) => opcion.string1 === valorCampo)?.num1 ?? undefined}
                      displayValue={valorCampo}
                      onChange={(valor) => actualizarRegistroEstadoFinanciero(campo.id, opcionesMoneda?.find((opcion) => opcion.num1 === valor)?.string1 ?? "")}
                      onClear={() => actualizarRegistroEstadoFinanciero(campo.id, "")}
                      optional
                      mostrarTextoOpcionalEnLabel={false}
                      placeholder="Seleccione moneda"
                      disabled={deshabilitado}
                    />
                  </div>
                );
              }

              if (tipoEntradaCampo === "selector-moneda-codigo") {
                return (
                  <div key={campo.id} className="space-y-2">
                    <CustomLabel as="p" className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
                      {campo.etiqueta}
                    </CustomLabel>
                    <CustomSelectorBuscable
                      options={opcionesMoneda}
                      value={opcionesMoneda?.find((opcion) => opcion.string2 === valorCampo)?.num1 ?? undefined}
                      displayValue={valorCampo}
                      onChange={(valor) => actualizarRegistroEstadoFinanciero(campo.id, opcionesMoneda?.find((opcion) => opcion.num1 === valor)?.string2 ?? "")}
                      onClear={() => actualizarRegistroEstadoFinanciero(campo.id, "")}
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
                  <div key={campo.id} className="space-y-2">
                    <CustomLabel as="p" className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
                      {campo.etiqueta}
                    </CustomLabel>
                    <CustomSelectorBuscable
                      options={opcionesConfiabilidad}
                      value={opcionesConfiabilidad.find((opcion) => opcion.string1 === valorCampo)?.num1 ?? undefined}
                      displayValue={valorCampo}
                      onChange={(valor) => actualizarRegistroEstadoFinanciero(campo.id, opcionesConfiabilidad.find((opcion) => opcion.num1 === valor)?.string1 ?? "")}
                      onClear={() => actualizarRegistroEstadoFinanciero(campo.id, "")}
                      optional
                      mostrarTextoOpcionalEnLabel={false}
                      placeholder="Seleccione nivel"
                      disabled={deshabilitado}
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
                  negrita={esTotal}
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
        <div className="space-y-6">
          {renderizarControlesHabilitacion()}

          {seccionesBalanceConfiguradas.length > 0 ? (
            renderizarCamposConfigurados(seccionesBalanceConfiguradas)
          ) : (
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-5">
                <p className="text-sm font-bold uppercase tracking-[0.12em] text-brand-black">• Activos</p>
                <CampoDetalle etiqueta="Total Corrientes" valor={detalle.balanceGeneral.totalCorrientes} onChange={(valor) => actualizarBalanceGeneral("totalCorrientes", valor)} deshabilitado={!registrosHabilitados} />
                <CampoDetalle etiqueta="Total No Corrientes" valor={detalle.balanceGeneral.totalNoCorrientes} onChange={(valor) => actualizarBalanceGeneral("totalNoCorrientes", valor)} deshabilitado={!registrosHabilitados} />
                <CampoDetalle etiqueta="Otros Activos" valor={detalle.balanceGeneral.otrosActivos} onChange={(valor) => actualizarBalanceGeneral("otrosActivos", valor)} deshabilitado={!registrosHabilitados} />
                <CampoDetalle etiqueta="Total Activos" valor={detalle.balanceGeneral.totalActivos} onChange={(valor) => actualizarBalanceGeneral("totalActivos", valor)} negrita deshabilitado={!totalesHabilitados} />
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
                <CampoDetalle etiqueta="Total Pasivos" valor={detalle.balanceGeneral.totalPasivos} onChange={(valor) => actualizarBalanceGeneral("totalPasivos", valor)} negrita deshabilitado={!totalesHabilitados} />
                {totalesHabilitados && advertenciasTotales.find((advertencia) => advertencia.startsWith("Total Pasivos")) ? (
                  <p className="text-sm text-amber-700">
                    {advertenciasTotales.find((advertencia) => advertencia.startsWith("Total Pasivos"))}
                  </p>
                ) : null}
                <CampoDetalle etiqueta="Patrimonio" valor={detalle.balanceGeneral.patrimonio} onChange={(valor) => actualizarBalanceGeneral("patrimonio", valor)} permitirNegativo deshabilitado={!registrosHabilitados} />
                <CampoDetalle etiqueta="Total Pasivo y Patrimonio" valor={detalle.balanceGeneral.totalPasivoPatrimonio} onChange={(valor) => actualizarBalanceGeneral("totalPasivoPatrimonio", valor)} negrita deshabilitado={!totalesHabilitados} />
                {totalesHabilitados && advertenciasTotales.find((advertencia) => advertencia.startsWith("Total Pasivo y Patrimonio")) ? (
                  <p className="text-sm text-amber-700">
                    {advertenciasTotales.find((advertencia) => advertencia.startsWith("Total Pasivo y Patrimonio"))}
                  </p>
                ) : null}
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
          {renderizarControlesHabilitacion()}
          {seccionesGananciasConfiguradas.length > 0 ? (
            renderizarCamposConfigurados(seccionesGananciasConfiguradas)
          ) : (
            <div className="grid gap-8 md:grid-cols-2">
              <CampoDetalle etiqueta="Ventas Netas" valor={detalle.estadoGananciasPerdidas.ventasNetas} onChange={(valor) => actualizarEstadoGanancias("ventasNetas", valor)} deshabilitado={!registrosHabilitados} />
              <CampoDetalle etiqueta="Utilidad / Ganancia" valor={detalle.estadoGananciasPerdidas.utilidadGanancia} onChange={(valor) => actualizarEstadoGanancias("utilidadGanancia", valor)} permitirNegativo deshabilitado={!registrosHabilitados} />
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
          {renderizarControlesHabilitacion()}
          {seccionesRatiosConfiguradas.length > 0 ? (
            renderizarCamposConfigurados(seccionesRatiosConfiguradas)
          ) : (
            <div className="grid gap-8 md:grid-cols-2">
              <CampoDetalle etiqueta="Índice de Liquidez" valor={detalle.ratios.liquidez} onChange={(valor) => actualizarRatios("liquidez", valor)} permitirNegativo deshabilitado={!registrosHabilitados} />
              <CampoDetalle etiqueta="Capital de Trabajo" valor={detalle.ratios.capitalTrabajo} onChange={(valor) => actualizarRatios("capitalTrabajo", valor)} permitirNegativo deshabilitado={!registrosHabilitados} />
              <CampoDetalle etiqueta="Ratio de Endeudamiento" valor={detalle.ratios.endeudamiento} onChange={(valor) => actualizarRatios("endeudamiento", valor)} permitirNegativo deshabilitado={!registrosHabilitados} />
              <CampoDetalle etiqueta="Ratio de Rentabilidad" valor={detalle.ratios.rentabilidad} onChange={(valor) => actualizarRatios("rentabilidad", valor)} permitirNegativo deshabilitado={!registrosHabilitados} />
            </div>
          )}
        </div>
      ),
    },
  ];

  const validarTotalesBalance = () => {
    const totalActivos = obtenerNumero(detalle.balanceGeneral.totalActivos);
    const totalPasivos = obtenerNumero(detalle.balanceGeneral.totalPasivos);
    const patrimonio = obtenerNumero(detalle.balanceGeneral.patrimonio);
    const totalPasivoPatrimonio = obtenerNumero(detalle.balanceGeneral.totalPasivoPatrimonio);
    const totalPasivoPatrimonioMinimo = totalPasivos + patrimonio;

    if (totalesHabilitados) {
      if (totalPasivoPatrimonio + 0.000001 < totalPasivoPatrimonioMinimo) {
        toast.error("Total Pasivo y Patrimonio no puede ser menor a Total Pasivos + Patrimonio.");
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
