"use client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { ActivityItem } from "./ProfileShared";

const GOALS_DATA = [
  { title: "Launch v2.0 Platform", progress: 68, color: "var(--accent)" },
  { title: "Reach 10K Active Users", progress: 42, color: "var(--danger)" },
  { title: "Team Growth to 20 FTEs", progress: 60, color: "var(--info)" },
];

const ACHIEVEMENTS = [
  { emoji: "🚀", label: "Early Adopter", earned: true },
  { emoji: "✅", label: "10 Tasks Done", earned: true },
  { emoji: "🎯", label: "Goal Setter", earned: true },
  { emoji: "📢", label: "First Post", earned: true },
  { emoji: "🔥", label: "7-day Streak", earned: false },
  { emoji: "💯", label: "100 Tasks", earned: false },
  { emoji: "🏆", label: "Top Contributor", earned: false },
  { emoji: "⚡", label: "Speed Demon", earned: false },
];

export default function ActivityTab({ stats, recentActivity }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="text-center py-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
              style={{ backgroundColor: s.bg, color: s.color }}
            >
              {s.icon}
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{s.value}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">Your Goal Ownership</h3>
        <div className="space-y-4">
          {GOALS_DATA.map((g) => (
            <div key={g.title} className="space-y-1.5">
              <div className="flex justify-between">
                <p className="text-sm font-medium text-[var(--text-primary)]">{g.title}</p>
                <span className="text-sm font-bold text-[var(--text-primary)]">{g.progress}%</span>
              </div>
              <Progress value={g.progress} color={g.color} height={6} />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-[var(--text-primary)]">Recent Activity</h3>
          <Badge color="neutral">{recentActivity.length} actions</Badge>
        </div>
        <div>
          {recentActivity.map((item, i) => (
            <ActivityItem key={i} {...item} />
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-[var(--text-primary)] mb-5">Achievements</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ACHIEVEMENTS.map((b) => (
            <div
              key={b.label}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-center",
                b.earned
                  ? "border-[var(--accent)]/30 bg-[var(--accent-soft)]"
                  : "border-[var(--border)] opacity-40 grayscale",
              )}
            >
              <span className="text-2xl">{b.emoji}</span>
              <span className="text-[11px] font-medium text-[var(--text-primary)] leading-tight">{b.label}</span>
              {b.earned && <span className="text-[10px] text-[var(--accent)] font-semibold">Earned</span>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
