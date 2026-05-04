"use client";
import { Plus, LayoutGrid, List } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import Header from "@/components/common/header";
import { Modal } from "@/components/common/modal";
import { Button } from "@/components/ui/button";
import { COLUMN_CONFIG, cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import TaskForm from "@/components/pages/dashboard/tasks/TaskForm";
import KanbanBoard from "@/components/pages/dashboard/tasks/KanbanBoard";
import ListView from "@/components/pages/dashboard/tasks/ListView";

const COLUMNS = ["todo", "inProgress", "review", "done"];
const EMPTY_TASK_FORM = {
  title: "",
  desc: "",
  priority: "medium",
  goalId: "",
  dueDate: "",
  assigneeId: "",
};

export default function TasksPage() {
  const {
    activeWorkspace,
    addTask,
    deleteTask,
    updateTask,
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
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);

  const createForm = useForm({ defaultValues: EMPTY_TASK_FORM });
  const editForm = useForm({ defaultValues: EMPTY_TASK_FORM });

  const createPriority = useWatch({
    control: createForm.control,
    name: "priority",
  });
  const createGoalId = useWatch({
    control: createForm.control,
    name: "goalId",
  });
  const createAssigneeId = useWatch({
    control: createForm.control,
    name: "assigneeId",
  });
  const editPriority = useWatch({
    control: editForm.control,
    name: "priority",
  });
  const editGoalId = useWatch({ control: editForm.control, name: "goalId" });
  const editAssigneeId = useWatch({
    control: editForm.control,
    name: "assigneeId",
  });

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
    createForm.reset(EMPTY_TASK_FORM);
    setAddOpen(true);
  };

  const handleCreate = async (values) => {
    const result = await addTask(targetCol, {
      ...values,
      goalId: values.goalId || undefined,
      assigneeId: values.assigneeId || undefined,
    });
    if (result?.ok === false) {
      toast.error(result.error);
      return;
    }
    toast.success("Task created");
    createForm.reset(EMPTY_TASK_FORM);
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

  const openEdit = (task, col) => {
    setEditingTask({ ...task, col });
    editForm.reset({
      title: task.title,
      desc: task.desc || "",
      priority: task.priority || "medium",
      goalId: task.goalId || "",
      dueDate: task.dueDate || "",
      assigneeId:
        task.assignee?.id && task.assignee.id !== "unassigned"
          ? task.assignee.id
          : "",
    });
  };

  const handleEdit = async (values) => {
    const result = await updateTask(editingTask.id, editingTask.col, {
      title: values.title,
      description: values.desc,
      priority: values.priority,
      dueDate: values.dueDate || undefined,
      goalId: values.goalId || undefined,
      assigneeId: values.assigneeId || undefined,
    });
    if (result?.ok === false) {
      toast.error(result.error);
      return;
    }
    toast.success("Task updated");
    setEditingTask(null);
  };

  const confirmDelete = (taskId, col) => setDeletingTask({ id: taskId, col });

  const handleDelete = async () => {
    const result = await deleteTask(deletingTask.id, deletingTask.col);
    if (result?.ok === false) {
      toast.error(result.error);
      return;
    }
    toast.success("Task deleted");
    setDeletingTask(null);
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

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1 bg-(--surface-2) p-1 rounded-xl">
            <button
              onClick={() => setTaskView("kanban")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                taskView === "kanban"
                  ? "bg-(--surface) text-foreground shadow-sm"
                  : "text-(--text-muted)",
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Kanban
            </button>
            <button
              onClick={() => setTaskView("list")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                taskView === "list"
                  ? "bg-(--surface) text-foreground shadow-sm"
                  : "text-(--text-muted)",
              )}
            >
              <List className="w-3.5 h-3.5" /> List
            </button>
          </div>
          {/* <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-sm text-(--text-muted) hover:border-(--border-strong) hover:text-(--text-secondary) transition-all">
            <Flag className="w-3.5 h-3.5" /> Filter
          </button> */}
          <div className="ml-auto">
            <Button
              icon={<Plus className="w-4 h-4" />}
              onClick={() => handleAddTask("todo")}
            >
              New Task
            </Button>
          </div>
        </div>

        {taskView === "kanban" ? (
          <KanbanBoard
            tasks={tasks}
            onMove={handleMove}
            onAddTask={handleAddTask}
            onEdit={openEdit}
            onDelete={confirmDelete}
          />
        ) : (
          <ListView tasks={tasks} onEdit={openEdit} onDelete={confirmDelete} />
        )}
      </div>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title={`Add task to ${COLUMN_CONFIG[targetCol]?.label}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={createForm.handleSubmit(handleCreate)}
              loading={createForm.formState.isSubmitting}
            >
              Create Task
            </Button>
          </>
        }
      >
        <TaskForm
          register={createForm.register}
          setValue={createForm.setValue}
          watch={createForm.watch}
          goals={goals}
          users={users}
          priority={createPriority}
          goalId={createGoalId}
          assigneeId={createAssigneeId}
        />
      </Modal>

      <Modal
        open={!!editingTask}
        onClose={() => setEditingTask(null)}
        title="Edit Task"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditingTask(null)}>
              Cancel
            </Button>
            <Button
              onClick={editForm.handleSubmit(handleEdit)}
              loading={editForm.formState.isSubmitting}
            >
              Save Changes
            </Button>
          </>
        }
      >
        <TaskForm
          register={editForm.register}
          setValue={editForm.setValue}
          watch={editForm.watch}
          goals={goals}
          users={users}
          priority={editPriority}
          goalId={editGoalId}
          assigneeId={editAssigneeId}
        />
      </Modal>

      <Modal
        open={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        title="Delete Task"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeletingTask(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-(--text-secondary)">
          Are you sure you want to delete this task? This action cannot be
          undone.
        </p>
      </Modal>
    </>
  );
}
