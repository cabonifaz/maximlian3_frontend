import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomCamposConfiguracionMigracion } from "@maximilian/components/common/CustomCamposConfiguracionMigracion";
import { esquemaAltaMigracionInforme, type DatosAltaMigracionInforme } from "@maximilian/schemas/informe-migracion.schema";
import type { RolMigracionInforme } from "@maximilian/shared/types/informe-migracion.type";

interface PropsCustomAltaMigracionInforme {
  rol: RolMigracionInforme;
}

export function CustomAltaMigracionInforme({ rol }: PropsCustomAltaMigracionInforme) {
  const navegar = useNavigate();
  const { control, formState: { errors }, handleSubmit, setError } = useForm<DatosAltaMigracionInforme>({
    resolver: zodResolver(esquemaAltaMigracionInforme),
    mode: "onTouched",
  });

  const continuar = (datos: DatosAltaMigracionInforme) => {
    if (rol === "traductor" && !datos.idIdiomaDestino) {
      setError("idIdiomaDestino", { message: "El idioma de destino es requerido" });
      return;
    }
    if (datos.idIdiomaDestino === datos.idIdiomaOrigen) {
      setError("idIdiomaDestino", { message: "El idioma de destino debe ser diferente al idioma de origen" });
      return;
    }
    const parametros = new URLSearchParams({
      modo: "iniciar",
      idPlantilla: String(datos.idPlantilla),
      idIdiomaOrigen: String(datos.idIdiomaOrigen),
      idFormatoFecha: String(datos.idFormatoFecha),
    });
    if (rol === "traductor" && datos.idIdiomaDestino) parametros.set("idIdiomaDestino", String(datos.idIdiomaDestino));
    navegar(`/${rol}/migraciones/nueva/informe?${parametros.toString()}`);
  };

  return (
    <section className="mx-auto max-w-4xl rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-bold text-brand-black">Nueva migración de informe</h1>
      <p className="mt-2 text-sm text-gray-500">Configure el documento antes de comenzar. Estos datos determinan la plantilla y el idioma de trabajo.</p>
      <form className="mt-8 space-y-8" onSubmit={handleSubmit(continuar)}>
        <CustomCamposConfiguracionMigracion control={control} errores={errors} rol={rol} />
        <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <CustomButton type="button" variant="secondary" onClick={() => navegar(`/${rol}/migraciones`)}>
            <ArrowLeft size={16} /> Cancelar
          </CustomButton>
          <CustomButton type="submit">
            Continuar <ArrowRight size={16} />
          </CustomButton>
        </div>
      </form>
    </section>
  );
}
