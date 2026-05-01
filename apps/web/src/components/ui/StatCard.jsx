"use client";
import { Card } from "./card";

import { cn } from "@/lib/utils";

export function StatCard({
  title,
  value,
  change,
  changeType,
  icon,
  iconColor,
  iconBg,
  subtitle,
}) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-(--text-secondary) font-medium">{title}</p>
          <p className="text-2xl font-bold text-(--text-primary) mt-1">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-(--text-muted) mt-1">{subtitle}</p>
          )}
        </div>
        <div
          className="p-2.5 rounded-xl shrink-0"
          style={{ backgroundColor: iconBg || "var(--accent-soft)" }}
        >
          <span style={{ color: iconColor || "var(--accent)" }}>{icon}</span>
        </div>
      </div>
      {change !== undefined && (
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "text-xs font-medium px-1.5 py-0.5 rounded-md",
              changeType === "up"
                ? "bg-(--success-soft) text-(--success)"
                : changeType === "down"
                  ? "bg-(--danger-soft) text-(--danger)"
                  : "bg-(--surface-2) text-(--text-muted)",
            )}
          >
            {changeType === "up" ? "↑" : changeType === "down" ? "↓" : "→"}{" "}
            {change}
          </span>
          <span className="text-xs text-(--text-muted)">vs last month</span>
        </div>
      )}
    </Card>
  );
}
