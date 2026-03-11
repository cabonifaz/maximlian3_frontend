import { ChevronDown, Bell } from "lucide-react";

interface HeaderProps {
  role?: string;
}

export function Header({ role = "Administrador" }: HeaderProps) {
  return (
    <header className="h-16 bg-brand-white border-b border-gray-100 px-8 flex items-center justify-end gap-6 sticky top-0 z-10 shrink-0">
      <button className="text-gray-400 hover:text-brand-black transition-colors">
        <Bell size={20} />
      </button>
      
      <div className="flex items-center gap-4 border-l pl-6 border-gray-100">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-brand-black leading-tight">Juan Espinoza</p>
          <p className="text-xs text-gray-500">{role}</p>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-50 p-1.5 pr-3 rounded-full border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
          <div className="w-8 h-8 rounded-full bg-brand-wine flex items-center justify-center text-brand-white font-bold text-xs">
            JE
          </div>
          <span className="text-sm font-medium text-gray-700">{role}</span>
          <ChevronDown size={16} className="text-gray-400" />
        </div>
      </div>
    </header>
  );
}
