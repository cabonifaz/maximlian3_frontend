import { useState } from "react";
import { X } from "lucide-react";
import { CustomButton } from "./CustomButton";

interface TabDefinition {
  id: string;
  label: string;
  content: React.ReactNode;
  indicator?: React.ReactNode;
}

interface CustomTabbedModalProps {
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

export function CustomTabbedModal({
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
}: CustomTabbedModalProps) {
  const [internalTab, setInternalTab] = useState(tabs[0]?.id ?? "");

  if (!isOpen) return null;

  const isControlled = controlledTab !== undefined;
  const currentTab = isControlled ? controlledTab : internalTab;

  const handleTabChange = (id: string) => {
    if (isControlled) {
      onTabChange?.(id);
    } else {
      setInternalTab(id);
    }
  };

  return (
    <div className={`fixed inset-0 ${zIndex} flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300`}>
      <div className={`bg-brand-white w-full ${maxWidth} rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]`}>

        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-brand-black">{title}</h2>
            {subtitle && <div className="mt-1">{subtitle}</div>}
          </div>
          <CustomButton variant="ghost" size="icon" onClick={onClose}>
            <X size={20} className="text-gray-400" />
          </CustomButton>
        </div>

        {/* Tab strip */}
        <div className="px-8 pt-6 shrink-0">
          {tabVariant === "segmented" ? (
            <div className="bg-gray-50 p-1 rounded-2xl flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-100/50 hover:scale-[1.01] active:scale-[0.99] ${
                    currentTab === tab.id
                      ? "bg-brand-white text-brand-black shadow-sm border-b-2 border-brand-black"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.indicator}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex gap-0 border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-6 py-3 text-sm font-bold transition-all cursor-pointer border-b-2 -mb-px flex items-center gap-2 ${
                    currentTab === tab.id
                      ? "border-brand-black text-brand-black"
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.indicator}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Scrollable content */}
        <div className="p-8 flex-1 overflow-y-auto min-h-0">
          {tabs.find((t) => t.id === currentTab)?.content}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50 shrink-0">
          {footer}
        </div>

      </div>
    </div>
  );
}
