"use client";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import Header from "@/components/common/header";
import { Modal } from "@/components/common/modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { STATUS_CONFIG } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import GoalCard from "@/components/pages/dashboard/goals/GoalCard";
import GoalForm from "@/components/pages/dashboard/goals/GoalForm";

const STATUS_TABS = ["all", "on-track", "at-risk", "behind"];
const FORM_DEFAULTS = { title: "", description: "", dueDate: "", priority: "medium", status: "on-track" };

export default function GoalsPage() {
  const { activeWorkspace, createGoal, updateGoal, deleteGoal, goals, loadGoals } = useAppStore();
  const [filter, setFilter] = useState("all");
  const [newGoalOpen, setNewGoalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [deletingGoalId, setDeletingGoalId] = useState(null);

  const createForm = useForm({ defaultValues: FORM_DEFAULTS });
  const editForm = useForm({ defaultValues: FORM_DEFAULTS });

  const createPriority = useWatch({ control: createForm.control, name: "priority" });
  const editPriority = useWatch({ control: editForm.control, name: "priority" });

  useEffect(() => {
    if (!activeWorkspace?.id) return;
    loadGoals(activeWorkspace.id).then((result) => {
      if (result?.ok === false) toast.error(result.error);
    });
  }, [activeWorkspace?.id, loadGoals]);

  const filtered = filter === "all" ? goals : goals.filter((g) => g.status === filter);
  const progressTotal = goals.reduce((a, g) => a + g.progress, 0);
  const summaryStats = {
    total: goals.length,
    onTrack: goals.filter((g) => g.status === "on-track").length,
    atRisk: goals.filter((g) => g.status === "at-risk").length,
    behind: goals.filter((g) => g.status === "behind").length,
    avgProgress: goals.length ? Math.round(progressTotal / goals.length) : 0,
  };

  const handleCreateGoal = async (values) => {
    const result = await createGoal(values);
    if (result?.ok === false) { toast.error(result.error); return; }
    toast.success("Goal created");
    createForm.reset(FORM_DEFAULTS);
    setNewGoalOpen(false);
  };

  const openEdit = (goal) => {
    setEditingGoal(goal);
    editForm.reset({
      title: goal.title,
      description: goal.description || "",
      dueDate: goal.rawDueDate || "",
      priority: goal.priority || "medium",
      status: goal.status || "on-track",
    });
  };

  const handleEditGoal = async (values) => {
    const result = await updateGoal(editingGoal.id, values);
    if (result?.ok === false) { toast.error(result.error); return; }
    toast.success("Goal updated");
    setEditingGoal(null);
  };

  const handleDeleteGoal = async () => {
    const result = await deleteGoal(deletingGoalId);
    if (result?.ok === false) { toast.error(result.error); return; }
    toast.success("Goal deleted");
    setDeletingGoalId(null);
  };

  return (
    <>
      <div className="space-y-6 animate-slide-in">
        <Header
          title="Goals"
          subtitle={`${summaryStats.total} active goals · ${summaryStats.avgProgress}% avg progress`}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="text-center">
            <p className="text-3xl font-bold text-accent">{summaryStats.total}</p>
            <p className="text-sm text-(--text-muted) mt-1">Total Goals</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-(--success)">{summaryStats.onTrack}</p>
            <p className="text-sm text-(--text-muted) mt-1">On Track</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-(--warning)">{summaryStats.atRisk}</p>
            <p className="text-sm text-(--text-muted) mt-1">At Risk</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-(--danger)">{summaryStats.behind}</p>
            <p className="text-sm text-(--text-muted) mt-1">Behind</p>
          </Card>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1 bg-(--surface-2) p-1 rounded-xl">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${filter === tab ? "bg-(--surface) text-foreground shadow-sm" : "text-(--text-muted) hover:text-(--text-secondary)"}`}
              >
                {tab === "all" ? `All (${goals.length})` : STATUS_CONFIG[tab]?.label}
              </button>
            ))}
          </div>
          <div className="ml-auto">
            <Button icon={<Plus className="w-4 h-4" />} onClick={() => setNewGoalOpen(true)}>New Goal</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={openEdit}
              onDelete={setDeletingGoalId}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🎯</p>
            <h3 className="font-semibold text-foreground">No goals found</h3>
            <p className="text-sm text-(--text-muted) mt-1">Try a different filter or create a new goal</p>
          </div>
        )}
      </div>

      <Modal
        open={newGoalOpen}
        onClose={() => setNewGoalOpen(false)}
        title="Create New Goal"
        footer={
          <>
            <Button variant="secondary" onClick={() => setNewGoalOpen(false)}>Cancel</Button>
            <Button onClick={createForm.handleSubmit(handleCreateGoal)} loading={createForm.formState.isSubmitting}>
              Create Goal
            </Button>
          </>
        }
      >
        <GoalForm
          register={createForm.register}
          setValue={createForm.setValue}
          watch={createForm.watch}
          priority={createPriority}
        />
      </Modal>

      <Modal
        open={!!editingGoal}
        onClose={() => setEditingGoal(null)}
        title="Edit Goal"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditingGoal(null)}>Cancel</Button>
            <Button onClick={editForm.handleSubmit(handleEditGoal)} loading={editForm.formState.isSubmitting}>
              Save Changes
            </Button>
          </>
        }
      >
        <GoalForm
          register={editForm.register}
          setValue={editForm.setValue}
          watch={editForm.watch}
          priority={editPriority}
        />
      </Modal>

      <Modal
        open={!!deletingGoalId}
        onClose={() => setDeletingGoalId(null)}
        title="Delete Goal"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeletingGoalId(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteGoal}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-(--text-secondary)">
          Are you sure you want to delete this goal? This action cannot be undone and will also unlink all associated tasks.
        </p>
      </Modal>
    </>
  );
}
