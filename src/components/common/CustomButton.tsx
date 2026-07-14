import { variantClasses, sizeClasses, interactionClasses, disabledClasses } from "@maximilian/shared/constants/components/common/customButton.constants";
import type { PropsCustomButton } from "@maximilian/shared/constants/components/common/customButton.constants";
import { Loader2 } from "lucide-react";

export function CustomButton({
  variant = "primary",
  size = "md",
  loading = false,
  loadingText,
  disabled,
  children,
  className,
  ...props
}: PropsCustomButton) {
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
