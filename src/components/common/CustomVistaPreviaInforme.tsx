import { type ReactNode, useMemo, useState } from "react";
import { FileText } from "lucide-react";
import type { DatosInvestigacionAnalista, IdSeccionInvestigacionAnalista } from "@maximilian/shared/types/investigacion.type";
import { seccionesInvestigacionAnalista } from "@maximilian/shared/utils/datos-simulados-investigacion";

interface FilaVistaPreviaInforme {
  etiqueta: string;
  etiquetaTraducida: string;
  valorOriginal: string;
  valorTraducido: string;
}

interface BloqueVistaPreviaInforme {
  id: string;
  titulo: string;
  filas: FilaVistaPreviaInforme[];
}

export interface SeccionVistaPreviaInforme {
  id: IdSeccionInvestigacionAnalista;
  titulo: string;
  bloques: BloqueVistaPreviaInforme[];
  observaciones?: string;
}

export interface EncabezadoVistaPreviaInforme {
  pais: string;
  fecha: string;
  tipoSolicitud: string;
  analista: string;
  traductor: string;
}

type IdTabVistaPreviaInforme = "vista-general" | IdSeccionInvestigacionAnalista;

interface PropsTabsVistaPreviaInforme {
  idTabActiva: IdTabVistaPreviaInforme;
  onTabChange: (idTab: IdTabVistaPreviaInforme) => void;
}

interface PropsTarjetaVistaPreviaInforme {
  titulo: string;
  indicador: string;
  encabezado: EncabezadoVistaPreviaInforme;
  secciones: SeccionVistaPreviaInforme[];
  mostrarTituloSeccion: boolean;
  mostrarValorTraducido: boolean;
}

interface PropsVistaPreviaInformeComparado {
  datosInvestigacion: DatosInvestigacionAnalista;
  encabezado: EncabezadoVistaPreviaInforme;
  indicadorReporteTraducido?: string;
  className?: string;
  contenidoEntreTabsYTarjetas?: ReactNode;
}

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

const traduccionesVistaPreviaInforme: Record<string, string> = {
  "Aprobado": "Approved",
  "Activo": "Active",
  "Ano": "Year",
  "Aspectos Legales": "Legal Aspects",
  "Balance general": "Balance sheet",
  "Bancos-Proveedores": "Banks-Suppliers",
  "Categoria CIIU": "ISIC category",
  "Ciudad / Estado / Provincia": "City / State / Province",
  "Codigo": "Code",
  "Comentario": "Comment",
  "Comentarios legales": "Legal comments",
  "Comentarios operaciones": "Operations comments",
  "Compania relacionada": "Related company",
  "Contacto": "Contact",
  "Correo electronico": "Email",
  "Datos Generales": "General Data",
  "Datos de identificación": "Identification data",
  "Detalle": "Detail",
  "Direccion": "Address",
  "Direccion principal": "Main address",
  "Ejecutivo": "Executive",
  "Empresa": "Company",
  "Estado actual": "Current status",
  "Estados Unidos": "United States",
  "Fecha": "Date",
  "Fecha de constitucion": "Date of incorporation",
  "Identificación": "Identification",
  "Imagen principal": "Main image",
  "Importacion": "Import",
  "Información Financiera": "Financial Information",
  "Informacion financiera": "Financial information",
  "Investigación Normal": "Standard Investigation",
  "Jurídica": "Legal entity",
  "Mes": "Month",
  "Moneda": "Currency",
  "Nacional": "Domestic",
  "Nombre comercial": "Trade name",
  "Nombre de empresa": "Company name",
  "Numero de cuenta": "Account number",
  "Numero de empleados": "Number of employees",
  "Numero de identificacion fiscal": "Tax identification number",
  "Operación principal": "Main operation",
  "Operacion principal": "Main operation",
  "Pais": "Country",
  "Paises": "Countries",
  "Periodo": "Period",
  "Proveedor": "Supplier",
  "Ramo Operaciones": "Line of Business",
  "Referencias": "References",
  "Sector": "Sector",
  "Sede Principal": "Headquarters",
  "Si": "Yes",
  "Sin balances registrados.": "No balances registered.",
  "Sin datos de productos": "No product data",
  "Sin registros.": "No records.",
  "Telefono": "Phone",
  "Tipo": "Type",
  "Tipo de empresa": "Company type",
  "Tipo de identificacion fiscal": "Tax identification type",
  "Tipo de local": "Premises type",
  "Tipo de persona": "Person type",
  "Tipo de proveedor": "Supplier type",
  "Total de imagenes": "Total images",
  "Ventas netas": "Net sales",
};

function traducirTextoVistaPrevia(texto: string): string {
  return traduccionesVistaPreviaInforme[texto] ?? texto;
}

function crearFilaVistaPrevia(etiqueta: string, valor: unknown): FilaVistaPreviaInforme {
  const valorTexto = formatearValorVistaPrevia(valor);

  return {
    etiqueta,
    etiquetaTraducida: traducirTextoVistaPrevia(etiqueta),
    valorOriginal: valorTexto,
    valorTraducido: traducirTextoVistaPrevia(valorTexto),
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
): BloqueVistaPreviaInforme {
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
    return [{
      id: `${prefijo}-vacio`,
      titulo: tituloBase,
      filas: [crearFilaVistaPrevia("Detalle", "Sin registros.")],
    }];
  }

  return registros.map((registro, indice) => ({
    id: `${prefijo}-${indice}`,
    titulo: `${tituloBase} ${indice + 1}`,
    filas: crearFilasDesdeRegistro(registro, etiquetasPersonalizadas, clavesOmitidas),
  }));
}

export function obtenerSeccionesVistaPreviaInforme(datosInvestigacion: DatosInvestigacionAnalista): SeccionVistaPreviaInforme[] {
  const seccionesPorId = new Map<IdSeccionInvestigacionAnalista, SeccionVistaPreviaInforme>();

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
          ventasCreditoTiempo: "Tiempo de credito",
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
          const bloques: BloqueVistaPreviaInforme[] = [
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
    .filter((seccion): seccion is SeccionVistaPreviaInforme => Boolean(seccion));
}

function CustomTabsVistaPreviaInforme({ idTabActiva, onTabChange }: PropsTabsVistaPreviaInforme) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 pt-4 shadow-sm">
      <div className="flex flex-wrap gap-0 border-b border-gray-200">
        <button
          type="button"
          onClick={() => onTabChange("vista-general")}
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
            onClick={() => onTabChange(seccion.id)}
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
  );
}

function CustomTarjetaVistaPreviaInforme({
  titulo,
  indicador,
  encabezado,
  secciones,
  mostrarTituloSeccion,
  mostrarValorTraducido,
}: PropsTarjetaVistaPreviaInforme) {
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
                        <p className="font-bold uppercase tracking-[0.14em] text-slate-400">
                          {mostrarValorTraducido ? fila.etiquetaTraducida : fila.etiqueta}
                        </p>
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

export function CustomVistaPreviaInformeComparado({
  datosInvestigacion,
  encabezado,
  indicadorReporteTraducido = "En traducción",
  className = "space-y-6",
  contenidoEntreTabsYTarjetas,
}: PropsVistaPreviaInformeComparado) {
  const [idTabActiva, setIdTabActiva] = useState<IdTabVistaPreviaInforme>("vista-general");

  const seccionesVistaPrevia = useMemo(
    () => obtenerSeccionesVistaPreviaInforme(datosInvestigacion),
    [datosInvestigacion],
  );

  const seccionesVisibles = useMemo(
    () => (idTabActiva === "vista-general"
      ? seccionesVistaPrevia
      : seccionesVistaPrevia.filter((seccion) => seccion.id === idTabActiva)),
    [idTabActiva, seccionesVistaPrevia],
  );

  return (
    <div className={className}>
      <CustomTabsVistaPreviaInforme idTabActiva={idTabActiva} onTabChange={setIdTabActiva} />
      {contenidoEntreTabsYTarjetas}

      <div className="grid gap-6 xl:grid-cols-2">
        <CustomTarjetaVistaPreviaInforme
          titulo="Reporte original (español)"
          indicador="Original"
          encabezado={encabezado}
          secciones={seccionesVisibles}
          mostrarTituloSeccion={idTabActiva === "vista-general"}
          mostrarValorTraducido={false}
        />
        <CustomTarjetaVistaPreviaInforme
          titulo="Reporte traducido (inglés)"
          indicador={indicadorReporteTraducido}
          encabezado={encabezado}
          secciones={seccionesVisibles}
          mostrarTituloSeccion={idTabActiva === "vista-general"}
          mostrarValorTraducido
        />
      </div>
    </div>
  );
}
