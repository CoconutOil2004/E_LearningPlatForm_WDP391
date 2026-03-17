import { AnimatePresence, motion } from "framer-motion";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const ToastContext = createContext(null);

/**
 * toastEmitter — module-level bridge cho axios interceptor.
 *
 * Vì axios interceptor nằm NGOÀI React tree, nó không thể gọi useToast() trực tiếp.
 * Giải pháp: ToastProvider khi mount sẽ đăng ký hàm push() của mình vào đây.
 * Interceptor chỉ cần gọi toastEmitter.emit(msg, type) — emitter tự forward vào React state.
 *
 * Dùng ở services/index.js:
 *   import { toastEmitter } from "../contexts/ToastContext";
 *   toastEmitter.emit("Lỗi từ server", "error");
 *   toastEmitter.emit("Lưu thành công!", "success");
 */
export const toastEmitter = {
  _handler: null,
  emit(message, type = "error") {
    if (this._handler) this._handler(message, type);
  },
  register(handler) {
    this._handler = handler;
  },
  unregister() {
    this._handler = null;
  },
};

/**
 * Global ToastProvider — đặt ở RootLayout (bên trong RouterProvider).
 *
 * - Tự động hiện toast từ mọi API response qua toastEmitter (không cần gọi thủ công từng page).
 * - Vẫn export useToast() cho các page cần toast thủ công (edge case).
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3500,
    );
  }, []);

  useEffect(() => {
    toastEmitter.register(push);
    return () => toastEmitter.unregister();
  }, [push]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg) => push(msg, "success"),
    error: (msg) => push(msg, "error"),
    info: (msg) => push(msg, "info"),
  };

  const typeStyles = {
    success: { bg: "var(--color-success)", icon: "✓" },
    error: { bg: "var(--color-danger)", icon: "✕" },
    info: { bg: "var(--color-primary)", icon: "ℹ" },
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => {
            const style = typeStyles[t.type] || typeStyles.info;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 100, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.9 }}
                transition={{ duration: 0.25 }}
                className="pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white text-sm font-semibold min-w-[280px] shadow-2xl cursor-pointer"
                style={{ backgroundColor: style.bg }}
                onClick={() => dismiss(t.id)}
              >
                <span className="flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full bg-white/20 shrink-0">
                  {style.icon}
                </span>
                <span className="flex-1">{t.message}</span>
                <span className="text-xs transition-opacity opacity-60 hover:opacity-100">
                  ✕
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
};
