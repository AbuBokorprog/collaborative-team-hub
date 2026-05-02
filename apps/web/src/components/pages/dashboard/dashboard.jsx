"use client";
import {
  CheckSquare,
  Target,
  Users,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";

import Header from "@/components/common/header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/ui/StatCard";
import {
  ANALYTICS_DATA,
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  formatDate,
} from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3 shadow-[var(--shadow)]">
        <p className="text-xs font-semibold text-[var(--text-primary)] mb-1.5">
          {label}
        </p>
        {payload.map((p) => (
          <p key={p.name} className="text-xs" style={{ color: p.color }}>
            {p.name}: <strong>{p.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const {
    activeWorkspace,
    announcements,
    dashboardStats,
    goals,
    loadAnnouncements,
    loadDashboard,
    loadGoals,
    loadTasks,
    loadWorkspaceDetails,
    tasks,
    users,
  } = useAppStore();
  const totalTasks = Object.values(tasks).flat().length;
  const doneTasks = dashboardStats?.overview?.tasks?.completed ?? tasks.done.length;
  const onlineUsers = users.filter((u) => u.online);
  const activeGoals = dashboardStats?.overview?.goals?.total ?? goals.length;
  const totalMembers = dashboardStats?.overview?.totalMembers ?? users.length;
  const completionRate = dashboardStats?.overview?.tasks?.completionRate ?? 78;

  const recentTasks = Object.values(tasks).flat().slice(0, 5);
  const topGoals = goals.slice(0, 3);

  useEffect(() => {
    if (!activeWorkspace?.id) {
      return;
    }

    Promise.all([
      loadDashboard(activeWorkspace.id),
      loadWorkspaceDetails(activeWorkspace.id),
      loadTasks(activeWorkspace.id),
      loadGoals(activeWorkspace.id),
      loadAnnouncements(activeWorkspace.id),
    ]).then((results) => {
      const failed = results.find((result) => result?.ok === false);
      if (failed) {
        toast.error(failed.error);
      }
    });
  }, [
    activeWorkspace?.id,
    loadAnnouncements,
    loadDashboard,
    loadGoals,
    loadTasks,
    loadWorkspaceDetails,
  ]);

  return (
    <div className="space-y-6 animate-slide-in">
      <Header
        title="Good morning 👋"
        subtitle="Here's what's happening with your team today"
      />
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Tasks"
          value={totalTasks}
          change="12%"
          changeType="up"
          icon={<CheckSquare size={18} />}
          iconColor="#5b4fff"
          iconBg="#ede9ff"
          subtitle={`${doneTasks} completed`}
        />
        <StatCard
          title="Active Goals"
          value={activeGoals}
          change="8%"
          changeType="up"
          icon={<Target size={18} />}
          iconColor="#16a34a"
          iconBg="#dcfce7"
          subtitle="2 on track"
        />
        <StatCard
          title="Team Online"
          value={`${onlineUsers.length}/${totalMembers}`}
          icon={<Users size={18} />}
          iconColor="#0891b2"
          iconBg="#cffafe"
          subtitle="Active now"
        />
        <StatCard
          title="Velocity"
          value={`${completionRate}%`}
          change="4%"
          changeType="up"
          icon={<TrendingUp size={18} />}
          iconColor="#d97706"
          iconBg="#fef3c7"
          subtitle="vs last sprint"
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task completion chart */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">
                Task Completion
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Last 6 months
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] inline-block" />
                Completed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--border-strong)] inline-block" />
                Created
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={ANALYTICS_DATA.taskCompletion}>
              <defs>
                <linearGradient id="completedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5b4fff" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#5b4fff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="createdGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9c9895" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#9c9895" stopOpacity={0} />
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
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="created"
                name="Created"
                stroke="var(--border-strong)"
                fill="url(#createdGrad)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="completed"
                name="Completed"
                stroke="var(--accent)"
                fill="url(#completedGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Team online */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[var(--text-primary)]">
              Team Status
            </h3>
            <Badge color="success">{onlineUsers.length} online</Badge>
          </div>
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="flex items-center gap-3">
                <div className="relative">
                  <Avatar user={user} size="sm" />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[var(--surface)] ${user.online ? "bg-[var(--success)]" : "bg-[var(--border-strong)]"}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] truncate">
                    {user.role}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-medium ${user.online ? "text-[var(--success)]" : "text-[var(--text-muted)]"}`}
                >
                  {user.online ? "Online" : "Away"}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Goals + Recent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Goals overview */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[var(--text-primary)]">
              Goal Progress
            </h3>
            <Link
              href="/dashboard/goals"
              className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-4">
            {topGoals.map((goal) => {
              const s = STATUS_CONFIG[goal.status];
              return (
                <div key={goal.id} className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {goal.title}
                    </p>
                    <span className="text-xs font-semibold text-[var(--text-primary)] flex-shrink-0">
                      {goal.progress}%
                    </span>
                  </div>
                  <Progress value={goal.progress} color={s.color} height={6} />
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                      style={{ background: s.bg, color: s.color }}
                    >
                      {s.label}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                      Due {goal.dueDate}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Recent tasks */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[var(--text-primary)]">
              Recent Tasks
            </h3>
            <Link
              href="/dashboard/tasks"
              className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2.5">
            {recentTasks.map((task) => {
              const p = PRIORITY_CONFIG[task.priority];
              return (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--surface-2)] transition-colors"
                >
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${p.dot}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--text-primary)] truncate">
                      {task.title}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {task.label}
                    </p>
                  </div>
                  <Avatar user={task.assignee} size="xs" />
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Latest announcement */}
      {announcements[0] && (
        <Card
          className="border-l-4"
          style={{ borderLeftColor: "var(--accent)" }}
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl">📢</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-[var(--text-primary)]">
                  {announcements[0].title}
                </h3>
                {announcements[0].pinned && (
                  <Badge color="accent">Pinned</Badge>
                )}
              </div>
              <p className="text-sm text-[var(--text-secondary)] mt-1 line-clamp-2">
                {announcements[0].content}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <Avatar user={announcements[0].author} size="xs" />
                <span className="text-xs text-[var(--text-muted)]">
                  {announcements[0].author.name} ·{" "}
                  {formatDate(announcements[0].createdAt)}
                </span>
                <Link
                  href="/dashboard/announcements"
                  className="text-xs text-[var(--accent)] hover:underline ml-auto"
                >
                  Read more
                </Link>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
