"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { ANALYTICS_DATA } from "@/lib/utils";
import { ChartTooltip, MemberContributionRow } from "./DashboardComponents";

export default function TeamTab({ users }) {
  const maxContrib = Math.max(
    ...ANALYTICS_DATA.memberContributions.map((m) => m.tasks + m.goals + m.announcements),
    1,
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <Card className="lg:col-span-3">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">Member Contributions</h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Tasks · Goals · Announcements</p>
            </div>
            <div className="flex gap-3 text-[10px] text-[var(--text-muted)]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--accent)]" /> Tasks</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--success)]" /> Goals</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--warning)]" /> Posts</span>
            </div>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {ANALYTICS_DATA.memberContributions.map((m, i) => (
              <MemberContributionRow key={m.name} member={m} user={users[i]} max={maxContrib} />
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="font-semibold text-[var(--text-primary)] mb-5">Contributions Chart</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={ANALYTICS_DATA.memberContributions} margin={{ top: 4, right: 4, bottom: 0, left: -24 }} barSize={9}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="tasks" name="Tasks" fill="var(--accent)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="goals" name="Goals" fill="var(--success)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="announcements" name="Posts" fill="var(--warning)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
