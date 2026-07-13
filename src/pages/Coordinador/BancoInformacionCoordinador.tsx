import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { CustomBancoNoticias } from "@maximilian/components/common/CustomBancoNoticias";
import { CustomButton } from "@maximilian/components/common/CustomButton";
import { useRetardo } from "@maximilian/hooks/useRetardo";

export default function BancoInformacionCoordinador() {
  const [busqueda, setBusqueda] = useState("");
  const [claveAgregar, setClaveAgregar] = useState(0);
  const busquedaConRetardo = useRetardo(busqueda);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">Banco de Informacion</h1>
        <CustomButton size="sm" onClick={() => setClaveAgregar((valor) => valor + 1)}>
          <Plus size={14} />
          Agregar Noticia
        </CustomButton>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
          <input
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            className="h-12 w-full rounded-xl border border-slate-100 bg-white pl-11 pr-4 text-sm text-slate-600 outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
            placeholder="Buscar noticias, reportes o articulos..."
          />
        </label>
      </div>

      <CustomBancoNoticias busqueda={busquedaConRetardo} mostrarBotonAgregar={false} senalApertura={claveAgregar} />
    </div>
  );
}
