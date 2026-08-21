import { useState } from "react";
import { facturacionService } from "@maximilian/services/facturacion.service";
import type { DatosFormularioGenerarPrefactura } from "@maximilian/schemas";
import type { FiltroExportarPrefactura } from "@maximilian/shared/types/facturacion.type";
import { formatearFechaIsoLocal } from "@maximilian/shared/utils/fecha.util";

function construirFiltroPrefactura(
  idCliente: number,
  datos: DatosFormularioGenerarPrefactura,
): FiltroExportarPrefactura {
  if (datos.modo === "rango") {
    return {
      idCliente,
      fchInicio: formatearFechaIsoLocal(datos.fechaInicio as Date),
      fchFin: formatearFechaIsoLocal(datos.fechaFin as Date),
    };
  }

  return {
    idCliente,
    meses: datos.meses.map((fecha) => ({
      anio: fecha.getFullYear(),
      mes: fecha.getMonth() + 1,
    })),
  };
}

export function useGenerarPrefactura() {
  const [generando, setGenerando] = useState(false);

  const generar = async (
    idCliente: number,
    datos: DatosFormularioGenerarPrefactura,
  ) => {
    setGenerando(true);
    try {
      const filtro = construirFiltroPrefactura(idCliente, datos);
      const { archivo, nombreArchivo } =
        await facturacionService.exportarPrefactura(filtro);
      const url = URL.createObjectURL(archivo);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = nombreArchivo;
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      return true;
    } catch {
      return false;
    } finally {
      setGenerando(false);
    }
  };

  return { generando, generar };
}
