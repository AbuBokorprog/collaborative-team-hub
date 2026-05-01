"use client";
import { cn } from "@/lib/utils";

export function Card({ children, className, hover, ...props }) {
  return (
    <div
      className={cn(
        "bg-(--surface) rounded-2xl border border-border p-5",
        "shadow-(--shadow-sm)",
        hover &&
          "hover:shadow-(--shadow) hover:border-(--border-strong) transition-all duration-200 cursor-pointer",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
