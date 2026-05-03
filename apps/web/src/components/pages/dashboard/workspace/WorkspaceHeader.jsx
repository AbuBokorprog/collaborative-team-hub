"use client";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TABS_BASE = ["overview", "members"];

export default function WorkspaceHeader({ activeWorkspace, users, stats, isAdmin, activeTab, setActiveTab, onInvite }) {
  const TABS = isAdmin ? [...TABS_BASE, "settings"] : TABS_BASE;

  return (
    <>
      <Card>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
            style={{ backgroundColor: activeWorkspace?.color }}
          >
            {activeWorkspace?.name?.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">{activeWorkspace?.name}</h2>
              <Badge color="accent">{activeWorkspace?.plan}</Badge>
            </div>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">
              {users.length} members · Created January 2024
            </p>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <Button icon={<Plus className="w-4 h-4" />} onClick={onInvite}>Invite</Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-[var(--border)]">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl">{s.icon}</p>
              <p className="text-xl font-bold text-[var(--text-primary)] mt-1">{s.value}</p>
              <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex gap-1 bg-[var(--surface-2)] p-1 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all",
              activeTab === tab
                ? "bg-[var(--surface)] text-[var(--text-primary)] shadow-[var(--shadow-sm)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
            )}
          >
            {tab}
          </button>
        ))}
      </div>
    </>
  );
}
