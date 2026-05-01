"use client";
import { cn } from "@/lib/utils";

export function Badge({ children, color, className }) {
  const colors = {
    accent: "bg-[var(--accent-soft)] text-[var(--accent)]",
    success: "bg-[var(--success-soft)] text-[var(--success)]",
    warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
    danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
    info: "bg-[var(--info-soft)] text-[var(--info)]",
    neutral: "bg-[var(--surface-2)] text-[var(--text-secondary)]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        colors[color || "neutral"],
        className,
      )}
    >
      {children}
    </span>
  );
}
