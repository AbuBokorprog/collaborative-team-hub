"use client";
import {
  Target,
  CheckSquare,
  Users,
  Download,
  RefreshCw,
  Zap,
  Mail,
  FileSpreadsheet,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Header from "@/components/common/header";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { analyticsApi } from "@/services/analytics-api";
import { InsightCard } from "./DashboardComponents";
import OverviewTab from "./OverviewTab";
import TasksTab from "./TasksTab";
import GoalsTab from "./GoalsTab";
import TeamTab from "./TeamTab";

const TABS = ["overview", "tasks", "goals", "team"];

export default function Dashboard() {
  const {
    activeWorkspace,
    goals,
    users,
    tasks,
    taskCompletionChart,
    teamContributions,
    loadDashboard,
    loadWorkspaceDetails,
    loadTasks,
    loadGoals,
    loadAnnouncements,
    loadUsers,
    loadTeamContributions,
  } = useAppStore();

  // const [period, setPeriod] = useState("6M");
  // const [startDate, setStartDate] = useState("");
  // const [endDate, setEndDate] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [exportOpen, setExportOpen] = useState(false);

  const totalTasks = Object.values(tasks).flat().length;
  const doneTasks = tasks.done?.length || 0;
  const completionRate = totalTasks
    ? Math.round((doneTasks / totalTasks) * 100)
    : 0;
  const startOfWeek = (() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(d);
    mon.setDate(diff);
    mon.setHours(0, 0, 0, 0);
    return mon;
  })();
  const completedThisWeek = (tasks.done || []).filter(
    (t) => t.updatedAt && new Date(t.updatedAt) >= startOfWeek,
  ).length;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdueCount = [
    ...(tasks.todo || []),
    ...(tasks.inProgress || []),
  ].filter((t) => t.dueDate && new Date(t.dueDate) < today).length;

  useEffect(() => {
    if (!activeWorkspace?.id) return;
    Promise.all([
      loadDashboard(activeWorkspace.id),
      loadWorkspaceDetails(activeWorkspace.id),
      loadTasks(activeWorkspace.id),
      loadUsers(activeWorkspace.id),
      loadGoals(activeWorkspace.id),
      loadAnnouncements(activeWorkspace.id),
      loadTeamContributions(activeWorkspace.id),
    ]);
  }, [
    activeWorkspace?.id,
    loadDashboard,
    loadWorkspaceDetails,
    loadTasks,
    loadGoals,
    loadAnnouncements,
    loadUsers,
    loadTeamContributions,
  ]);

  // const handleDateChange = () => {
  //   if (activeWorkspace?.id) {
  //     const options = startDate || endDate ? { startDate, endDate } : {};
  //     loadDashboard(activeWorkspace.id, options);
  //   }
  // };

  const handleExport = async (type) => {
    if (!activeWorkspace?.id) return;
    try {
      const filters = {};
      if (type === "csv") {
        toast.success("Download started...");
        await analyticsApi.exportCsv(activeWorkspace.id, filters);
      } else if (type === "email") {
        toast.promise(analyticsApi.emailCsv(activeWorkspace.id, filters), {
          loading: "Sending email...",
          success: "Export sent to your email!",
          error: "Failed to send email",
        });
      }
    } catch (err) {
      console.log("err", err);
      toast.error("Export failed");
    } finally {
      setExportOpen(false);
    }
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <Header
        title="Smart Dashboard"
        subtitle="Team performance, velocity & contribution insights"
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex gap-0.5 bg-[var(--surface-2)] p-1 rounded-xl overflow-x-auto w-full lg:w-auto">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all",
                activeTab === t
                  ? "bg-[var(--surface)] text-[var(--text-primary)] shadow-[var(--shadow-sm)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <div className="relative">
            <button
              onClick={() => setExportOpen(!exportOpen)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border)] text-sm text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text-secondary)] transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Export{" "}
              <ChevronDown className="w-3 h-3" />
            </button>
            {exportOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-lg z-50 overflow-hidden">
                <button
                  onClick={() => handleExport("csv")}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-[var(--success)]" />{" "}
                  Download CSV
                </button>
                <button
                  onClick={() => handleExport("email")}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-colors"
                >
                  <Mail className="w-4 h-4 text-[var(--accent)]" /> Send via
                  Email
                </button>
              </div>
            )}
          </div>
          <button className="p-2 rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text-secondary)] transition-all">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <InsightCard
          title="Task Completion Rate"
          value={`${completionRate}%`}
          subtitle={`${doneTasks} of ${totalTasks} tasks done`}
          icon={<CheckSquare size={18} />}
          accentColor="var(--accent)"
          accentBg="var(--accent-soft)"
        />
        <InsightCard
          title="Total Goals"
          value={goals.length}
          subtitle={`${goals.filter((g) => g.status === "completed").length} completed`}
          icon={<Target size={18} />}
          accentColor="var(--success)"
          accentBg="var(--success-soft)"
        />
        <InsightCard
          title="Completed This Week"
          value={completedThisWeek}
          subtitle="Tasks marked done"
          icon={<Zap size={18} />}
          accentColor="var(--warning)"
          accentBg="var(--warning-soft)"
        />
        <InsightCard
          title="Overdue Tasks"
          value={overdueCount}
          subtitle={overdueCount === 0 ? "All on schedule" : "Past due date"}
          icon={<Users size={18} />}
          accentColor={overdueCount > 0 ? "var(--danger)" : "var(--info)"}
          accentBg={
            overdueCount > 0 ? "var(--danger-soft)" : "var(--info-soft)"
          }
        />
      </div>

      {activeTab === "overview" && <OverviewTab goals={goals} taskCompletionChart={taskCompletionChart} />}
      {activeTab === "tasks" && <TasksTab tasks={tasks} />}
      {activeTab === "goals" && <GoalsTab goals={goals} />}
      {activeTab === "team" && <TeamTab users={users} contributions={teamContributions} />}
    </div>
  );
}
