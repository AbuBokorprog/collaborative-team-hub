"use client";
import { cn } from "@/lib/utils";

export function Avatar({ user, size = "md", showOnline, className }) {
  const sizes = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-11 h-11 text-base",
    xl: "w-14 h-14 text-lg",
  };
  const dotSizes = {
    xs: "w-1.5 h-1.5",
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3",
    xl: "w-3.5 h-3.5",
  };
  return (
    <div className={cn("relative inline-flex shrink-0", className)}>
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-semibold text-white shrink-0",
          sizes[size],
        )}
        style={{ backgroundColor: user?.color || "#5b4fff" }}
      >
        {user?.avatar || user?.name?.slice(0, 2) || "?"}
      </div>
      {showOnline && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-(--surface)",
            dotSizes[size],
            user?.online ? "bg-(--success)" : "bg-(--border-strong)",
          )}
        />
      )}
    </div>
  );
}
