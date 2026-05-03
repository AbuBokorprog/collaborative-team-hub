"use client";
import {
  Plus,
  LayoutGrid,
  List,
  ChevronRight,
  Calendar,
  Flag,
  GripVertical,
  MoreHorizontal,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import Header from "@/components/common/header";
import { Modal } from "@/components/common/modal";
import { Select } from "@/components/common/select";
import { Textarea } from "@/components/common/textArea";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/Input";
import { COLUMN_CONFIG, PRIORITY_CONFIG , cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

const COLUMNS = ["todo", "inProgress", "review", "done"];
const PRIORITY_OPTS = [
  { value: "high", label: "🔴 High" },
  { value: "medium", label: "🟡 Medium" },
  { value: "low", label: "🔵 Low" },
];

function TaskCard({ task, column, onMove }) {
  const p = PRIORITY_CONFIG[task.priority];
  const [actionsOpen, setActionsOpen] = useState(false);
  const otherCols = COLUMNS.filter((c) => c !== column);

  return (
    <div className="kanban-card bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3.5 group shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow)] hover:border-[var(--border-strong)]">
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${p.dot}`} />
          <span
            className="text-xs font-medium px-1.5 py-0.5 rounded-md"
            style={{ background: p.bg, color: p.color }}
          >
            {p.label}
          </span>
        </div>
        <div className="relative">
          <button
            onClick={() => setActionsOpen(!actionsOpen)}
            className="p-1 rounded-md hover:bg-[var(--surface-2)] text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
          {actionsOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setActionsOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-[var(--shadow)] py-1 min-w-[150px] z-20">
                {otherCols.map((col) => (
                  <button
                    key={col}
                    onClick={() => {
                      onMove(task.id, column, col);
                      setActionsOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[var(--text-primary)] hover:bg-[var(--surface-2)] transition-colors text-left"
                  >
                    <ChevronRight className="w-3 h-3" /> Move to{" "}
                    {COLUMN_CONFIG[col].label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <h4 className="text-sm font-medium text-[var(--text-primary)] mb-1.5 leading-snug">
        {task.title}
      </h4>
      {task.desc && (
        <p className="text-xs text-[var(--text-muted)] mb-3 line-clamp-2 leading-relaxed">
          {task.desc}
        </p>
      )}

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[var(--border)]">
        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-[var(--surface-2)] text-[var(--text-muted)]">
          {task.label}
        </span>
        <div className="flex items-center gap-1.5">
          {task.dueDate && (
            <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-0.5">
              <Calendar className="w-3 h-3" />
              {task.dueDate.split("-").slice(1).join("/")}
            </span>
          )}
          <Avatar user={task.assignee} size="xs" />
        </div>
      </div>
    </div>
  );
}

function KanbanBoard({ tasks, onMove, onAddTask }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const config = COLUMN_CONFIG[col];
        const colTasks = tasks[col] || [];
        return (
          <div key={col} className="flex flex-col gap-3 min-w-64">
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: config.color }}
                />
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  {config.label}
                </span>
                <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-[var(--surface-2)] text-[var(--text-muted)]">
                  {colTasks.length}
                </span>
              </div>
              <button
                onClick={() => onAddTask(col)}
                className="p-1 rounded-lg hover:bg-[var(--surface-2)] text-[var(--text-muted)] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-2.5 min-h-32">
              {colTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  column={col}
                  onMove={onMove}
                />
              ))}
              {colTasks.length === 0 && (
                <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-6 text-center">
                  <p className="text-xs text-[var(--text-muted)]">No tasks</p>
                </div>
              )}
            </div>
            <button
              onClick={() => onAddTask(col)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text-secondary)] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add task
            </button>
          </div>
        );
      })}
    </div>
  );
}

function ListView({ tasks }) {
  const allTasks = COLUMNS.flatMap((col) =>
    (tasks[col] || []).map((t) => ({ ...t, _col: col })),
  );
  return (
    <Card>
      <div className="space-y-1">
        {allTasks.map((task) => {
          const p = PRIORITY_CONFIG[task.priority];
          const col = COLUMN_CONFIG[task._col];
          return (
            <div
              key={task.id}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--surface-2)] transition-colors group"
            >
              <GripVertical className="w-4 h-4 text-[var(--border)] opacity-0 group-hover:opacity-100" />
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${p.dot}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {task.title}
                </p>
                <p className="text-xs text-[var(--text-muted)] truncate">
                  {task.desc}
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
                <span
                  className="text-xs font-medium"
                  style={{ color: col.color }}
                >
                  {col.label}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  {task.label}
                </span>
                <span className="text-xs text-[var(--text-muted)] hidden md:block">
                  {task.dueDate}
                </span>
                <Avatar user={task.assignee} size="xs" />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default function TasksPage() {
  const {
    activeWorkspace,
    addTask,
    goals,
    loadGoals,
    loadTasks,
    moveTask,
    setTaskView,
    taskView,
    tasks,
    tasksLoading,
    users,
  } = useAppStore();
  const [addOpen, setAddOpen] = useState(false);
  const [targetCol, setTargetCol] = useState("todo");
  const {
    formState: { isSubmitting },
    handleSubmit,
    control,
    register: registerField,
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      title: "",
      desc: "",
      priority: "medium",
      goalId: "",
      dueDate: "",
    },
  });
  const priority = useWatch({ control, name: "priority" });
  const goalId = useWatch({ control, name: "goalId" });

  const totalTasks = Object.values(tasks).flat().length;

  useEffect(() => {
    if (!activeWorkspace?.id) return;
    loadTasks(activeWorkspace.id).then((result) => {
      if (result?.ok === false) toast.error(result.error);
    });
    loadGoals(activeWorkspace.id);
  }, [activeWorkspace?.id, loadGoals, loadTasks]);

  const handleAddTask = (col) => {
    setTargetCol(col);
    setAddOpen(true);
  };
  const handleCreate = async (values) => {
    const result = await addTask(targetCol, {
      ...values,
      goalId: values.goalId || undefined,
      assignee: users[0],
    });

    if (result?.ok === false) {
      toast.error(result.error);
      return;
    }

    toast.success("Task created");
    reset({ title: "", desc: "", priority: "medium", goalId: "", dueDate: "" });
    setAddOpen(false);
  };

  const handleMove = async (...args) => {
    const result = await moveTask(...args);
    if (result?.ok === false) {
      toast.error(result.error);
      return;
    }
    toast.success("Task moved");
  };

  return (
    <>
      <div className="space-y-5 animate-slide-in">
        <Header
          title="Tasks"
          subtitle={
            tasksLoading
              ? "Loading tasks..."
              : `${totalTasks} tasks across ${COLUMNS.length} columns`
          }
        />
        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1 bg-[var(--surface-2)] p-1 rounded-xl">
            <button
              onClick={() => setTaskView("kanban")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                taskView === "kanban"
                  ? "bg-[var(--surface)] text-[var(--text-primary)] shadow-sm"
                  : "text-[var(--text-muted)]",
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Kanban
            </button>
            <button
              onClick={() => setTaskView("list")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                taskView === "list"
                  ? "bg-[var(--surface)] text-[var(--text-primary)] shadow-sm"
                  : "text-[var(--text-muted)]",
              )}
            >
              <List className="w-3.5 h-3.5" /> List
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border)] text-sm text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text-secondary)] transition-all">
              <Flag className="w-3.5 h-3.5" /> Filter
            </button>
          </div>

          <div className="ml-auto">
            <Button
              icon={<Plus className="w-4 h-4" />}
              onClick={() => handleAddTask("todo")}
            >
              New Task
            </Button>
          </div>
        </div>

        {/* View */}
        {taskView === "kanban" ? (
          <KanbanBoard
            tasks={tasks}
            onMove={handleMove}
            onAddTask={handleAddTask}
          />
        ) : (
          <ListView tasks={tasks} onMove={handleMove} />
        )}
      </div>

      {/* Add Task Modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title={`Add task to ${COLUMN_CONFIG[targetCol]?.label}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit(handleCreate)} loading={isSubmitting}>
              Create Task
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Task title"
            {...registerField("title", { required: true })}
            placeholder="What needs to be done?"
          />
          <Textarea
            label="Description"
            {...registerField("desc")}
            placeholder="Add more context..."
            rows={3}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Priority"
              options={PRIORITY_OPTS}
              value={priority}
              onChange={(v) => setValue("priority", v)}
            />
            <Select
              label="Goal (optional)"
              options={[
                { value: "", label: "No goal" },
                ...goals.map((g) => ({ value: g.id, label: g.title })),
              ]}
              value={goalId}
              onChange={(v) => setValue("goalId", v)}
            />
          </div>
          <Input
            label="Due date"
            type="date"
            {...registerField("dueDate")}
          />
        </div>
      </Modal>
    </>
  );
}
