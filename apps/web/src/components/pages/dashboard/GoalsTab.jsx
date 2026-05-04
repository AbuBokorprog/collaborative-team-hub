"use client";
import {
  RadialBarChart, RadialBar, Tooltip, ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { STATUS_CONFIG } from "@/lib/utils";
import { ChartTooltip } from "./DashboardComponents";

const GOAL_COLORS = ["#5b4fff", "#e11d48", "#16a34a", "#d97706", "#0891b2", "#7c3aed", "#dc2626", "#059669"];

export default function GoalsTab({ goals }) {
  const radialData = goals.length
    ? goals.slice(0, 8).map((g, i) => ({
        name: g.title,
        value: g.progress ?? 0,
        fill: GOAL_COLORS[i % GOAL_COLORS.length],
      }))
    : [{ name: "No goals", value: 0, fill: "#e5e7eb" }];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <h3 className="font-semibold text-[var(--text-primary)] mb-5">Goal Completion</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={180} height={180}>
              <RadialBarChart
                cx="50%" cy="50%" innerRadius={20} outerRadius={80}
                data={radialData} startAngle={90} endAngle={-270}
              >
                <RadialBar minAngle={5} dataKey="value" cornerRadius={4} />
                <Tooltip content={<ChartTooltip />} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="space-y-2.5 overflow-y-auto max-h-44">
              {radialData.map((g) => (
                <div key={g.name} className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: g.fill }} />
                  <div>
                    <p className="text-xs font-medium text-[var(--text-primary)] truncate max-w-28">{g.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{g.value}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-[var(--text-primary)] mb-5">Goals by Status</h3>
          <div className="space-y-5">
            {goals.map((goal) => {
              const s = STATUS_CONFIG[goal.status];
              return (
                <div key={goal.id} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{goal.title}</p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-bold text-[var(--text-primary)]">{goal.progress}%</span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>
                        {s.label}
                      </span>
                    </div>
                  </div>
                  <Progress value={goal.progress} color={s.color} height={6} />
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
