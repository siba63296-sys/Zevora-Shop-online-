import React from 'react';
import { useStore } from '../context/StoreContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast } = useStore();

  if (!toast) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full transition-all animate-in fade-in slide-in-from-top-2 duration-200">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
          toast.type === 'success'
            ? 'bg-slate-900 text-white border-slate-800'
            : toast.type === 'error'
            ? 'bg-rose-900 text-white border-rose-800'
            : 'bg-slate-900 text-white border-slate-800'
        }`}
      >
        {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
        {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
        {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0" />}
        <p className="flex-1">{toast.message}</p>
      </div>
    </div>
  );
};
