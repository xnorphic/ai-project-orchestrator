"use client";

import { useEffect, useState } from "react";
import { useKeys } from "@/lib/store/keys-store";
import { useUi } from "@/lib/store/ui-store";
import { useHydrated } from "@/lib/use-hydrated";
import { Button } from "@/components/ui/primitives";
import { clsx } from "@/lib/clsx";

function maskedHint(v: string) {
  if (!v) return "";
  return `••••••••${v.slice(-4)}`;
}

export function KeySettings() {
  const hydrated = useHydrated();
  const anthropic = useKeys((s) => s.anthropic);
  const openai = useKeys((s) => s.openai);
  const setAnthropic = useKeys((s) => s.setAnthropic);
  const setOpenai = useKeys((s) => s.setOpenai);
  const clear = useKeys((s) => s.clear);

  const open = useUi((s) => s.keysOpen);
  const setOpen = (v: boolean) =>
    v ? useUi.getState().openKeys() : useUi.getState().closeKeys();
  const [a, setA] = useState("");
  const [o, setO] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (open) {
      setA(anthropic);
      setO(openai);
      setSaved(false);
    }
  }, [open, anthropic, openai]);

  const anyLive = hydrated && (Boolean(anthropic) || Boolean(openai));

  function save() {
    setAnthropic(a);
    setOpenai(o);
    setSaved(true);
    setTimeout(() => setOpen(false), 600);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-forest transition-colors hover:bg-mint-50"
        title="Set your API keys"
      >
        <span
          className={clsx(
            "h-2 w-2 rounded-full",
            anyLive ? "bg-careem" : "bg-[color:var(--border)]",
          )}
        />
        {anyLive ? "AI keys active" : "Add API keys"}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-midnight/30 backdrop-blur-sm p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-[color:var(--border)] bg-card p-6 shadow-2xl animate-float-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-midnight">
                  Your API keys
                </h2>
                <p className="mt-1 text-sm text-muted font-[family-name:var(--font-ui)]">
                  Bring your own keys to run the live agents. Without keys, every
                  step still works using the built-in deterministic engines.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full px-2 text-muted hover:text-midnight"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <Field
                label="Anthropic API key"
                hint="Claude — PRD, tasks, scenarios, report"
                placeholder={anthropic ? maskedHint(anthropic) : "sk-ant-..."}
                value={a}
                onChange={setA}
              />
              <Field
                label="OpenAI API key"
                hint="GPT — personnel matching"
                placeholder={openai ? maskedHint(openai) : "sk-proj-..."}
                value={o}
                onChange={setO}
              />
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  clear();
                  setA("");
                  setO("");
                }}
                className="text-xs font-semibold text-muted hover:text-coral"
              >
                Clear keys
              </button>
              <div className="flex items-center gap-2">
                {saved && (
                  <span className="text-xs font-semibold text-careem-deep">
                    Saved ✓
                  </span>
                )}
                <Button size="sm" onClick={save}>
                  Save keys
                </Button>
              </div>
            </div>

            <p className="mt-4 rounded-2xl bg-mint-50 px-3 py-2 text-[11px] text-forest/80 font-[family-name:var(--font-ui)]">
              Keys are stored only in this browser (localStorage) and sent only to
              this app&apos;s own routes, which forward them to the provider you
              chose. Use a scoped key and rotate it when you are done.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

function Field({
  label,
  hint,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-midnight">{label}</span>
      <span className="ml-2 text-xs text-muted">{hint}</span>
      <input
        type="password"
        autoComplete="off"
        spellCheck={false}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-2xl border border-[color:var(--border)] bg-white px-4 py-2.5 text-sm text-midnight focus:border-careem focus:outline-none font-[family-name:var(--font-ui)]"
      />
    </label>
  );
}
