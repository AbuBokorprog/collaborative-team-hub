"use client";
import { Target, TrendingUp, AlertTriangle, CheckCircle2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { AvatarGroup } from "@/components/ui/AvatarGroup";
import { Card } from "@/components/ui/card";
import { STATUS_CONFIG, PRIORITY_CONFIG } from "@/lib/utils";

const statusIcons = {
  "on-track": <TrendingUp className="w-4 h-4" />,
  "at-risk": <AlertTriangle className="w-4 h-4" />,
  behind: <AlertTriangle className="w-4 h-4" />,
  completed: <CheckCircle2 className="w-4 h-4" />,
};

export default function GoalCard({ goal, onEdit, onDelete }) {
  const [openMenu, setOpenMenu] = useState(false);
  const status = STATUS_CONFIG[goal.status];
  const priority = PRIORITY_CONFIG[goal.priority];

  return (
    <Card hover className="group">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground mb-1">{goal.title}</h3>
          <p className="text-sm text-(--text-muted) line-clamp-2">{goal.description}</p>
        </div>
        <div className="flex items-start gap-1.5 shrink-0">
          <div className="flex flex-col gap-1.5 items-end">
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

          <div className="relative">
            <button
              onClick={() => setOpenMenu(!openMenu)}
              className="p-1 rounded-md hover:bg-(--surface-2) text-(--text-muted) opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
            {openMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(false)} />
                <div className="absolute right-0 top-full mt-1 bg-(--surface) border border-border rounded-xl shadow-(--shadow) py-1 min-w-32 z-20">
                  <button
                    onClick={() => { setOpenMenu(false); onEdit(goal); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-(--surface-2) transition-colors text-left"
                  >
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => { setOpenMenu(false); onDelete(goal.id); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-(--surface-2) transition-colors text-left"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-xs text-(--text-muted)">Progress</span>
          <span className="text-sm font-bold text-foreground">{goal.progress}%</span>
        </div>
        <div className="w-full bg-(--surface-2) rounded-full h-1.5">
          <div className="bg-accent h-1.5 rounded-full transition-all" style={{ width: `${goal.progress}%` }} />
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <AvatarGroup users={goal.team} max={3} size="xs" />
        <div className="flex items-center gap-2">
          <Target className="w-3.5 h-3.5 text-(--text-muted)" />
          <span className="text-xs text-(--text-muted)">Due {goal.dueDate}</span>
        </div>
      </div>
    </Card>
  );
}
