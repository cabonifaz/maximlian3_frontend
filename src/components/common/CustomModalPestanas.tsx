import { useState } from "react";
import { X } from "lucide-react";
import { CustomButton } from "./CustomButton";
import { seleccionarTextoEditableEnContenedor } from "@maximilian/shared/utils/formato-monto.util";

interface TabDefinition {
  id: string;
  label: string;
  content: React.ReactNode;
  indicator?: React.ReactNode;
  tooltip?: string;
  disabled?: boolean;
}

interface CustomModalPestanasProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: React.ReactNode;
  tabs: TabDefinition[];
  footer: React.ReactNode;
  activeTab?: string;
  onTabChange?: (id: string) => void;
  tabVariant?: "segmented" | "underline";
  maxWidth?: string;
  zIndex?: string;
}

export function CustomModalPestanas({
  isOpen,
  onClose,
  title,
  subtitle,
  tabs,
  footer,
  activeTab: controlledTab,
  onTabChange,
  tabVariant = "segmented",
  maxWidth = "max-w-4xl",
  zIndex = "z-50",
}: CustomModalPestanasProps) {
  const [internalTab, setInternalTab] = useState(tabs[0]?.id ?? "");

  if (!isOpen) return null;

  const isControlled = controlledTab !== undefined;
  const currentTab = isControlled ? controlledTab : internalTab;

  const handleTabChange = (id: string) => {
    const pestana = tabs.find((tab) => tab.id === id);
    if (pestana?.disabled) return;

    if (isControlled) {
      onTabChange?.(id);
    } else {
      setInternalTab(id);
    }
  };

  return (
    <div className={`fixed inset-0 ${zIndex} flex min-h-dvh w-screen items-center justify-center overflow-y-auto p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300`} onFocusCapture={seleccionarTextoEditableEnContenedor}>
      <div className={`bg-brand-white w-full ${maxWidth} rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]`}>

        {/* Encabezado */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-4 sm:px-8 sm:py-6">
          <div>
            <h2 className="text-xl font-bold text-brand-black">{title}</h2>
            {subtitle && <div className="mt-1">{subtitle}</div>}
          </div>
          <CustomButton variant="ghost" size="icon" onClick={onClose}>
            <X size={20} className="text-gray-400" />
          </CustomButton>
        </div>

        {/* Tab strip */}
        <div className="shrink-0 overflow-x-auto px-4 pt-4 sm:px-8 sm:pt-6">
          {tabVariant === "segmented" ? (
            <div className="flex min-w-[32rem] gap-1 rounded-2xl bg-gray-50 p-1 sm:min-w-0">
              {tabs.map((tab) => (
                <div key={tab.id} className="group relative flex-1">
                  <button
                    type="button"
                    disabled={tab.disabled}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                      tab.disabled
                        ? "cursor-not-allowed text-gray-400"
                        : "cursor-pointer hover:bg-gray-100/50 hover:scale-[1.01] active:scale-[0.99]"
                    } ${
                      currentTab === tab.id
                        ? "bg-brand-white text-brand-black shadow-sm border-b-2 border-brand-black"
                        : tab.disabled
                          ? "text-gray-400"
                          : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.indicator}
                  </button>
                  {tab.tooltip ? (
                    <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-brand-black px-3 py-2 text-xs font-medium text-brand-white shadow-lg group-hover:block">
                      {tab.tooltip}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex gap-0 border-b border-gray-200">
              {tabs.map((tab) => (
                <div key={tab.id} className="group relative">
                  <button
                    type="button"
                    disabled={tab.disabled}
                    onClick={() => handleTabChange(tab.id)}
                    className={`-mb-px flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-bold transition-all ${
                      tab.disabled
                        ? "cursor-not-allowed border-transparent text-gray-400"
                        : "cursor-pointer"
                    } ${
                      currentTab === tab.id
                        ? "border-brand-black text-brand-black"
                        : tab.disabled
                          ? "border-transparent text-gray-400"
                          : "border-transparent text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.indicator}
                  </button>
                  {tab.tooltip ? (
                    <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-brand-black px-3 py-2 text-xs font-medium text-brand-white shadow-lg group-hover:block">
                      {tab.tooltip}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scrollable content */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-8">
          {tabs.find((t) => t.id === currentTab)?.content}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-gray-100 bg-gray-50/50 px-4 py-4 sm:px-8 sm:py-6">
          {footer}
        </div>

      </div>
    </div>
  );
}
