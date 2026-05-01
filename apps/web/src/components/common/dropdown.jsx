"use client";
import { cn } from "@/lib/utils";

export function Dropdown({ trigger, children, align = "right" }) {
  return (
    <div className="relative group">
      {trigger}
      <div
        className={cn(
          "absolute top-full mt-2 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-[var(--shadow-lg)] py-1 min-w-[200px] z-50",
          "opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150",
          align === "right" ? "right-0" : "left-0",
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function DropdownItem({ children, icon, onClick, danger, className }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors text-left",
        danger
          ? "text-[var(--danger)] hover:bg-[var(--danger-soft)]"
          : "text-[var(--text-primary)] hover:bg-[var(--surface-2)]",
        className,
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
