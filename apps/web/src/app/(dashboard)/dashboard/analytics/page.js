"use client";

import {
  Target,
  CheckSquare,
  Users,
  Download,
  RefreshCw,
  Zap,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import Header from "@/components/common/header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn , ANALYTICS_DATA, STATUS_CONFIG } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

/* ─── Shared tooltip ─────────────────────────────── */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {return null;}
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
            style={{ backgroundColor: p.color || p.fill }}
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

/* ─── Period selector ────────────────────────────── */
const PERIODS = ["7D", "30D", "3M", "6M", "1Y"];

function PeriodTabs({ active, onChange }) {
  return (
    <div className="flex gap-0.5 bg-[var(--surface-2)] p-1 rounded-xl">
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

/* ─── Insight card ───────────────────────────────── */
function InsightCard({
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

/* ─── Member row ─────────────────────────────────── */
function MemberContributionRow({ member, user, max }) {
  const total = member.tasks + member.goals + member.announcements;
  const pct = Math.round((total / max) * 100);
  return (
    <div className="flex items-center gap-3 py-2">
      <Avatar user={user} size="sm" />
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
            style={{ width: `${(member.tasks / total) * pct}%`, minWidth: 4 }}
          />
          <div
            className="h-2 rounded-full bg-[var(--success)]"
            style={{ width: `${(member.goals / total) * pct}%`, minWidth: 4 }}
          />
          <div
            className="h-2 rounded-full bg-[var(--warning)]"
            style={{
              width: `${(member.announcements / total) * pct}%`,
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

/* ─── Heatmap ────────────────────────────────────── */
const HEAT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HEAT_WEEKS = Array.from({ length: 12 }, (_, wi) =>
  HEAT_DAYS.map((d, di) => {
    const base = wi < 4 ? 1 : wi < 8 ? 2 : 3;
    const rand = Math.floor(Math.random() * 4);
    if (di >= 5) {return { day: d, level: rand > 2 ? 0 : rand };}
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

function ActivityHeatmap() {
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

/* ─── Goal progress radial ───────────────────────── */
const GOAL_COLORS = ["#5b4fff", "#e11d48", "#16a34a", "#d97706", "#0891b2"];

/* ─── Page ───────────────────────────────────────── */
export default function AnalyticsPage() {
  const { goals, users, tasks } = useAppStore();
  const [period, setPeriod] = useState("6M");
  const [activeTab, setActiveTab] = useState("overview");

  const TABS = ["overview", "tasks", "goals", "team"];

  const totalTasks = Object.values(tasks).flat().length;
  const doneTasks = tasks.done.length;
  const completionRate = Math.round((doneTasks / totalTasks) * 100);
  const avgGoalProgress = Math.round(
    goals.reduce((a, g) => a + g.progress, 0) / goals.length,
  );
  const onlineCount = users.filter((u) => u.online).length;

  const maxContrib = Math.max(
    ...ANALYTICS_DATA.memberContributions.map(
      (m) => m.tasks + m.goals + m.announcements,
    ),
  );

  /* velocity sparkline data */
  const velocityData = [
    { w: "W1", v: 62 },
    { w: "W2", v: 71 },
    { w: "W3", v: 58 },
    { w: "W4", v: 84 },
    { w: "W5", v: 79 },
    { w: "W6", v: 91 },
    { w: "W7", v: 87 },
    { w: "W8", v: 95 },
  ];

  return (
    <>
      <div className="space-y-6 animate-slide-in">
        <Header
          title="Analytics"
          subtitle="Team performance, velocity & contribution insights"
        />
        {/* ── Toolbar ───────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Tab switcher */}
          <div className="flex gap-0.5 bg-(--surface-2) p-1 rounded-xl">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all",
                  activeTab === t
                    ? "bg-(--surface) text-foreground shadow-(--shadow-sm)"
                    : "text-(--text-muted) hover:text-(--text-secondary)",
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <PeriodTabs active={period} onChange={setPeriod} />
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border)] text-sm text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text-secondary)] transition-all">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
            <button className="p-2 rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text-secondary)] transition-all">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ── KPI row ───────────────────────────────── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <InsightCard
            title="Task Completion Rate"
            value={`${completionRate}%`}
            delta="8%"
            deltaType="up"
            subtitle={`${doneTasks} of ${totalTasks} tasks done`}
            icon={<CheckSquare size={18} />}
            accentColor="var(--accent)"
            accentBg="var(--accent-soft)"
          />
          <InsightCard
            title="Avg. Goal Progress"
            value={`${avgGoalProgress}%`}
            delta="5%"
            deltaType="up"
            subtitle={`${goals.length} active goals`}
            icon={<Target size={18} />}
            accentColor="var(--success)"
            accentBg="var(--success-soft)"
          />
          <InsightCard
            title="Team Velocity"
            value="91%"
            delta="12%"
            deltaType="up"
            subtitle="Sprint efficiency score"
            icon={<Zap size={18} />}
            accentColor="var(--warning)"
            accentBg="var(--warning-soft)"
          />
          <InsightCard
            title="Active Members"
            value={`${onlineCount}/${users.length}`}
            subtitle="Online right now"
            icon={<Users size={18} />}
            accentColor="var(--info)"
            accentBg="var(--info-soft)"
          />
        </div>

        {/* ── OVERVIEW TAB ─────────────────────────── */}
        {activeTab === "overview" && (
          <div className="space-y-5">
            {/* Row 1: area + bar */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              {/* Task completion area */}
              <Card className="lg:col-span-3">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)]">
                      Task Completion Trend
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      Created vs completed over 6 months
                    </p>
                  </div>
                  <div className="flex gap-4 text-xs text-[var(--text-muted)]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-1.5 rounded-full bg-[var(--accent)] inline-block" />{" "}
                      Completed
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-1.5 rounded-full bg-[var(--border-strong)] inline-block" />{" "}
                      Created
                    </span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart
                    data={ANALYTICS_DATA.taskCompletion}
                    margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
                  >
                    <defs>
                      <linearGradient
                        id="gradCompleted"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="var(--accent)"
                          stopOpacity={0.18}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--accent)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="gradCreated"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#9c9895"
                          stopOpacity={0.12}
                        />
                        <stop
                          offset="95%"
                          stopColor="#9c9895"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="created"
                      name="Created"
                      stroke="var(--border-strong)"
                      fill="url(#gradCreated)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="completed"
                      name="Completed"
                      stroke="var(--accent)"
                      fill="url(#gradCompleted)"
                      strokeWidth={2.5}
                      dot={{ fill: "var(--accent)", r: 3 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>

              {/* Team activity bar */}
              <Card className="lg:col-span-2">
                <div className="mb-5">
                  <h3 className="font-semibold text-[var(--text-primary)]">
                    Weekly Activity
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Commits, reviews & comments
                  </p>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={ANALYTICS_DATA.teamActivity}
                    margin={{ top: 4, right: 0, bottom: 0, left: -24 }}
                    barSize={7}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar
                      dataKey="commits"
                      name="Commits"
                      fill="var(--accent)"
                      radius={[3, 3, 0, 0]}
                    />
                    <Bar
                      dataKey="reviews"
                      name="Reviews"
                      fill="var(--info)"
                      radius={[3, 3, 0, 0]}
                    />
                    <Bar
                      dataKey="comments"
                      name="Comments"
                      fill="var(--warning)"
                      radius={[3, 3, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Row 2: velocity + heatmap + goals */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Velocity line */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)]">
                      Sprint Velocity
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      8-week trend
                    </p>
                  </div>
                  <Badge color="success">↑ 12%</Badge>
                </div>
                <ResponsiveContainer width="100%" height={140}>
                  <LineChart
                    data={velocityData}
                    margin={{ top: 4, right: 4, bottom: 0, left: -28 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="w"
                      tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[50, 100]}
                      tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="v"
                      name="Velocity"
                      stroke="var(--accent)"
                      strokeWidth={2.5}
                      dot={{ fill: "var(--accent)", r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* Activity heatmap */}
              <Card>
                <div className="mb-4">
                  <h3 className="font-semibold text-[var(--text-primary)]">
                    Activity Heatmap
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Last 12 weeks
                  </p>
                </div>
                <ActivityHeatmap />
              </Card>

              {/* Goal distribution pie */}
              <Card>
                <div className="mb-2">
                  <h3 className="font-semibold text-[var(--text-primary)]">
                    Goal Distribution
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    By status
                  </p>
                </div>
                <ResponsiveContainer width="100%" height={130}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "On Track", value: 3 },
                        { name: "At Risk", value: 1 },
                        { name: "Behind", value: 1 },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={36}
                      outerRadius={55}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {["#16a34a", "#d97706", "#dc2626"].map((c, i) => (
                        <Cell key={i} fill={c} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                  {[
                    ["On Track", "#16a34a", 3],
                    ["At Risk", "#d97706", 1],
                    ["Behind", "#dc2626", 1],
                  ].map(([l, c, v]) => (
                    <span
                      key={l}
                      className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]"
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: c }}
                      />{" "}
                      {l} ({v})
                    </span>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ── TASKS TAB ─────────────────────────────── */}
        {activeTab === "tasks" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Card>
                <h3 className="font-semibold text-[var(--text-primary)] mb-5">
                  Tasks by Column
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      label: "To Do",
                      count: tasks.todo.length,
                      color: "var(--text-muted)",
                      bg: "var(--surface-2)",
                    },
                    {
                      label: "In Progress",
                      count: tasks.inProgress.length,
                      color: "var(--warning)",
                      bg: "var(--warning-soft)",
                    },
                    {
                      label: "In Review",
                      count: tasks.review.length,
                      color: "var(--info)",
                      bg: "var(--info-soft)",
                    },
                    {
                      label: "Done",
                      count: tasks.done.length,
                      color: "var(--success)",
                      bg: "var(--success-soft)",
                    },
                  ].map((col) => (
                    <div key={col.label} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-[var(--text-primary)]">
                          {col.label}
                        </span>
                        <span className="font-semibold text-[var(--text-primary)]">
                          {col.count}
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-[var(--surface-2)] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${(col.count / totalTasks) * 100}%`,
                            backgroundColor: col.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold text-[var(--text-primary)] mb-5">
                  Priority Breakdown
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={[
                      {
                        name: "High",
                        count: Object.values(tasks)
                          .flat()
                          .filter((t) => t.priority === "high").length,
                      },
                      {
                        name: "Medium",
                        count: Object.values(tasks)
                          .flat()
                          .filter((t) => t.priority === "medium").length,
                      },
                      {
                        name: "Low",
                        count: Object.values(tasks)
                          .flat()
                          .filter((t) => t.priority === "low").length,
                      },
                    ]}
                    layout="vertical"
                    margin={{ top: 0, right: 20, bottom: 0, left: 10 }}
                    barSize={14}
                  >
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 12, fill: "var(--text-muted)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="count" name="Tasks" radius={[0, 4, 4, 0]}>
                      {["#dc2626", "#d97706", "#0891b2"].map((c, i) => (
                        <Cell key={i} fill={c} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Task list summary */}
            <Card>
              <h3 className="font-semibold text-[var(--text-primary)] mb-4">
                All Tasks Summary
              </h3>
              <div className="divide-y divide-[var(--border)]">
                {Object.values(tasks)
                  .flat()
                  .map((task) => {
                    const statusMap = {
                      todo: { label: "To Do", color: "neutral" },
                      inProgress: { label: "In Progress", color: "warning" },
                      review: { label: "Review", color: "info" },
                      done: { label: "Done", color: "success" },
                    };
                    const colKey = Object.entries(tasks).find(([, list]) =>
                      list.find((t) => t.id === task.id),
                    )?.[0];
                    const status = statusMap[colKey] || statusMap.todo;
                    return (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 py-3"
                      >
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full flex-shrink-0",
                            task.priority === "high"
                              ? "bg-red-500"
                              : task.priority === "medium"
                                ? "bg-amber-500"
                                : "bg-cyan-500",
                          )}
                        />
                        <p className="flex-1 text-sm text-[var(--text-primary)] truncate">
                          {task.title}
                        </p>
                        <span className="hidden sm:block text-xs text-[var(--text-muted)]">
                          {task.label}
                        </span>
                        <Badge color={status.color}>{status.label}</Badge>
                        <Avatar user={task.assignee} size="xs" />
                      </div>
                    );
                  })}
              </div>
            </Card>
          </div>
        )}

        {/* ── GOALS TAB ─────────────────────────────── */}
        {activeTab === "goals" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Radial progress chart */}
              <Card>
                <h3 className="font-semibold text-[var(--text-primary)] mb-5">
                  Goal Progress Overview
                </h3>
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width={180} height={180}>
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius={20}
                      outerRadius={80}
                      data={ANALYTICS_DATA.goalProgress}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <RadialBar
                        minAngle={5}
                        dataKey="value"
                        cornerRadius={4}
                      />
                      <Tooltip content={<ChartTooltip />} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="space-y-2.5">
                    {ANALYTICS_DATA.goalProgress.map((g, i) => (
                      <div key={g.name} className="flex items-center gap-2.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: g.fill }}
                        />
                        <div>
                          <p className="text-xs font-medium text-[var(--text-primary)]">
                            {g.name}
                          </p>
                          <p className="text-xs text-[var(--text-muted)]">
                            {g.value}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Goal status breakdown */}
              <Card>
                <h3 className="font-semibold text-[var(--text-primary)] mb-5">
                  Goals by Status
                </h3>
                <div className="space-y-5">
                  {goals.map((goal) => {
                    const s = STATUS_CONFIG[goal.status];
                    return (
                      <div key={goal.id} className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                            {goal.title}
                          </p>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs font-bold text-[var(--text-primary)]">
                              {goal.progress}%
                            </span>
                            <span
                              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                              style={{ background: s.bg, color: s.color }}
                            >
                              {s.label}
                            </span>
                          </div>
                        </div>
                        <Progress
                          value={goal.progress}
                          color={s.color}
                          height={6}
                        />
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ── TEAM TAB ──────────────────────────────── */}
        {activeTab === "team" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              {/* Contribution bars */}
              <Card className="lg:col-span-3">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-semibold text-[var(--text-primary)]">
                      Member Contributions
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      Tasks · Goals · Announcements
                    </p>
                  </div>
                  <div className="flex gap-3 text-[10px] text-[var(--text-muted)]">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                      Tasks
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[var(--success)]" />
                      Goals
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[var(--warning)]" />
                      Posts
                    </span>
                  </div>
                </div>
                <div className="divide-y divide-[var(--border)]">
                  {ANALYTICS_DATA.memberContributions.map((m, i) => (
                    <MemberContributionRow
                      key={m.name}
                      member={m}
                      user={users[i]}
                      max={maxContrib}
                    />
                  ))}
                </div>
              </Card>

              {/* Grouped bar chart */}
              <Card className="lg:col-span-2">
                <h3 className="font-semibold text-[var(--text-primary)] mb-5">
                  Contributions Chart
                </h3>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={ANALYTICS_DATA.memberContributions}
                    margin={{ top: 4, right: 4, bottom: 0, left: -24 }}
                    barSize={9}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar
                      dataKey="tasks"
                      name="Tasks"
                      fill="var(--accent)"
                      radius={[3, 3, 0, 0]}
                    />
                    <Bar
                      dataKey="goals"
                      name="Goals"
                      fill="var(--success)"
                      radius={[3, 3, 0, 0]}
                    />
                    <Bar
                      dataKey="announcements"
                      name="Posts"
                      fill="var(--warning)"
                      radius={[3, 3, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Member cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {users.map((user, i) => {
                const contrib = ANALYTICS_DATA.memberContributions[i];
                const total = contrib
                  ? contrib.tasks + contrib.goals + contrib.announcements
                  : 0;
                return (
                  <Card key={user.id} className="text-center">
                    <div className="relative inline-block mb-3">
                      <Avatar user={user} size="lg" />
                      <span
                        className={cn(
                          "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[var(--surface)]",
                          user.online
                            ? "bg-[var(--success)]"
                            : "bg-[var(--border-strong)]",
                        )}
                      />
                    </div>
                    <p className="font-semibold text-sm text-[var(--text-primary)]">
                      {user.name}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mb-3">
                      {user.role}
                    </p>
                    <div className="flex justify-around text-center border-t border-[var(--border)] pt-3">
                      <div>
                        <p className="text-sm font-bold text-[var(--text-primary)]">
                          {contrib?.tasks || 0}
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)]">
                          Tasks
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--text-primary)]">
                          {contrib?.goals || 0}
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)]">
                          Goals
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--text-primary)]">
                          {contrib?.announcements || 0}
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)]">
                          Posts
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-[var(--border)]">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[var(--text-muted)]">
                          Total score
                        </span>
                        <span className="font-bold text-[var(--accent)]">
                          {total} pts
                        </span>
                      </div>
                      <Progress
                        value={Math.round((total / maxContrib) * 100)}
                        height={4}
                      />
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
