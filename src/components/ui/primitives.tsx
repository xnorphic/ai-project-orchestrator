"use client";

import { clsx } from "@/lib/clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "rounded-3xl border border-[color:var(--border)] bg-card/90 backdrop-blur-sm shadow-[0_1px_0_#ffffff_inset,0_10px_30px_-18px_rgba(0,25,66,0.25)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]",
        size === "sm" && "px-4 py-2 text-sm",
        size === "md" && "px-5 py-2.5 text-sm",
        size === "lg" && "px-7 py-3.5 text-base",
        variant === "primary" &&
          "bg-careem text-midnight hover:brightness-95 shadow-[0_8px_20px_-8px_rgba(0,231,132,0.7)]",
        variant === "outline" &&
          "border border-forest/30 text-forest hover:bg-mint-50",
        variant === "ghost" && "text-forest hover:bg-mint-50",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Badge({
  children,
  color = "#d6ffea",
  text = "#00493e",
  className,
}: {
  children: ReactNode;
  color?: string;
  text?: string;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        className,
      )}
      style={{ backgroundColor: color, color: text }}
    >
      {children}
    </span>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  desc,
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
}) {
  return (
    <div className="mb-6">
      {eyebrow && (
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-careem-deep mb-2">
          {eyebrow}
        </div>
      )}
      <h1 className="text-2xl md:text-3xl font-extrabold text-midnight">
        {title}
      </h1>
      {desc && <p className="mt-2 text-muted max-w-2xl font-[family-name:var(--font-ui)]">{desc}</p>}
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-forest">
      <span className="inline-flex gap-1">
        <span className="typing-dot h-2.5 w-2.5 rounded-full bg-careem" />
        <span
          className="typing-dot h-2.5 w-2.5 rounded-full bg-careem"
          style={{ animationDelay: "0.15s" }}
        />
        <span
          className="typing-dot h-2.5 w-2.5 rounded-full bg-careem"
          style={{ animationDelay: "0.3s" }}
        />
      </span>
      {label && <span className="text-sm font-medium">{label}</span>}
    </div>
  );
}

export function Pill({
  children,
  active,
  onClick,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "rounded-full px-4 py-2 text-sm font-semibold transition-all",
        active
          ? "bg-forest text-off-white"
          : "bg-white border border-[color:var(--border)] text-forest hover:bg-mint-50",
      )}
    >
      {children}
    </button>
  );
}
