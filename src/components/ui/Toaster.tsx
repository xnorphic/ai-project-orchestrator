"use client";

import { useEffect } from "react";
import { useToasts, type Toast } from "@/lib/store/toast-store";
import { useUi } from "@/lib/store/ui-store";
import { clsx } from "@/lib/clsx";

const TONE: Record<
  Toast["tone"],
  { bar: string; bg: string; icon: string }
> = {
  info: { bar: "#a6edf2", bg: "#eef9fb", icon: "ℹ" },
  warning: { bar: "#fb6704", bg: "#fff6ee", icon: "⚠" },
  error: { bar: "#ff4d4f", bg: "#fff1f0", icon: "⚠" },
  success: { bar: "#00e784", bg: "#f1fdf7", icon: "✓" },
};

function ToastCard({ t }: { t: Toast }) {
  const dismiss = useToasts((s) => s.dismiss);
  const openKeys = useUi((s) => s.openKeys);
  const tone = TONE[t.tone];

  useEffect(() => {
    if (t.duration && t.duration > 0) {
      const timer = setTimeout(() => dismiss(t.id), t.duration);
      return () => clearTimeout(timer);
    }
  }, [t.id, t.duration, dismiss]);

  return (
    <div
      className="animate-float-in pointer-events-auto w-80 overflow-hidden rounded-2xl border border-[color:var(--border)] bg-card shadow-[0_20px_44px_-20px_rgba(0,25,66,0.45)]"
      role="status"
    >
      <div className="flex">
        <div className="w-1.5 shrink-0" style={{ backgroundColor: tone.bar }} />
        <div className="flex-1 p-3.5">
          <div className="flex items-start gap-2">
            <span
              className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold"
              style={{ backgroundColor: tone.bg, color: tone.bar }}
            >
              {tone.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-midnight">{t.title}</p>
              {t.message && (
                <p className="mt-0.5 text-xs text-muted font-[family-name:var(--font-ui)]">
                  {t.message}
                </p>
              )}
              <div className="mt-2 flex items-center gap-2">
                {t.keysAction && (
                  <button
                    onClick={() => {
                      openKeys();
                      dismiss(t.id);
                    }}
                    className="rounded-full bg-careem px-3 py-1 text-xs font-bold text-midnight hover:brightness-95"
                  >
                    Update API keys
                  </button>
                )}
                <button
                  onClick={() => dismiss(t.id)}
                  className="rounded-full px-3 py-1 text-xs font-semibold text-forest hover:bg-mint-50"
                >
                  {t.keysAction ? "Continue with fallback" : "Dismiss"}
                </button>
              </div>
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 text-muted hover:text-midnight"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Toaster() {
  const toasts = useToasts((s) => s.toasts);
  return (
    <div
      className={clsx(
        "pointer-events-none fixed right-4 top-4 z-[60] flex flex-col gap-2.5",
      )}
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} t={t} />
      ))}
    </div>
  );
}
