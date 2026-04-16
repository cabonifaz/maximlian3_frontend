import { Loader2 } from "lucide-react";

interface CustomButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "wine" | "ghost";
  size?: "sm" | "compact" | "md" | "icon";
  loading?: boolean;
  loadingText?: string;
}

const variantClasses: Record<NonNullable<CustomButtonProps["variant"]>, string> = {
  primary:
    "bg-brand-black text-brand-white rounded-xl font-semibold hover:bg-brand-black/90",
  secondary:
    "border border-gray-200 text-brand-black rounded-xl font-bold hover:bg-gray-100",
  danger: "bg-red-600 text-white rounded-xl font-bold hover:bg-red-700",
  // Actualizado con sombras y peso de fuente medio
  wine: "bg-brand-wine text-brand-white rounded-lg font-medium hover:bg-brand-wine/90 shadow-sm shadow-brand-wine/20",
  ghost: "rounded-full hover:bg-gray-100",
};

const sizeClasses: Record<NonNullable<CustomButtonProps["size"]>, string> = {
  sm: "px-4 py-2 text-sm", // Ajustado a text-sm según tu ejemplo
  compact: "px-6 py-2.5 text-sm",
  md: "px-8 py-3",
  icon: "p-2",
};

const interactionClasses: Record<NonNullable<CustomButtonProps["size"]>, string> = {
  sm: "hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer",
  compact: "hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer",
  md: "hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer",
  icon: "transition-colors cursor-pointer",
};

const disabledClasses =
  "opacity-40 cursor-not-allowed hover:scale-100 active:scale-100";

export function CustomButton({
  variant = "primary",
  size = "md",
  loading = false,
  loadingText,
  disabled,
  children,
  className,
  ...props
}: CustomButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={[
        "flex items-center gap-2 justify-center",
        variantClasses[variant],
        sizeClasses[size],
        isDisabled ? disabledClasses : interactionClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          {loadingText ?? children}
        </>
      ) : (
        children
      )}
    </button>
  );
}