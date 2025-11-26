// src/context/ToastContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimesCircle, FaTimes } from 'react-icons/fa';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((msg, type = 'info', ttl = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => {
      setToasts(t => t.filter(x => x.id !== id));
    }, ttl);
  }, []);

  const remove = useCallback((id) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  // Toast icons based on type
  const getToastIcon = (type) => {
    switch (type) {
      case 'success': return <FaCheckCircle className="text-green-400" />;
      case 'error': return <FaTimesCircle className="text-red-400" />;
      case 'warning': return <FaExclamationCircle className="text-yellow-400" />;
      default: return <FaInfoCircle className="text-blue-400" />;
    }
  };

  // Toast background colors based on type
  const getToastBg = (type) => {
    switch (type) {
      case 'success': return 'from-green-500/20 to-green-600/20 border-green-400/30';
      case 'error': return 'from-red-500/20 to-red-600/20 border-red-400/30';
      case 'warning': return 'from-yellow-500/20 to-yellow-600/20 border-yellow-400/30';
      default: return 'from-blue-500/20 to-blue-600/20 border-blue-400/30';
    }
  };

  const Toaster = () => (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`glass rounded-xl p-4 border backdrop-blur-sm transform transition-all duration-300 animate-in slide-in-from-right-8 ${getToastBg(toast.type)}`}
        >
          <div className="flex items-start gap-3">
            <div className="shrink-0 mt-0.5">
              {getToastIcon(toast.type)}
            </div>
            <div className="flex-1 text-white text-sm">
              {toast.msg}
            </div>
            <button
              onClick={() => remove(toast.id)}
              className="flex-shrink-0 text-white/60 hover:text-white transition-colors"
            >
              <FaTimes size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <ToastContext.Provider value={{ push, remove }}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);