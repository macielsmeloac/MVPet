import { useEffect } from 'react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { CheckCircle, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useNotificationStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: any; onRemove: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onRemove]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const bgColors = {
    success: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50',
    warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50',
  };

  return (
    <div className={`pointer-events-auto flex items-start gap-3 p-4 w-80 rounded-[var(--radius-lg)] border shadow-lg backdrop-blur-md animate-scale-in transition-all duration-300 ${bgColors[toast.type as keyof typeof bgColors]}`}>
      <div className="shrink-0 mt-0.5">{icons[toast.type as keyof typeof icons]}</div>
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-sm font-medium text-surface-900 dark:text-white">{toast.message}</p>
      </div>
      <button onClick={onRemove} className="shrink-0 p-1 -mr-1 -mt-1 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 rounded transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
