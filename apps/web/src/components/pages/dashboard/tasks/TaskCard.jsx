"use client";
import { ChevronRight, MoreHorizontal, Pencil, Trash2, Calendar as CalendarLucidIcon } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { COLUMN_CONFIG, PRIORITY_CONFIG } from "@/lib/utils";

const COLUMNS = ["todo", "inProgress", "review", "done"];

export default function TaskCard({ task, column, onMove, onEdit, onDelete }) {
  const p = PRIORITY_CONFIG[task.priority];
  const [actionsOpen, setActionsOpen] = useState(false);
  const otherCols = COLUMNS.filter((c) => c !== column);

  return (
    <div className="kanban-card bg-(--surface) border border-border rounded-xl p-3.5 group shadow-(--shadow-sm) hover:shadow-(--shadow) hover:border-(--border-strong)">
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full shrink-0 ${p.dot}`} />
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
            className="p-1 rounded-md hover:bg-(--surface-2) text-(--text-muted) opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
          {actionsOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setActionsOpen(false)} />
              <div className="absolute right-0 top-full mt-1 bg-(--surface) border border-border rounded-xl shadow-(--shadow) py-1 min-w-37.5 z-20">
                {otherCols.map((col) => (
                  <button
                    key={col}
                    onClick={() => { onMove(task.id, column, col); setActionsOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-(--surface-2) transition-colors text-left"
                  >
                    <ChevronRight className="w-3 h-3" /> Move to {COLUMN_CONFIG[col].label}
                  </button>
                ))}
                <div className="border-t border-border my-1" />
                <button
                  onClick={() => { onEdit(task, column); setActionsOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-(--surface-2) transition-colors text-left"
                >
                  <Pencil className="w-3 h-3" /> Edit
                </button>
                <button
                  onClick={() => { onDelete(task.id, column); setActionsOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-(--surface-2) transition-colors text-left"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <h4 className="text-sm font-medium text-foreground mb-1.5 leading-snug">{task.title}</h4>
      {task.desc && (
        <p className="text-xs text-(--text-muted) mb-3 line-clamp-2 leading-relaxed">{task.desc}</p>
      )}

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-(--surface-2) text-(--text-muted)">
          {task.label}
        </span>
        <div className="flex items-center gap-1.5">
          {task.dueDate && (
            <span className="text-[10px] text-(--text-muted) flex items-center gap-0.5">
              <CalendarLucidIcon className="w-3 h-3" />
              {task.dueDate.split("-").slice(1).join("/")}
            </span>
          )}
          <Avatar user={task.assignee} size="xs" />
        </div>
      </div>
    </div>
  );
}
