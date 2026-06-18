import { type TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({
  label,
  className = "",
  id,
  ...props
}: TextareaProps) {
  const textareaId = id ?? label;

  return (
    <label className="flex flex-col gap-1.5 text-sm text-[#7a6555]">
      {label && <span className="font-medium">{label}</span>}
      <textarea
        id={textareaId}
        className={`min-h-24 resize-y rounded-xl border border-[#e8ddd0] bg-white/70 px-4 py-2.5 text-[#5c4a3a] outline-none transition focus:border-[#c4956a] focus:ring-2 focus:ring-[#c4956a]/20 ${className}`}
        {...props}
      />
    </label>
  );
}
