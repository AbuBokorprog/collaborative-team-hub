"use client";
import { Plus } from "lucide-react";
import { COLUMN_CONFIG } from "@/lib/utils";
import TaskCard from "./TaskCard";

const COLUMNS = ["todo", "inProgress", "review", "done"];

export default function KanbanBoard({ tasks, onMove, onAddTask, onEdit, onDelete }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const config = COLUMN_CONFIG[col];
        const colTasks = tasks[col] || [];
        return (
          <div key={col} className="flex flex-col gap-3 min-w-64">
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: config.color }} />
                <span className="text-sm font-semibold text-foreground">{config.label}</span>
                <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-(--surface-2) text-(--text-muted)">
                  {colTasks.length}
                </span>
              </div>
              <button
                onClick={() => onAddTask(col)}
                className="p-1 rounded-lg hover:bg-(--surface-2) text-(--text-muted) transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-2.5 min-h-32">
              {colTasks.map((task) => (
                <TaskCard key={task.id} task={task} column={col} onMove={onMove} onEdit={onEdit} onDelete={onDelete} />
              ))}
              {colTasks.length === 0 && (
                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                  <p className="text-xs text-(--text-muted)">No tasks</p>
                </div>
              )}
            </div>
            <button
              onClick={() => onAddTask(col)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-(--text-muted) hover:bg-(--surface-2) hover:text-(--text-secondary) transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add task
            </button>
          </div>
        );
      })}
    </div>
  );
}
