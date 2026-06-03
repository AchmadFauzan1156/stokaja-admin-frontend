"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success", duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const showSuccess = useCallback(
    (msg) => addToast(msg, "success"),
    [addToast]
  );

  const showError = useCallback(
    (msg) => addToast(msg, "error"),
    [addToast]
  );

  const showInfo = useCallback(
    (msg) => addToast(msg, "info"),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showInfo }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              px-4 py-3
              rounded-xl
              shadow-lg
              font-signika
              text-sm
              text-white
              animate-slide-in
              transition-all duration-300
              ${toast.type === "success"
                ? "bg-[#6E822E]"
                : toast.type === "error"
                ? "bg-[#FF5C2B]"
                : "bg-[#3B82F6]"
              }
            `}
          >
            <div className="flex items-center gap-2">
              <span>
                {toast.type === "success"
                  ? "✅"
                  : toast.type === "error"
                  ? "❌"
                  : "ℹ️"}
              </span>
              <span>{toast.message}</span>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast harus digunakan di dalam ToastProvider");
  }
  return context;
}
