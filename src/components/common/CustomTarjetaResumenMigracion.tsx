import { CheckCircle2, CircleX, Clock3, FileClock } from "lucide-react";

interface PropsCustomTarjetaResumenMigracion {
  id: string;
  titulo: string;
  valor: number;
}

function obtenerIconoTarjeta(id: string) {
  if (id === "aprobado") return <CheckCircle2 size={18} className="text-emerald-500" />;
  if (id === "rechazado") return <CircleX size={18} className="text-rose-500" />;
  if (id === "pendiente") return <Clock3 size={18} className="text-orange-500" />;
  return <FileClock size={18} className="text-blue-500" />;
}

export function CustomTarjetaResumenMigracion({ id, titulo, valor }: PropsCustomTarjetaResumenMigracion) {
  return (
    <article className="rounded-2xl border border-gray-100 bg-white px-6 py-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50">
          {obtenerIconoTarjeta(id)}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
          {titulo}
        </span>
      </div>
      <p className="text-3xl font-bold text-brand-black">{valor}</p>
    </article>
  );
}
