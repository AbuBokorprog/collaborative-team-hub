"use client";
import { cn } from "@/lib/utils";

export function Progress({
  value,
  color = "var(--accent)",
  height = 6,
  className,
}) {
  return (
    <div
      className={cn("w-full bg-border rounded-full overflow-hidden", className)}
      style={{ height }}
    >
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );
}
