"use client";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ANALYTICS_DATA } from "@/lib/utils";
import { ChartTooltip, ActivityHeatmap } from "./DashboardComponents";

export default function OverviewTab({ goals }) {
  const velocityData = [
    { w: "W1", v: 62 }, { w: "W2", v: 71 }, { w: "W3", v: 58 }, { w: "W4", v: 84 },
    { w: "W5", v: 79 }, { w: "W6", v: 91 }, { w: "W7", v: 87 }, { w: "W8", v: 95 },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <Card className="lg:col-span-3">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">Task Completion Trend</h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Created vs completed over 6 months</p>
            </div>
            <div className="flex gap-4 text-xs text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 rounded-full bg-[var(--accent)] inline-block" /> Completed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 rounded-full bg-[var(--border-strong)] inline-block" /> Created
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={ANALYTICS_DATA.taskCompletion} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradCreated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9c9895" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#9c9895" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="created" name="Created" stroke="var(--border-strong)" fill="url(#gradCreated)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="completed" name="Completed" stroke="var(--accent)" fill="url(#gradCompleted)" strokeWidth={2.5} dot={{ fill: "var(--accent)", r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="lg:col-span-2">
          <div className="mb-5">
            <h3 className="font-semibold text-[var(--text-primary)]">Weekly Activity</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Commits, reviews & comments</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ANALYTICS_DATA.teamActivity} margin={{ top: 4, right: 0, bottom: 0, left: -24 }} barSize={7}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="commits" name="Commits" fill="var(--accent)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="reviews" name="Reviews" fill="var(--info)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="comments" name="Comments" fill="var(--warning)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">Sprint Velocity</h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">8-week trend</p>
            </div>
            <Badge color="success">↑ 12%</Badge>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={velocityData} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="w" tick={{ fontSize: 10, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <YAxis domain={[50, 100]} tick={{ fontSize: 10, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="v" name="Velocity" stroke="var(--accent)" strokeWidth={2.5} dot={{ fill: "var(--accent)", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div className="mb-4">
            <h3 className="font-semibold text-[var(--text-primary)]">Activity Heatmap</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Last 12 weeks</p>
          </div>
          <ActivityHeatmap />
        </Card>

        <Card>
          <div className="mb-2">
            <h3 className="font-semibold text-[var(--text-primary)]">Goal Distribution</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">By status</p>
          </div>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie
                data={[
                  { name: "On Track", value: goals.filter((g) => g.status === "on-track").length || 1 },
                  { name: "At Risk", value: goals.filter((g) => g.status === "at-risk").length || 1 },
                  { name: "Behind", value: goals.filter((g) => g.status === "behind").length || 1 },
                ]}
                cx="50%" cy="50%" innerRadius={36} outerRadius={55} paddingAngle={3} dataKey="value"
              >
                {["#16a34a", "#d97706", "#dc2626"].map((c, i) => <Cell key={i} fill={c} />)}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
