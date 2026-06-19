"use client";

interface CompletionToastProps {
  show: boolean;
  onClose: () => void;
}

export function CompletionToast({ show, onClose }: CompletionToastProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-8 z-40 flex justify-center px-4">
      <div className="animate-in fade-in slide-in-from-bottom-4 flex max-w-sm flex-col items-center gap-3 rounded-2xl border border-[#e8ddd0] bg-[#faf7f2] px-8 py-6 text-center shadow-xl shadow-[#5c4a3a]/15">
        <span className="text-3xl">✨</span>
        <h3 className="font-serif text-xl text-[#5c4a3a]">全部发现！</h3>
        <p className="text-sm text-[#7a6555]">
          你已经找到了这个空间里的每一份心意。
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-1 text-sm text-[#c4956a] underline-offset-2 hover:underline"
        >
          好的
        </button>
      </div>
    </div>
  );
}
