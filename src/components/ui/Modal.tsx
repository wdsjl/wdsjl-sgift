"use client";

import { useEffect, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="关闭"
        className="absolute inset-0 bg-[#3d2f24]/30 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 rounded-2xl border border-[#e8ddd0] bg-[#faf7f2] p-6 shadow-xl shadow-[#5c4a3a]/10">
        {title && (
          <h2 className="mb-4 font-serif text-xl text-[#5c4a3a]">{title}</h2>
        )}
        {children}
      </div>
    </div>
  );
}
