import React, { createContext, useContext, useState } from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = ({ title, description, type = 'default', duration = 5000 }) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}

        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}

        <ToastPrimitive.Viewport className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-md gap-4 outline-none" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onRemove }) => {
  const isError = toast.type === 'error';
  const isSuccess = toast.type === 'success';

  // Force removal after duration as a fallback for Radix's internal timer
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration + 500); // 500ms buffer for exit animations
    
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  return (
    <ToastPrimitive.Root
      duration={toast.duration}
      className={`
        group relative flex flex-col gap-1 w-full max-w-sm rounded-[1.25rem] p-5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] 
        border transition-all duration-300
        data-[state=open]:animate-in data-[state=closed]:animate-out 
        data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full 
        data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full
        ${isError ? 'bg-red-50 border-red-200' : isSuccess ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}
      `}
      onOpenChange={(open) => {
        if (!open) onRemove(toast.id);
      }}
    >
      <div className="flex gap-4">
        <div className="shrink-0 mt-0.5">
          {isError && <AlertCircle className="w-6 h-6 text-red-500" />}
          {isSuccess && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
          {!isError && !isSuccess && <Info className="w-6 h-6 text-indigo-500" />}
        </div>
        
        <div className="flex-1">
          <ToastPrimitive.Title className={`text-sm font-bold ${isError ? 'text-red-900' : isSuccess ? 'text-emerald-900' : 'text-slate-900'}`}>
            {toast.title}
          </ToastPrimitive.Title>
          {toast.description && (
            <ToastPrimitive.Description className={`mt-1 text-sm font-medium ${isError ? 'text-red-600' : isSuccess ? 'text-emerald-700' : 'text-slate-500'}`}>
              {toast.description}
            </ToastPrimitive.Description>
          )}
        </div>

        <ToastPrimitive.Close className={`shrink-0 rounded-lg p-1 transition-colors hover:bg-black/5 align-top h-fit ${isError ? 'text-red-400' : isSuccess ? 'text-emerald-400' : 'text-slate-400'}`}>
          <X className="w-4 h-4" />
        </ToastPrimitive.Close>
      </div>
    </ToastPrimitive.Root>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
