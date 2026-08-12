import { useState } from "react";
import { Pencil, Plus, Save, Trash2 } from "lucide-react";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { CustomLabel } from "@maximilian/components/common/CustomLabel";
import { LIMITE_CARACTERES_CAMPO_EXTRA_FACTURA } from "@maximilian/shared/constants/components/coordinador/facturacion.constants";
import type { CampoExtraLineaFactura } from "@maximilian/shared/types/facturacion.type";

interface CustomListaCamposExtraFacturaProps {
  camposExtra: CampoExtraLineaFactura[];
  soloLectura: boolean;
  onChange: (camposExtra: CampoExtraLineaFactura[]) => void;
}

export function CustomListaCamposExtraFactura({
  camposExtra,
  soloLectura,
  onChange,
}: CustomListaCamposExtraFacturaProps) {
  const [textoNuevo, setTextoNuevo] = useState("");
  const [indiceEdicion, setIndiceEdicion] = useState<number | null>(null);

  const agregarCampoExtra = () => {
    const texto = textoNuevo.trim().slice(0, LIMITE_CARACTERES_CAMPO_EXTRA_FACTURA);
    if (!texto) return;

    onChange([...camposExtra, { idCampoExtraDocumentoElectronico: 0, texto }]);
    setTextoNuevo("");
  };

  const actualizarCampoExtra = (indice: number, texto: string) => {
    const textoLimitado = texto.slice(0, LIMITE_CARACTERES_CAMPO_EXTRA_FACTURA);
    onChange(
      camposExtra.map((campoExtra, i) =>
        i === indice ? { ...campoExtra, texto: textoLimitado } : campoExtra,
      ),
    );
  };

  const eliminarCampoExtra = (indice: number) => {
    onChange(camposExtra.filter((_, i) => i !== indice));
    setIndiceEdicion((actual) => {
      if (actual == null) return null;
      if (actual === indice) return null;
      return actual > indice ? actual - 1 : actual;
    });
  };

  return (
    <div className="space-y-1.5 md:col-span-2">
      <CustomLabel htmlFor="factura-campos-extra-nuevo" optional>
        Campos extra
      </CustomLabel>

      {camposExtra.length > 0 ? (
        <ul className="space-y-2">
          {camposExtra.map((campoExtra, indice) => {
            const estaEditando = indiceEdicion === indice;

            return (
              <li
                key={indice}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2"
              >
                {estaEditando ? (
                  <input
                    value={campoExtra.texto}
                    maxLength={LIMITE_CARACTERES_CAMPO_EXTRA_FACTURA}
                    onChange={(evento) =>
                      actualizarCampoExtra(indice, evento.target.value)
                    }
                    autoFocus
                    className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2 py-1 text-sm outline-none focus:border-brand-wine"
                  />
                ) : (
                  <span className="min-w-0 flex-1 truncate text-sm text-slate-700">
                    {campoExtra.texto}
                  </span>
                )}
                {!soloLectura ? (
                  <div className="flex shrink-0 items-center gap-1">
                    <CustomButton
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      aria-label={
                        estaEditando ? "Guardar campo extra" : "Editar campo extra"
                      }
                      onClick={() =>
                        setIndiceEdicion(estaEditando ? null : indice)
                      }
                    >
                      {estaEditando ? <Save size={14} /> : <Pencil size={14} />}
                    </CustomButton>
                    <CustomButton
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500"
                      aria-label="Eliminar campo extra"
                      onClick={() => eliminarCampoExtra(indice)}
                    >
                      <Trash2 size={14} />
                    </CustomButton>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-xs text-slate-400">
          {soloLectura
            ? "Sin campos extra registrados."
            : "Agrega líneas de información adicional para la factura."}
        </p>
      )}
      {!soloLectura ? (
        <div className="flex gap-2">
          <input
            id="factura-campos-extra-nuevo"
            value={textoNuevo}
            maxLength={LIMITE_CARACTERES_CAMPO_EXTRA_FACTURA}
            onChange={(evento) => setTextoNuevo(evento.target.value)}
            onKeyDown={(evento) => {
              if (evento.key === "Enter") {
                evento.preventDefault();
                agregarCampoExtra();
              }
            }}
            placeholder="Ej. Información adicional para la factura"
            className="w-full rounded-xl border border-gray-200 bg-brand-white px-4 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-brand-wine focus:ring-4 focus:ring-brand-wine/10"
          />
          <CustomButton
            type="button"
            variant="secondary"
            size="compact"
            disabled={!textoNuevo.trim()}
            onClick={agregarCampoExtra}
          >
            <Plus size={14} />
            Agregar
          </CustomButton>
        </div>
      ) : null}
    </div>
  );
}
