import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: number;
  type: 'success' | 'error';
  message: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  if (!toast) return null;

  const isSuccess = toast.type === 'success';

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 max-w-sm"
    >
      <div
        className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
          isSuccess
            ? 'bg-slate-900 text-white border-slate-800'
            : 'bg-rose-600 text-white border-rose-700'
        }`}
      >
        {isSuccess ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
        ) : (
          <AlertCircle className="w-4 h-4 text-white shrink-0" aria-hidden="true" />
        )}
        <span className="leading-snug">{toast.message}</span>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Tutup notifikasi"
          className="ml-1 p-0.5 rounded hover:bg-white/15 transition-colors cursor-pointer shrink-0"
        >
          <X className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
