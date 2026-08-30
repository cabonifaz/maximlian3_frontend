import { useCallback, useEffect, useState } from "react";
import { informeService } from "@maximilian/services/informe.service";
import type { DocumentoInformeGenerado, InformeMetadatosDocumento } from "@maximilian/shared/types/informe.type";

export function useDocumentoVistaPreviaInforme(
  idInformeDocumento: number,
  idPedidoDocumento: number,
  puedeMostrarDocumento: boolean,
) {
  const [documentoGenerado, setDocumentoGenerado] = useState<DocumentoInformeGenerado | null>(null);
  const [metadatosDocumento, setMetadatosDocumento] = useState<InformeMetadatosDocumento | null>(null);
  const [estaCargandoDocumento, setEstaCargandoDocumento] = useState(false);
  const [estaRenderizandoDocumento, setEstaRenderizandoDocumento] = useState(false);
  const [errorDocumento, setErrorDocumento] = useState(false);
  const [tokenReintentoDocumento, setTokenReintentoDocumento] = useState(0);

  useEffect(() => {
    let estaCancelado = false;

    if (!puedeMostrarDocumento) {
      setDocumentoGenerado(null);
      setMetadatosDocumento(null);
      setEstaCargandoDocumento(false);
      setEstaRenderizandoDocumento(false);
      setErrorDocumento(false);
      return;
    }

    setDocumentoGenerado(null);
    setMetadatosDocumento(null);
    setEstaCargandoDocumento(true);
    setEstaRenderizandoDocumento(false);
    setErrorDocumento(false);

    void informeService
      .previsualizarDocumento(idInformeDocumento, idPedidoDocumento)
      .then((respuesta) => {
        if (estaCancelado) return;
        setEstaRenderizandoDocumento(true);
        setDocumentoGenerado(respuesta.documento);
        setMetadatosDocumento({
          cantidadEnvios: respuesta.cantidadEnvios,
          formatosCliente: respuesta.formatosCliente,
          requiereTraduccion: respuesta.requiereTraduccion,
        });
      })
      .catch(() => {
        if (estaCancelado) return;
        setEstaRenderizandoDocumento(false);
        setErrorDocumento(true);
      })
      .finally(() => {
        if (estaCancelado) return;
        setEstaCargandoDocumento(false);
      });

    return () => {
      estaCancelado = true;
    };
  }, [idInformeDocumento, idPedidoDocumento, puedeMostrarDocumento, tokenReintentoDocumento]);

  const reintentarCargaDocumento = useCallback(() => {
    setTokenReintentoDocumento((valor) => valor + 1);
  }, []);

  return {
    documentoGenerado,
    metadatosDocumento,
    estaCargandoDocumento,
    estaRenderizandoDocumento,
    setEstaRenderizandoDocumento,
    errorDocumento,
    reintentarCargaDocumento,
  };
}
