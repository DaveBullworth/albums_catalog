"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, X, AlertTriangle } from "lucide-react";

type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: string;
  variant: ToastVariant;
  title: string;
  body?: string;
}

interface ToastValue {
  toast: (t: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastValue | null>(null);

const ICONS = {
  success: Check,
  error: X,
  info: AlertTriangle,
} as const;

const ACCENTS = {
  success: "var(--color-success)",
  error: "var(--color-danger)",
  info: "var(--color-accent)",
} as const;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (t: Omit<Toast, "id">) => {
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36);
      setToasts((prev) => [...prev, { ...t, id }]);
      setTimeout(() => dismiss(id), 4400);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[200] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6">
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const Icon = ICONS[t.variant];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                className="glass pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl px-4 py-3"
                style={{ ["--cover" as string]: ACCENTS[t.variant] }}
                onClick={() => dismiss(t.id)}
              >
                <span
                  className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full"
                  style={{
                    background: `color-mix(in oklab, ${ACCENTS[t.variant]} 22%, transparent)`,
                    color: ACCENTS[t.variant],
                  }}
                >
                  <Icon className="size-4" strokeWidth={2.5} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-text">{t.title}</p>
                  {t.body && (
                    <p className="mt-0.5 truncate text-xs text-muted">{t.body}</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}
