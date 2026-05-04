"use client";
import { Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn, formatDate } from "@/lib/utils";

const ACTION_LABELS = {
  TASK_CREATED: "created a task",
  TASK_UPDATED: "updated a task",
  GOAL_CREATED: "created a goal",
  GOAL_UPDATED: "updated a goal",
  ANNOUNCEMENT_PINNED: "pinned an announcement",
  WORKSPACE_UPDATED: "updated workspace settings",
  MEMBER_INVITED: "invited a team member",
  MEMBER_REMOVED: "removed a team member",
};

function formatAction(action) {
  return ACTION_LABELS[action] || action.toLowerCase().replace(/_/g, " ");
}

export default function OverviewTab({
  workspaces,
  activeWorkspace,
  workspaceActivity,
  // users,
  onCreateWorkspace,
}) {
  return (
    <div className="grid grid-cols-1 gap-6 animate-fade-in">
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">
            Active Workspaces
          </h3>
          <div className="space-y-3">
            {workspaces.map((ws) => (
              <div
                key={ws.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border transition-all",
                  ws.id === activeWorkspace?.id
                    ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                    : "border-[var(--border)] hover:border-[var(--border-strong)]",
                )}
              >
                <div
                  className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: ws.color }}
                >
                  {ws.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[var(--text-primary)]">
                    {ws.name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {ws.members} members · {ws.plan}
                  </p>
                </div>
                {ws.id === activeWorkspace?.id && (
                  <Badge color="accent">Active</Badge>
                )}
              </div>
            ))}
            <button
              onClick={onCreateWorkspace}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-[var(--border)] text-sm text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
            >
              <Plus className="w-4 h-4" /> Create new workspace
            </button>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">
            Recent Activity
          </h3>
          {workspaceActivity.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] text-center py-4">
              No recent activity yet
            </p>
          ) : (
            <div className="space-y-3">
              {workspaceActivity.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <Avatar>
                    <AvatarImage src={item.actor?.avatar} />
                    <AvatarFallback>{item.actor?.name}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--text-primary)]">
                      <span className="font-medium">
                        {item.actor?.name?.split(" ")[0] ?? "Someone"}
                      </span>{" "}
                      <span className="text-[var(--text-muted)]">
                        {formatAction(item.action)}
                      </span>
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* <div className="space-y-4">
        <Card>
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">Plan Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-muted)]">Current plan</span>
              <Badge color="accent">{activeWorkspace?.plan}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-muted)]">Members</span>
              <span className="font-medium text-[var(--text-primary)]">{users.length} / 10</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-muted)]">Storage</span>
              <span className="font-medium text-[var(--text-primary)]">2.4 GB / 10 GB</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-muted)]">Next billing</span>
              <span className="font-medium text-[var(--text-primary)]">Mar 1, 2025</span>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-2">Upgrade Plan</Button>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-[var(--text-primary)] mb-4">Quick Links</h3>
          <div className="space-y-2">
            {["Documentation", "API Reference", "Integrations", "Support Chat"].map((link) => (
              <button
                key={link}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[var(--surface-2)] text-sm text-[var(--text-secondary)] transition-colors text-left"
              >
                {link}
                <span className="text-[var(--text-muted)]">→</span>
              </button>
            ))}
          </div>
        </Card>
      </div> */}
    </div>
  );
}
