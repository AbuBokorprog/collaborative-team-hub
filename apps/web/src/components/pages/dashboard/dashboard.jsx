"use client";
import {
  Target, CheckSquare, Users, Download, RefreshCw, Zap, Mail, FileSpreadsheet, ChevronDown,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Header from "@/components/common/header";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { analyticsApi } from "@/services/analytics-api";
import { InsightCard, PeriodTabs } from "./DashboardComponents";
import OverviewTab from "./OverviewTab";
import TasksTab from "./TasksTab";
import GoalsTab from "./GoalsTab";
import TeamTab from "./TeamTab";

const TABS = ["overview", "tasks", "goals", "team"];

export default function Dashboard() {
  const {
    activeWorkspace, goals, users, tasks,
    loadDashboard, loadWorkspaceDetails, loadTasks, loadGoals, loadAnnouncements, loadUsers,
  } = useAppStore();

  const [period, setPeriod] = useState("6M");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [exportOpen, setExportOpen] = useState(false);

  const totalTasks = Object.values(tasks).flat().length;
  const doneTasks = tasks.done?.length || 0;
  const completionRate = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const avgGoalProgress = goals.length ? Math.round(goals.reduce((a, g) => a + g.progress, 0) / goals.length) : 0;
  const onlineCount = users.filter((u) => u.online).length;

  useEffect(() => {
    if (!activeWorkspace?.id) return;
    Promise.all([
      loadDashboard(activeWorkspace.id),
      loadWorkspaceDetails(activeWorkspace.id),
      loadTasks(activeWorkspace.id),
      loadUsers(activeWorkspace.id),
      loadGoals(activeWorkspace.id),
      loadAnnouncements(activeWorkspace.id),
    ]);
  }, [activeWorkspace?.id, loadDashboard, loadWorkspaceDetails, loadTasks, loadGoals, loadAnnouncements, loadUsers]);

  const handleDateChange = () => {
    if (activeWorkspace?.id) {
      const options = startDate || endDate ? { startDate, endDate } : {};
      loadDashboard(activeWorkspace.id, options);
    }
  };

  const handleExport = async (type) => {
    if (!activeWorkspace?.id) return;
    try {
      const filters = startDate || endDate ? { startDate, endDate } : {};
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
    } catch {
      toast.error("Export failed");
    } finally {
      setExportOpen(false);
    }
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <Header title="Smart Dashboard" subtitle="Team performance, velocity & contribution insights" />

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
          <PeriodTabs
            active={period}
            onChange={(p) => { setPeriod(p); if (p !== "Custom") { setStartDate(""); setEndDate(""); } }}
          />
          {period === "Custom" && (
            <div className="flex items-center gap-2">
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-xl px-2 py-1 text-xs" />
              <span className="text-[var(--text-muted)]">-</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-xl px-2 py-1 text-xs" />
              <button onClick={handleDateChange} className="p-1 rounded bg-[var(--accent)] text-white text-xs">Apply</button>
            </div>
          )}
          <div className="relative">
            <button
              onClick={() => setExportOpen(!exportOpen)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border)] text-sm text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text-secondary)] transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Export <ChevronDown className="w-3 h-3" />
            </button>
            {exportOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-lg z-50 overflow-hidden">
                <button onClick={() => handleExport("csv")} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-colors">
                  <FileSpreadsheet className="w-4 h-4 text-[var(--success)]" /> Download CSV
                </button>
                <button onClick={() => handleExport("email")} className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-colors">
                  <Mail className="w-4 h-4 text-[var(--accent)]" /> Send via Email
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
        <InsightCard title="Task Completion Rate" value={`${completionRate}%`} delta="8%" deltaType="up"
          subtitle={`${doneTasks} of ${totalTasks} tasks done`} icon={<CheckSquare size={18} />}
          accentColor="var(--accent)" accentBg="var(--accent-soft)" />
        <InsightCard title="Avg. Goal Progress" value={`${avgGoalProgress}%`} delta="5%" deltaType="up"
          subtitle={`${goals.length} active goals`} icon={<Target size={18} />}
          accentColor="var(--success)" accentBg="var(--success-soft)" />
        <InsightCard title="Team Velocity" value="91%" delta="12%" deltaType="up"
          subtitle="Sprint efficiency score" icon={<Zap size={18} />}
          accentColor="var(--warning)" accentBg="var(--warning-soft)" />
        <InsightCard title="Active Members" value={`${onlineCount}/${users.length}`}
          subtitle="Online right now" icon={<Users size={18} />}
          accentColor="var(--info)" accentBg="var(--info-soft)" />
      </div>

      {activeTab === "overview" && <OverviewTab goals={goals} />}
      {activeTab === "tasks" && <TasksTab tasks={tasks} />}
      {activeTab === "goals" && <GoalsTab goals={goals} />}
      {activeTab === "team" && <TeamTab users={users} />}
    </div>
  );
}
