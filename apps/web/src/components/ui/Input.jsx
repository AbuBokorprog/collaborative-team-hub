"use client";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export const Input = forwardRef(function Input(
  { label, icon, error, className, ...props },
  ref,
) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-sm font-medium text-(--text-primary)">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted)">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full bg-(--surface) border border-border rounded-xl px-4 py-2.5 text-sm text-(--text-primary) placeholder:text-(--text-muted)",
            "focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all",
            "hover:border-(--border-strong)",
            icon && "pl-10",
            error && "border-(--danger)",
            className,
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-(--danger)">{error}</p>}
    </div>
  );
});
