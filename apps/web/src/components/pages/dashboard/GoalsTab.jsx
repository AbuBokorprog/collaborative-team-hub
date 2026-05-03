"use client";
import {
  RadialBarChart, RadialBar, Tooltip, ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ANALYTICS_DATA, STATUS_CONFIG } from "@/lib/utils";
import { ChartTooltip } from "./DashboardComponents";

export default function GoalsTab({ goals }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <h3 className="font-semibold text-[var(--text-primary)] mb-5">Goal Progress Overview</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={180} height={180}>
              <RadialBarChart
                cx="50%" cy="50%" innerRadius={20} outerRadius={80}
                data={ANALYTICS_DATA.goalProgress} startAngle={90} endAngle={-270}
              >
                <RadialBar minAngle={5} dataKey="value" cornerRadius={4} />
                <Tooltip content={<ChartTooltip />} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="space-y-2.5">
              {ANALYTICS_DATA.goalProgress.map((g) => (
                <div key={g.name} className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: g.fill }} />
                  <div>
                    <p className="text-xs font-medium text-[var(--text-primary)]">{g.name}</p>
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
