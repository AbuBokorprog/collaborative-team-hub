"use client";
import {
  Plus,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";

import Header from "@/components/common/header";
import { Modal } from "@/components/common/modal";
import { Select } from "@/components/common/select";
import { Textarea } from "@/components/common/textArea";
import { AvatarGroup } from "@/components/ui/AvatarGroup";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/Input";
import { Progress } from "@/components/ui/progress";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

const STATUS_TABS = ["all", "on-track", "at-risk", "behind"];

export default function GoalsPage() {
  const { goals, updateGoalProgress } = useAppStore();
  const [filter, setFilter] = useState("all");
  const [newGoalOpen, setNewGoalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium",
    status: "on-track",
  });

  const filtered =
    filter === "all" ? goals : goals.filter((g) => g.status === filter);

  const summaryStats = {
    total: goals.length,
    onTrack: goals.filter((g) => g.status === "on-track").length,
    atRisk: goals.filter((g) => g.status === "at-risk").length,
    behind: goals.filter((g) => g.status === "behind").length,
    avgProgress: Math.round(
      goals.reduce((a, g) => a + g.progress, 0) / goals.length,
    ),
  };

  const statusIcons = {
    "on-track": <TrendingUp className="w-4 h-4" />,
    "at-risk": <AlertTriangle className="w-4 h-4" />,
    behind: <AlertTriangle className="w-4 h-4" />,
    completed: <CheckCircle2 className="w-4 h-4" />,
  };

  return (
    <>
      <div className="space-y-6 animate-slide-in">
        <Header
          title="Goals"
          subtitle={`${summaryStats.total} active goals · ${summaryStats.avgProgress}% avg progress`}
        />
        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="text-center">
            <p className="text-3xl font-bold text-[var(--accent)]">
              {summaryStats.total}
            </p>
            <p className="text-sm text-[var(--text-muted)] mt-1">Total Goals</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-[var(--success)]">
              {summaryStats.onTrack}
            </p>
            <p className="text-sm text-[var(--text-muted)] mt-1">On Track</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-[var(--warning)]">
              {summaryStats.atRisk}
            </p>
            <p className="text-sm text-[var(--text-muted)] mt-1">At Risk</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-[var(--danger)]">
              {summaryStats.behind}
            </p>
            <p className="text-sm text-[var(--text-muted)] mt-1">Behind</p>
          </Card>
        </div>

        {/* Filter + Add */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1 bg-[var(--surface-2)] p-1 rounded-xl">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${filter === tab ? "bg-[var(--surface)] text-[var(--text-primary)] shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"}`}
              >
                {tab === "all"
                  ? `All (${goals.length})`
                  : STATUS_CONFIG[tab]?.label}
              </button>
            ))}
          </div>
          <div className="ml-auto">
            <Button
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setNewGoalOpen(true)}
            >
              New Goal
            </Button>
          </div>
        </div>

        {/* Goals grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((goal) => {
            const status = STATUS_CONFIG[goal.status];
            const priority = PRIORITY_CONFIG[goal.priority];
            return (
              <Card key={goal.id} hover className="group">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-[var(--text-primary)]">
                        {goal.title}
                      </h3>
                    </div>
                    <p className="text-sm text-[var(--text-muted)] line-clamp-2">
                      {goal.description}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5 items-end flex-shrink-0">
                    <span
                      className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ background: status.bg, color: status.color }}
                    >
                      {statusIcons[goal.status]} {status.label}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: priority.bg, color: priority.color }}
                    >
                      {priority.label}
                    </span>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[var(--text-muted)]">
                      Progress
                    </span>
                    <span className="text-sm font-bold text-[var(--text-primary)]">
                      {goal.progress}%
                    </span>
                  </div>
                  <Progress
                    value={goal.progress}
                    color={status.color}
                    height={8}
                  />

                  {/* Editable progress */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={goal.progress}
                    onChange={(e) =>
                      updateGoalProgress(goal.id, parseInt(e.target.value))
                    }
                    className="w-full h-1 accent-[var(--accent)] cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ accentColor: status.color }}
                  />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                  <AvatarGroup users={goal.team} max={3} size="xs" />
                  <div className="flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span className="text-xs text-[var(--text-muted)]">
                      Due {goal.dueDate}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🎯</p>
            <h3 className="font-semibold text-[var(--text-primary)]">
              No goals found
            </h3>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Try a different filter or create a new goal
            </p>
          </div>
        )}
      </div>

      {/* New Goal Modal */}
      <Modal
        open={newGoalOpen}
        onClose={() => setNewGoalOpen(false)}
        title="Create New Goal"
        footer={
          <>
            <Button variant="secondary" onClick={() => setNewGoalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setNewGoalOpen(false)}>Create Goal</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Goal title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Launch v2.0 Platform"
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            placeholder="What does success look like?"
            rows={3}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Priority"
              options={[
                { value: "high", label: "High" },
                { value: "medium", label: "Medium" },
                { value: "low", label: "Low" },
              ]}
              value={form.priority}
              onChange={(v) => setForm((f) => ({ ...f, priority: v }))}
            />
            <Input
              label="Due date"
              type="text"
              value={form.dueDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, dueDate: e.target.value }))
              }
              placeholder="Mar 31"
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
