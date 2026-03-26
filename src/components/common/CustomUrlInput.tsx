import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

type Protocol = "https://" | "http://";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: boolean;
}

function parseUrl(val: string): { protocol: Protocol; domain: string } {
  if (val.startsWith("https://")) return { protocol: "https://", domain: val.slice(8) };
  if (val.startsWith("http://")) return { protocol: "http://", domain: val.slice(7) };
  return { protocol: "https://", domain: val };
}

export function CustomUrlInput({ value, onChange, onBlur, error }: Props) {
  const parsed = parseUrl(value);
  const [protocol, setProtocol] = useState<Protocol>(parsed.protocol);
  const [domain, setDomain] = useState(parsed.domain);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync when form resets externally (e.g. modal open/close)
  useEffect(() => {
    const p = parseUrl(value);
    setProtocol(p.protocol);
    setDomain(p.domain);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleProtocolChange(p: Protocol) {
    setProtocol(p);
    setOpen(false);
    onChange(domain ? p + domain : "");
  }

  function handleDomainChange(e: React.ChangeEvent<HTMLInputElement>) {
    const d = e.target.value;
    setDomain(d);
    onChange(d ? protocol + d : "");
  }

  const borderClass = error ? "border-red-500" : "border-gray-200";

  return (
    <div className={`flex border ${borderClass} rounded-xl overflow-visible bg-brand-white focus-within:ring-4 focus-within:ring-brand-wine/10 focus-within:border-brand-wine transition-all`}>
      {/* Protocol selector */}
      <div ref={dropdownRef} className="relative flex-shrink-0">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1 px-3 h-full text-sm font-medium text-gray-700 border-r border-gray-200 hover:bg-gray-50 rounded-l-xl transition-colors whitespace-nowrap"
        >
          {protocol}
          <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden min-w-[110px]">
            {(["https://", "http://"] as Protocol[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handleProtocolChange(p)}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                  protocol === p
                    ? "bg-brand-wine/10 text-brand-wine font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {p === "https://" ? "HTTPS" : "HTTP"}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Domain input */}
      <input
        type="text"
        value={domain}
        onChange={handleDomainChange}
        onBlur={onBlur}
        placeholder="www.sitioweb.com"
        className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none placeholder:text-gray-300 min-w-0"
      />
    </div>
  );
}
