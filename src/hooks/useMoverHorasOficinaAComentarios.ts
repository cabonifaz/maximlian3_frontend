import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { DatosInvestigacionAnalista } from "@maximilian/shared/types/investigacion.type";
import { anexarHorasOficinaAComentario } from "@maximilian/shared/utils/investigacion/horas-oficina.util";

interface ParametrosMoverHorasOficina {
  datosInvestigacion: DatosInvestigacionAnalista;
  setDatosInvestigacion: Dispatch<SetStateAction<DatosInvestigacionAnalista>>;
  idPlantillaActual?: number;
  esPlantillaEcMexico: boolean;
  esSoloLectura: boolean;
}

export const useMoverHorasOficinaAComentarios = ({
  datosInvestigacion,
  setDatosInvestigacion,
  idPlantillaActual,
  esPlantillaEcMexico,
  esSoloLectura,
}: ParametrosMoverHorasOficina) => {
  const horasOficina = datosInvestigacion.operacionPrincipal.horasOficina;

  useEffect(() => {
    if (esSoloLectura || esPlantillaEcMexico || !idPlantillaActual) return;
    if (!horasOficina?.trim()) return;

    setDatosInvestigacion((anterior) => ({
      ...anterior,
      operacionPrincipal: {
        ...anterior.operacionPrincipal,
        comentariosOperaciones: anexarHorasOficinaAComentario(
          anterior.operacionPrincipal.comentariosOperaciones ?? "",
          anterior.operacionPrincipal.horasOficina ?? "",
        ),
        horasOficina: "",
      },
    }));
  }, [esSoloLectura, esPlantillaEcMexico, idPlantillaActual, horasOficina, setDatosInvestigacion]);
};
