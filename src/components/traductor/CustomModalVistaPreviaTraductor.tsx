import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Download, FileText, X } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import type { DatosInvestigacionAnalista, IdSeccionInvestigacionAnalista } from "@maximilian/shared/types/investigacion.type";
import { seccionesInvestigacionAnalista } from "@maximilian/shared/utils/datos-simulados-investigacion";

interface PropsCustomModalVistaPreviaTraductor {
  estaAbierto: boolean;
  datosInvestigacion: DatosInvestigacionAnalista;
  onCerrar: () => void;
  indicadorReporteTraducido?: string;
  footer?: ReactNode;
}

interface FilaVistaPreviaTraductor {
  etiqueta: string;
  valorOriginal: string;
  valorTraducido: string;
}

interface BloqueVistaPreviaTraductor {
  id: string;
  titulo: string;
  filas: FilaVistaPreviaTraductor[];
}

interface SeccionVistaPreviaTraductor {
  id: IdSeccionInvestigacionAnalista;
  titulo: string;
  bloques: BloqueVistaPreviaTraductor[];
  observaciones?: string;
}

type IdTabVistaPreviaTraductor = "vista-general" | IdSeccionInvestigacionAnalista;

function humanizarEtiquetaVistaPrevia(texto: string) {
  return texto
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (valor) => valor.toUpperCase());
}

function formatearValorVistaPrevia(valor: unknown): string {
  if (typeof valor === "string") {
    const texto = valor.trim();
    return texto ? texto : "-";
  }

  if (typeof valor === "number") {
    return Number.isFinite(valor) ? String(valor) : "-";
  }

  if (typeof valor === "boolean") {
    return valor ? "Si" : "No";
  }

  if (valor == null) {
    return "-";
  }

  return String(valor);
}

function crearFilaVistaPrevia(etiqueta: string, valor: unknown): FilaVistaPreviaTraductor {
  const valorTexto = formatearValorVistaPrevia(valor);

  return {
    etiqueta,
    valorOriginal: valorTexto,
    valorTraducido: valorTexto,
  };
}

function crearFilasDesdeRegistro(
  registro: Record<string, unknown>,
  etiquetasPersonalizadas: Record<string, string> = {},
  clavesOmitidas: string[] = [],
) {
  return Object.entries(registro)
    .filter(([clave]) => !clavesOmitidas.includes(clave))
    .map(([clave, valor]) => crearFilaVistaPrevia(etiquetasPersonalizadas[clave] ?? humanizarEtiquetaVistaPrevia(clave), valor));
}

function crearBloqueDesdeRegistro(
  id: string,
  titulo: string,
  registro: Record<string, unknown>,
  etiquetasPersonalizadas: Record<string, string> = {},
  clavesOmitidas: string[] = [],
): BloqueVistaPreviaTraductor {
  return {
    id,
    titulo,
    filas: crearFilasDesdeRegistro(registro, etiquetasPersonalizadas, clavesOmitidas),
  };
}

function crearBloquesDesdeLista(
  prefijo: string,
  tituloBase: string,
  registros: Record<string, unknown>[],
  etiquetasPersonalizadas: Record<string, string> = {},
  clavesOmitidas: string[] = [],
) {
  if (registros.length === 0) {
    return [
      {
        id: `${prefijo}-vacio`,
        titulo: tituloBase,
        filas: [crearFilaVistaPrevia("Detalle", "Sin registros.")],
      },
    ];
  }

  return registros.map((registro, indice) => ({
    id: `${prefijo}-${indice}`,
    titulo: `${tituloBase} ${indice + 1}`,
    filas: crearFilasDesdeRegistro(registro, etiquetasPersonalizadas, clavesOmitidas),
  }));
}

function obtenerSeccionesVistaPrevia(datosInvestigacion: DatosInvestigacionAnalista): SeccionVistaPreviaTraductor[] {
  const seccionesPorId = new Map<IdSeccionInvestigacionAnalista, SeccionVistaPreviaTraductor>();

  seccionesPorId.set("identificacion", {
    id: "identificacion",
    titulo: "Identificación",
    bloques: [
      crearBloqueDesdeRegistro(
        "identificacion-principal",
        "Datos de identificación",
        datosInvestigacion.identificacion as unknown as Record<string, unknown>,
        {
          tipoPersona: "Tipo de persona",
          nombreEmpresa: "Nombre de empresa",
          nombreComercial: "Nombre comercial",
          pais: "Pais",
          operacionesCambio: "Operaciones cambio",
          tipoIdentificacionFiscal: "Tipo de identificacion fiscal",
          numeroIdentificacionFiscal: "Numero de identificacion fiscal",
          direccionPrincipal: "Direccion principal",
          ciudadEstadoProvincia: "Ciudad / Estado / Provincia",
          numeroTelefono: "Telefono",
          numeroFax: "Fax",
          correoElectronico: "Correo electronico",
          paginaWeb: "Pagina web",
          estadoActual: "Estado actual",
        },
        ["datosAdicionales"],
      ),
    ],
    observaciones: datosInvestigacion.identificacion.datosAdicionales,
  });

  seccionesPorId.set("aspectos-legales", {
    id: "aspectos-legales",
    titulo: "Aspectos Legales",
    bloques: [
      crearBloqueDesdeRegistro(
        "aspectos-legales-principal",
        "Aspectos legales",
        datosInvestigacion.aspectosLegales as unknown as Record<string, unknown>,
        {
          tipoEmpresa: "Tipo de empresa",
          fechaConstitucion: "Fecha de constitucion",
          ciudadRegistro: "Ciudad de registro",
          notaria: "Notaria",
          notario: "Notario",
          registro: "Registro",
          condiciones: "Condiciones",
          operacionesCambioDivisas: "Operaciones cambio divisas",
          monedaTipoCambio: "Moneda tipo de cambio",
          capitalInicial: "Capital inicial",
          capitalDesembolsado: "Capital desembolsado",
          ultimaAmpliacion: "Ultima ampliacion",
          patrimonioNeto: "Patrimonio neto",
          tipoAcciones: "Tipo de acciones",
          valorAcciones: "Valor de acciones",
          obligacionBolsa: "Obligacion en bolsa",
          tipoCambio: "Tipo de cambio",
          antecedentes: "Antecedentes",
          aspectosLegales: "Comentarios legales",
          comentariosEmpresasRelacionadas: "Comentarios empresas relacionadas",
        },
      ),
      ...crearBloquesDesdeLista(
        "companias-relacionadas",
        "Compania relacionada",
        datosInvestigacion.companiasRelacionadas as unknown as Record<string, unknown>[],
        {
          empresa: "Empresa",
          idFiscal: "Id fiscal",
          pais: "Pais",
        },
      ),
    ],
  });

  seccionesPorId.set("ramo-operaciones", {
    id: "ramo-operaciones",
    titulo: "Ramo Operaciones",
    bloques: [
      crearBloqueDesdeRegistro(
        "operacion-principal",
        "Operacion principal",
        datosInvestigacion.operacionPrincipal as unknown as Record<string, unknown>,
        {
          sector: "Sector",
          actividad: "Actividad",
          categoriaCiiu: "Categoria CIIU",
          claseCiiu: "Clase CIIU",
          actividadPrincipal: "Actividad principal",
          ventasContadoPorcentaje: "Ventas contado %",
          ventasContadoDetalle: "Ventas contado detalle",
          ventasCreditoPorcentaje: "Ventas credito %",
          ventasCreditoDetalle: "Ventas credito detalle",
          ventasCreditoSeleccion: "Ventas credito seleccion",
          territorioVentasPorcentaje: "Territorio ventas %",
          territorioVentasDetalle: "Territorio ventas detalle",
          ventasExtranjeroPorcentaje: "Ventas extranjero %",
          ventasExtranjeroDetalle: "Ventas extranjero detalle",
          comprasNacionalesPorcentaje: "Compras nacionales %",
          comprasNacionalesDetalle: "Compras nacionales detalle",
          comprasExtranjeroPorcentaje: "Compras extranjero %",
          comprasExtranjeroDetalle: "Compras extranjero detalle",
          numeroEmpleados: "Numero de empleados",
          numeroEmpleadosDetalle: "Detalle empleados",
          comentariosOperaciones: "Comentarios operaciones",
        },
      ),
      ...crearBloquesDesdeLista(
        "importaciones",
        "Importacion",
        datosInvestigacion.importaciones as unknown as Record<string, unknown>[],
        {
          anio: "Ano",
          mes: "Mes",
          moneda: "Moneda",
          paises: "Paises",
          productos: "Productos",
          monto: "Monto",
          operaciones: "Operaciones",
        },
      ),
      ...crearBloquesDesdeLista(
        "exportaciones",
        "Exportacion",
        datosInvestigacion.exportaciones as unknown as Record<string, unknown>[],
        {
          anio: "Ano",
          mes: "Mes",
          moneda: "Moneda",
          paises: "Paises",
          productos: "Productos",
          monto: "Monto",
          operaciones: "Operaciones",
        },
      ),
      ...crearBloquesDesdeLista(
        "locales",
        "Local",
        datosInvestigacion.locales.map((local) => ({
          tipoLocal: local.tipoLocal,
          direccion: local.direccion,
          comentario: local.comentario,
          imagen: local.imagen,
          totalImagenes: local.imagenes?.length ?? 0,
        })) as unknown as Record<string, unknown>[],
        {
          tipoLocal: "Tipo de local",
          direccion: "Direccion",
          comentario: "Comentario",
          imagen: "Imagen principal",
          totalImagenes: "Total de imagenes",
        },
      ),
    ],
  });

  seccionesPorId.set("informacion-financiera", {
    id: "informacion-financiera",
    titulo: "Información Financiera",
    bloques: [
      crearBloqueDesdeRegistro(
        "informacion-financiera-principal",
        "Informacion financiera",
        datosInvestigacion.informacionFinanciera as unknown as Record<string, unknown>,
        {
          contenido: "Contenido",
          comentariosFinancieros: "Comentarios financieros",
          activosFijos: "Activos fijos",
          seguros: "Seguros",
        },
      ),
    ],
  });

  seccionesPorId.set("balances", {
    id: "balances",
    titulo: "Balances",
    bloques: datosInvestigacion.balances.length > 0
      ? datosInvestigacion.balances.flatMap((balance, indice) => {
          const bloques: BloqueVistaPreviaTraductor[] = [
            crearBloqueDesdeRegistro(
              `balance-${indice}`,
              `Balance ${indice + 1}`,
              {
                codigo: balance.codigo,
                periodo: balance.periodo,
                fecha: balance.fecha,
                fechaInicio: balance.fechaInicio,
                fechaFin: balance.fechaFin,
                esActual: balance.esActual,
                tipo: balance.tipo,
                tipoEstadoFinanciero: balance.tipoEstadoFinanciero,
                tipoCambio: balance.tipoCambio,
                operacionCambio: balance.operacionCambio,
                tipoBalance: balance.tipoBalance,
                balanceGeneral: balance.balanceGeneral,
                perdidaGanancia: balance.perdidaGanancia,
                cuentas: balance.cuentas,
              },
              {
                codigo: "Codigo",
                periodo: "Periodo",
                fecha: "Fecha",
                fechaInicio: "Fecha inicio",
                fechaFin: "Fecha fin",
                esActual: "Es actual",
                tipo: "Tipo",
                tipoEstadoFinanciero: "Tipo de estado financiero",
                tipoCambio: "Tipo de cambio",
                operacionCambio: "Operacion cambio",
                tipoBalance: "Tipo de balance",
                balanceGeneral: "Balance general",
                perdidaGanancia: "Perdida y ganancia",
                cuentas: "Cuentas",
              },
            ),
          ];

          if (balance.detalleCuentas) {
            bloques.push(
              crearBloqueDesdeRegistro(
                `balance-general-${indice}`,
                `Detalle balance general ${indice + 1}`,
                balance.detalleCuentas.balanceGeneral as unknown as Record<string, unknown>,
                {
                  totalCorrientes: "Total corrientes",
                  totalNoCorrientes: "Total no corrientes",
                  otrosActivos: "Otros activos",
                  totalActivos: "Total activos",
                  totalPasivosCorrientes: "Total pasivos corrientes",
                  totalPasivosNoCorrientes: "Total pasivos no corrientes",
                  otrosPasivos: "Otros pasivos",
                  totalPasivos: "Total pasivos",
                  patrimonio: "Patrimonio",
                  totalPasivoPatrimonio: "Total pasivo y patrimonio",
                },
              ),
            );

            bloques.push(
              crearBloqueDesdeRegistro(
                `balance-ganancias-${indice}`,
                `Estado de ganancias y perdidas ${indice + 1}`,
                balance.detalleCuentas.estadoGananciasPerdidas as unknown as Record<string, unknown>,
                {
                  ventasNetas: "Ventas netas",
                  utilidadGanancia: "Utilidad / ganancia",
                },
              ),
            );

            bloques.push(
              crearBloqueDesdeRegistro(
                `balance-ratios-${indice}`,
                `Ratios ${indice + 1}`,
                balance.detalleCuentas.ratios as unknown as Record<string, unknown>,
                {
                  liquidez: "Liquidez",
                  capitalTrabajo: "Capital de trabajo",
                  endeudamiento: "Endeudamiento",
                  rentabilidad: "Rentabilidad",
                },
              ),
            );

            if (balance.detalleCuentas.registrosEstadoFinanciero && Object.keys(balance.detalleCuentas.registrosEstadoFinanciero).length > 0) {
              bloques.push(
                crearBloqueDesdeRegistro(
                  `balance-registros-${indice}`,
                  `Registros configurados ${indice + 1}`,
                  balance.detalleCuentas.registrosEstadoFinanciero,
                ),
              );
            }
          }

          return bloques;
        })
      : [{
          id: "balance-vacio",
          titulo: "Balances",
          filas: [crearFilaVistaPrevia("Detalle", "Sin balances registrados.")],
        }],
  });

  seccionesPorId.set("bancos-proveedores", {
    id: "bancos-proveedores",
    titulo: "Bancos-Proveedores",
    bloques: [
      crearBloqueDesdeRegistro(
        "referencias-principales",
        "Referencias",
        datosInvestigacion.referencias as unknown as Record<string, unknown>,
        {
          comentariosProveedores: "Comentarios proveedores",
          referenciasBancos: "Referencias bancos",
          litigios: "Litigios",
          riesgoPrincipal: "Riesgo principal",
          superintendencia: "Superintendencia",
        },
      ),
      ...crearBloquesDesdeLista(
        "proveedores",
        "Proveedor",
        datosInvestigacion.proveedores as unknown as Record<string, unknown>[],
        {
          nombreEmpresa: "Nombre de empresa",
          contacto: "Contacto",
          tipoProveedor: "Tipo de proveedor",
          telefono: "Telefono",
          tipoPersona: "Tipo de persona",
          pais: "Pais",
          taxIdType: "Tipo tax ID",
          taxIdNumber: "Numero tax ID",
          tieneReferenciaComercial: "Tiene referencia comercial",
          comienzoNegociaciones: "Comienzo negociaciones",
          operacionCambioMoneda: "Operacion cambio moneda",
          tipoCambio: "Tipo de cambio",
          limiteCredito: "Limite de credito",
          promedioMensual: "Promedio mensual",
        },
      ),
      ...crearBloquesDesdeLista(
        "bancos",
        "Banco",
        datosInvestigacion.bancos as unknown as Record<string, unknown>[],
        {
          banco: "Banco",
          numeroCuenta: "Numero de cuenta",
          sector: "Sector",
          telefono: "Telefono",
          sectoristaJefeCuenta: "Sectorista / jefe de cuenta",
        },
      ),
    ],
  });

  seccionesPorId.set("datos-generales", {
    id: "datos-generales",
    titulo: "Datos Generales",
    bloques: [
      crearBloqueDesdeRegistro(
        "datos-generales-principal",
        "Datos generales",
        datosInvestigacion.datosGenerales as unknown as Record<string, unknown>,
        {
          informacionGeneral: "Informacion general",
          opinionCredito: "Opinion de credito",
        },
      ),
    ],
  });

  seccionesPorId.set("directorio-ejecutivo", {
    id: "directorio-ejecutivo",
    titulo: "Directorio Ejecutivo",
    bloques: crearBloquesDesdeLista(
      "directorio-ejecutivo",
      "Ejecutivo",
      datosInvestigacion.directorioEjecutivo as unknown as Record<string, unknown>[],
      {
        ejecutivo: "Ejecutivo",
        cargo: "Cargo",
        porcentaje: "Porcentaje",
        lista: "Lista",
        detalleEjecutivo: "Detalle ejecutivo",
        orden: "Orden",
        vinculadoDesde: "Vinculado desde",
        companiaAnterior: "Compania anterior",
        esParteDirectorio: "Es parte del directorio",
        pais: "Pais",
        tipoPersona: "Tipo de persona",
        descripcionBusqueda: "Descripcion de busqueda",
        nombreCompleto: "Nombre completo",
        id: "Id",
      },
    ),
  });

  return seccionesInvestigacionAnalista
    .map((seccion) => seccionesPorId.get(seccion.id))
    .filter((seccion): seccion is SeccionVistaPreviaTraductor => Boolean(seccion));
}

function TarjetaVistaPrevia({
  titulo,
  indicador,
  encabezado,
  secciones,
  mostrarTituloSeccion,
  mostrarValorTraducido,
}: {
  titulo: string;
  indicador: string;
  encabezado: {
    pais: string;
    fecha: string;
    tipoSolicitud: string;
    analista: string;
    traductor: string;
  };
  secciones: SeccionVistaPreviaTraductor[];
  mostrarTituloSeccion: boolean;
  mostrarValorTraducido: boolean;
}) {
  return (
    <article className="min-h-[540px] rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <FileText size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">{titulo}</p>
            <p className="text-xs font-semibold text-slate-500">Safety Report</p>
          </div>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600">
          {indicador}
        </span>
      </div>

      <div className="mb-6 border-b border-gray-100 pb-5 text-[11px] leading-5 text-slate-500">
        <p><span className="font-bold text-slate-700">Country:</span> {encabezado.pais}</p>
        <p><span className="font-bold text-slate-700">Date of Request:</span> {encabezado.fecha}</p>
        <p><span className="font-bold text-slate-700">Type of Report:</span> {encabezado.tipoSolicitud}</p>
        <p><span className="font-bold text-slate-700">Analyst:</span> {encabezado.analista}</p>
        <p><span className="font-bold text-slate-700">Translator:</span> {encabezado.traductor}</p>
      </div>

      <div className="space-y-6">
        {secciones.map((seccion) => (
          <section key={seccion.id} className="space-y-4">
            {mostrarTituloSeccion ? (
              <div>
                <h3 className="text-center text-xs font-bold uppercase tracking-[0.16em] text-slate-700">
                  {seccion.titulo}
                </h3>
              </div>
            ) : null}

            <div className="space-y-4">
              {seccion.bloques.map((bloque) => (
                <div key={bloque.id} className="rounded-2xl border border-gray-100 p-4">
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    {bloque.titulo}
                  </p>
                  <div className="space-y-3 text-[11px] leading-5 text-slate-600">
                    {bloque.filas.map((fila) => (
                      <div key={`${bloque.id}-${fila.etiqueta}`} className="grid gap-2 border-b border-gray-50 pb-3 md:grid-cols-[180px_minmax(0,1fr)]">
                        <p className="font-bold uppercase tracking-[0.14em] text-slate-400">{fila.etiqueta}</p>
                        <p>{mostrarValorTraducido ? fila.valorTraducido : fila.valorOriginal}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {seccion.observaciones ? (
              <div className="rounded-2xl bg-slate-50 p-4 text-[11px] leading-5 text-slate-600">
                <p className="mb-2 font-bold uppercase tracking-[0.14em] text-slate-400">
                  Observaciones de {seccion.titulo}
                </p>
                <p>{seccion.observaciones}</p>
              </div>
            ) : null}
          </section>
        ))}
      </div>
    </article>
  );
}

export function CustomModalVistaPreviaTraductor({
  estaAbierto,
  datosInvestigacion,
  onCerrar,
  indicadorReporteTraducido = "En traducción",
  footer,
}: PropsCustomModalVistaPreviaTraductor) {
  const [idTabActiva, setIdTabActiva] = useState<IdTabVistaPreviaTraductor>("vista-general");

  useEffect(() => {
    if (!estaAbierto) return;

    setIdTabActiva("vista-general");
  }, [estaAbierto]);

  const seccionesVistaPrevia = useMemo(
    () => obtenerSeccionesVistaPrevia(datosInvestigacion),
    [datosInvestigacion],
  );

  const seccionesVisibles = useMemo(
    () => (idTabActiva === "vista-general"
      ? seccionesVistaPrevia
      : seccionesVistaPrevia.filter((seccion) => seccion.id === idTabActiva)),
    [idTabActiva, seccionesVistaPrevia],
  );

  if (!estaAbierto) return null;

  const encabezado = {
    pais: datosInvestigacion.resumen.pais || "-",
    fecha: "31/12/2025",
    tipoSolicitud: datosInvestigacion.resumen.prioridad || "-",
    analista: "AN001",
    traductor: "TR0010",
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <div className="flex max-h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-[#151d33] px-7 py-5 text-white">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">Vista previa del informe</p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto bg-slate-50 px-6 py-6">
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white px-5 pt-4 shadow-sm">
              <div className="flex flex-wrap gap-0 border-b border-gray-200">
                <button
                  type="button"
                  onClick={() => setIdTabActiva("vista-general")}
                  className={`-mb-px border-b-2 px-6 py-3 text-sm font-bold transition-all ${
                    idTabActiva === "vista-general"
                      ? "border-brand-black text-brand-black"
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
                >
                  Vista general
                </button>
                {seccionesInvestigacionAnalista.map((seccion) => (
                  <button
                    key={seccion.id}
                    type="button"
                    onClick={() => setIdTabActiva(seccion.id)}
                    className={`-mb-px border-b-2 px-6 py-3 text-sm font-bold transition-all ${
                      idTabActiva === seccion.id
                        ? "border-brand-black text-brand-black"
                        : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {seccion.titulo}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <TarjetaVistaPrevia
                titulo="Reporte original (español)"
                indicador="Original"
                encabezado={encabezado}
                secciones={seccionesVisibles}
                mostrarTituloSeccion={idTabActiva === "vista-general"}
                mostrarValorTraducido={false}
              />
              <TarjetaVistaPrevia
                titulo="Reporte traducido (inglés)"
                indicador={indicadorReporteTraducido}
                encabezado={encabezado}
                secciones={seccionesVisibles}
                mostrarTituloSeccion={idTabActiva === "vista-general"}
                mostrarValorTraducido
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-100 bg-white px-7 py-5">
          {footer ?? (
            <>
              <CustomButton variant="secondary" size="sm" onClick={onCerrar}>
                Cerrar
              </CustomButton>
              <CustomButton size="sm" onClick={() => window.print()}>
                <Download size={14} />
                Descargar PDF
              </CustomButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
