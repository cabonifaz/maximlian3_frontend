interface CustomLabelProps {
  children: React.ReactNode;
  required?: boolean;
  optional?: boolean;
  htmlFor?: string;
  as?: "label" | "p";
  className?: string;
}

export function CustomLabel({
  children,
  required = false,
  optional = false,
  htmlFor,
  as: Tag = "label",
  className = "text-sm font-bold text-gray-700",
}: CustomLabelProps) {
  return (
    <Tag {...(Tag === "label" ? { htmlFor } : {})} className={className}>
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
      {optional && <span className="text-gray-400 font-normal ml-0.5">(opcional)</span>}
    </Tag>
  );
}
