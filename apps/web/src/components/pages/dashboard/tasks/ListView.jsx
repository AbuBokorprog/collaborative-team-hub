"use client";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { COLUMN_CONFIG, PRIORITY_CONFIG } from "@/lib/utils";

const COLUMNS = ["todo", "inProgress", "review", "done"];

export default function ListView({ tasks, onEdit, onDelete }) {
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
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-(--surface-2) transition-colors group"
            >
              <GripVertical className="w-4 h-4 text-border opacity-0 group-hover:opacity-100" />
              <div className={`w-2 h-2 rounded-full shrink-0 ${p.dot}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {task.title}
                </p>
                <p className="text-xs text-(--text-muted) truncate">
                  {task.desc}
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-3 shrink-0">
                <span
                  className="text-xs font-medium"
                  style={{ color: col.color }}
                >
                  {col.label}
                </span>
                <span className="text-xs text-(--text-muted)">
                  {task.label}
                </span>
                <span className="text-xs text-(--text-muted) hidden md:block">
                  {task.dueDate}
                </span>

                <Avatar>
                  <AvatarImage src={task?.assignee?.avatar} />
                  <AvatarFallback>{task?.assignee?.name}</AvatarFallback>
                </Avatar>
                <button
                  onClick={() => onEdit(task, task._col)}
                  className="p-1 rounded-md hover:bg-(--surface-2) text-(--text-muted) opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDelete(task.id, task._col)}
                  className="p-1 rounded-md hover:bg-(--surface-2) text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
