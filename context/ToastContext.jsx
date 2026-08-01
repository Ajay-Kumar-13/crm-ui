import React, { createContext, useCallback, useContext, useState } from 'react';
import { Toast } from '../components/ui';

const ToastContext = createContext(undefined);

let idCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((type, message, submessage) => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, type, message, submessage }]);
  }, []);

  const toast = {
    success: (message, submessage) => push('success', message, submessage),
    error: (message, submessage) => push('error', message, submessage),
    info: (message, submessage) => push('info', message, submessage),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col-reverse gap-2 w-full max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast
              message={t.message}
              submessage={t.submessage}
              type={t.type}
              isVisible
              onClose={() => remove(t.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
