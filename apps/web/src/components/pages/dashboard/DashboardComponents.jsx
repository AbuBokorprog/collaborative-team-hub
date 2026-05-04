"use client";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-3 shadow-[var(--shadow-lg)]">
      {label && (
        <p className="text-xs font-semibold text-[var(--text-primary)] mb-2">
          {label}
        </p>
      )}
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-xs">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: p?.color || p?.fill }}
          />
          <span className="text-[var(--text-muted)]">{p.name}:</span>
          <span className="font-semibold text-[var(--text-primary)]">
            {p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

const PERIODS = ["Today", "7D", "30D", "3M", "6M", "1Y", "Custom"];

export function PeriodTabs({ active, onChange }) {
  return (
    <div className="flex flex-wrap gap-0.5 bg-[var(--surface-2)] p-1 rounded-xl">
      {PERIODS.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
            active === p
              ? "bg-[var(--surface)] text-[var(--text-primary)] shadow-[var(--shadow-sm)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
          )}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

export function InsightCard({
  icon,
  title,
  value,
  delta,
  deltaType,
  subtitle,
  accentColor,
  accentBg,
}) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--text-secondary)]">
            {title}
          </p>
          <p className="text-3xl font-bold text-[var(--text-primary)] mt-1 leading-none">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-[var(--text-muted)] mt-1">{subtitle}</p>
          )}
        </div>
        <div className="p-2.5 rounded-xl" style={{ backgroundColor: accentBg }}>
          <span style={{ color: accentColor }}>{icon}</span>
        </div>
      </div>
      {delta !== undefined && (
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md",
              deltaType === "up"
                ? "bg-[var(--success-soft)] text-[var(--success)]"
                : "bg-[var(--danger-soft)] text-[var(--danger)]",
            )}
          >
            {deltaType === "up" ? (
              <ArrowUp className="w-3 h-3" />
            ) : (
              <ArrowDown className="w-3 h-3" />
            )}
            {delta}
          </span>
          <span className="text-xs text-[var(--text-muted)]">
            vs last period
          </span>
        </div>
      )}
    </Card>
  );
}

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function MemberContributionRow({ member, user, max }) {
  const total = member.tasks + member.goals + member.announcements;
  const pct = max > 0 ? Math.round((total / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3 py-2">
      <Avatar>
        <AvatarImage src={user?.avatar} />
        <AvatarFallback>{user?.name}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium text-[var(--text-primary)]">
            {member.name}
          </p>
          <span className="text-xs font-semibold text-[var(--text-primary)]">
            {total} pts
          </span>
        </div>
        <div className="flex gap-1">
          <div
            className="h-2 rounded-full bg-[var(--accent)]"
            style={{
              width: `${total ? (member.tasks / total) * pct : 0}%`,
              minWidth: 4,
            }}
          />
          <div
            className="h-2 rounded-full bg-[var(--success)]"
            style={{
              width: `${total ? (member.goals / total) * pct : 0}%`,
              minWidth: 4,
            }}
          />
          <div
            className="h-2 rounded-full bg-[var(--warning)]"
            style={{
              width: `${total ? (member.announcements / total) * pct : 0}%`,
              minWidth: 4,
            }}
          />
        </div>
        <div className="flex gap-3 mt-1">
          <span className="text-[10px] text-[var(--text-muted)]">
            {member.tasks} tasks
          </span>
          <span className="text-[10px] text-[var(--text-muted)]">
            {member.goals} goals
          </span>
          <span className="text-[10px] text-[var(--text-muted)]">
            {member.announcements} posts
          </span>
        </div>
      </div>
    </div>
  );
}

const HEAT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HEAT_WEEKS = Array.from({ length: 12 }, (_, wi) =>
  HEAT_DAYS.map((d, di) => {
    const base = wi < 4 ? 1 : wi < 8 ? 2 : 3;
    const rand = Math.floor(Math.random() * 4);
    if (di >= 5) return { day: d, level: rand > 2 ? 0 : rand };
    return { day: d, level: Math.min(4, base + rand - 1) };
  }),
);
const HEAT_COLORS = [
  "var(--surface-2)",
  "rgba(91,79,255,0.2)",
  "rgba(91,79,255,0.45)",
  "rgba(91,79,255,0.7)",
  "var(--accent)",
];

export function ActivityHeatmap() {
  return (
    <div>
      <div className="flex gap-1 overflow-x-auto pb-1">
        {HEAT_WEEKS.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((cell) => (
              <div
                key={cell.day}
                title={`Level ${cell.level}`}
                className="w-3 h-3 rounded-sm flex-shrink-0 transition-opacity hover:opacity-80"
                style={{ backgroundColor: HEAT_COLORS[cell.level] }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 mt-2">
        <span className="text-[10px] text-[var(--text-muted)]">Less</span>
        {HEAT_COLORS.map((c, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: c }}
          />
        ))}
        <span className="text-[10px] text-[var(--text-muted)]">More</span>
      </div>
    </div>
  );
}
