"use client";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export function AvatarGroup({ users, max = 4, size = "sm" }) {
  const shown = users.slice(0, max);
  const rest = users.length - max;
  const sizes = {
    xs: "w-6 h-6 text-xs -ml-1.5",
    sm: "w-8 h-8 text-xs -ml-2",
    md: "w-9 h-9 text-sm -ml-2.5",
  };
  return (
    <div className="flex items-center">
      {shown.map((user, i) => (
        <div
          key={user.id}
          className={cn(
            "rounded-full border-2 border-(--surface) shrink-0",
            sizes[size],
            i > 0 && "-ml-2",
          )}
          style={{ zIndex: shown.length - i }}
        >
          <div
            className={cn(
              "rounded-full flex items-center justify-center font-semibold text-white w-full h-full",
            )}
            style={{ backgroundColor: user.color }}
          >
            {user.avatar}
          </div>
        </div>
      ))}
      {rest > 0 && (
        <div
          className={cn(
            "rounded-full border-2 border-(--surface) bg-(--surface-2) flex items-center justify-center text-xs font-medium text-(--text-secondary) shrink-0",
            sizes[size],
            "-ml-2",
          )}
        >
          +{rest}
        </div>
      )}
    </div>
  );
}
