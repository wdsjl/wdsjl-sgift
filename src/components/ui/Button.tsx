import { type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-[#c4956a] text-white hover:bg-[#b38459] shadow-sm shadow-[#c4956a]/20",
  secondary:
    "bg-white/80 text-[#5c4a3a] border border-[#e8ddd0] hover:bg-white",
  ghost: "bg-transparent text-[#7a6555] hover:bg-[#f0e8dc]/60",
  danger:
    "bg-transparent text-[#b85c5c] border border-[#e8c4c4] hover:bg-[#fdf5f5]",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
