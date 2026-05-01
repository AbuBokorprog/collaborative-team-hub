"use client";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import Header from "@/components/common/header";
import { cn } from "@/lib/utils";
import {
  Plus,
  Settings,
  Users,
  Crown,
  MoreHorizontal,
  Shield,
  Mail,
  Trash2,
  Edit2,
} from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/common/select";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/common/modal";

const ROLES = [
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
  { value: "viewer", label: "Viewer" },
];

const ROLE_COLORS = {
  "Product Lead": "accent",
  Designer: "danger",
  Engineer: "info",
  Marketing: "warning",
};

export default function Workspace() {
  const { activeWorkspace, workspaces, users, currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState("overview");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");

  const stats = [
    { label: "Members", value: users.length, icon: "👥" },
    { label: "Projects", value: 8, icon: "📁" },
    { label: "Tasks", value: 42, icon: "✅" },
    { label: "Goals", value: 5, icon: "🎯" },
  ];

  const TABS = ["overview", "members", "settings"];

  return (
    <>
      <div className="space-y-6 animate-slide-in">
        {/* Workspace header card */}
        <Header
          title="Workspace"
          subtitle={`${activeWorkspace?.name} · ${activeWorkspace?.plan} Plan`}
        />
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
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                  {activeWorkspace?.name}
                </h2>
                <Badge color="accent">{activeWorkspace?.plan}</Badge>
              </div>
              <p className="text-sm text-[var(--text-muted)] mt-0.5">
                {users.length} members · Created January 2024
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                icon={<Settings className="w-4 h-4" />}
              >
                Settings
              </Button>
              <Button
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setInviteOpen(true)}
              >
                Invite
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-[var(--border)]">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl">{s.icon}</p>
                <p className="text-xl font-bold text-[var(--text-primary)] mt-1">
                  {s.value}
                </p>
                <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Tabs */}
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

        {/* Overview tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
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
                  <button className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-[var(--border)] text-sm text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all">
                    <Plus className="w-4 h-4" /> Create new workspace
                  </button>
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold text-[var(--text-primary)] mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      user: users[1],
                      action: "completed",
                      item: "Mobile responsive fixes",
                      time: "2m ago",
                    },
                    {
                      user: users[3],
                      action: "moved to review",
                      item: "Auth 2FA integration",
                      time: "15m ago",
                    },
                    {
                      user: users[0],
                      action: "updated goal",
                      item: "Q1 Platform Launch → 68%",
                      time: "1h ago",
                    },
                    {
                      user: users[2],
                      action: "commented on",
                      item: "API rate limiting",
                      time: "3h ago",
                    },
                    {
                      user: users[4],
                      action: "posted announcement",
                      item: "Q1 Planning Week Kickoff",
                      time: "5h ago",
                    },
                  ].map((a, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Avatar user={a.user} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[var(--text-primary)]">
                          <span className="font-medium">
                            {a.user.name.split(" ")[0]}
                          </span>{" "}
                          <span className="text-[var(--text-muted)]">
                            {a.action}
                          </span>{" "}
                          <span className="font-medium">"{a.item}"</span>
                        </p>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">
                          {a.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <h3 className="font-semibold text-[var(--text-primary)] mb-4">
                  Plan Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-muted)]">
                      Current plan
                    </span>
                    <Badge color="accent">{activeWorkspace?.plan}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-muted)]">Members</span>
                    <span className="font-medium text-[var(--text-primary)]">
                      {users.length} / 10
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-muted)]">Storage</span>
                    <span className="font-medium text-[var(--text-primary)]">
                      2.4 GB / 10 GB
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--text-muted)]">
                      Next billing
                    </span>
                    <span className="font-medium text-[var(--text-primary)]">
                      Mar 1, 2025
                    </span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    Upgrade Plan
                  </Button>
                </div>
              </Card>

              <Card>
                <h3 className="font-semibold text-[var(--text-primary)] mb-4">
                  Quick Links
                </h3>
                <div className="space-y-2">
                  {[
                    "Documentation",
                    "API Reference",
                    "Integrations",
                    "Support Chat",
                  ].map((link) => (
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
            </div>
          </div>
        )}

        {/* Members tab */}
        {activeTab === "members" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[var(--text-muted)]">
                {users.length} members
              </p>
              <Button
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setInviteOpen(true)}
              >
                Invite member
              </Button>
            </div>
            <Card>
              <div className="space-y-1">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--surface-2)] transition-colors"
                  >
                    <div className="relative">
                      <Avatar user={user} size="md" />
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[var(--surface)] ${user.online ? "bg-[var(--success)]" : "bg-[var(--border-strong)]"}`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm text-[var(--text-primary)]">
                          {user.name}
                        </p>
                        {user.id === 1 && (
                          <Crown className="w-3.5 h-3.5 text-[var(--warning)]" />
                        )}
                      </div>
                      <p className="text-xs text-[var(--text-muted)]">
                        {user.email}
                      </p>
                    </div>
                    <Badge color={ROLE_COLORS[user.role] || "neutral"}>
                      {user.role}
                    </Badge>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 rounded-lg hover:bg-[var(--border)] text-[var(--text-muted)]">
                        <Mail className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-[var(--border)] text-[var(--text-muted)]">
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Settings tab */}
        {activeTab === "settings" && (
          <div className="space-y-4 animate-fade-in max-w-2xl">
            <Card>
              <h3 className="font-semibold text-[var(--text-primary)] mb-4">
                Workspace Settings
              </h3>
              <div className="space-y-4">
                <Input
                  label="Workspace name"
                  defaultValue={activeWorkspace?.name}
                />
                <Input
                  label="Workspace URL"
                  defaultValue="teamhub.io/teamhub-hq"
                />
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text-primary)]">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    defaultValue="Our main product workspace for the core team."
                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none"
                  />
                </div>
                <Button>Save Changes</Button>
              </div>
            </Card>
            <Card className="border-[var(--danger)]/30">
              <h3 className="font-semibold text-[var(--danger)] mb-2">
                Danger Zone
              </h3>
              <p className="text-sm text-[var(--text-muted)] mb-4">
                Once you delete a workspace, there is no going back.
              </p>
              <Button
                variant="danger"
                size="sm"
                icon={<Trash2 className="w-4 h-4" />}
              >
                Delete Workspace
              </Button>
            </Card>
          </div>
        )}
      </div>

      {/* Invite modal */}
      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite Team Member"
        footer={
          <>
            <Button variant="secondary" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setInviteOpen(false)}>Send Invite</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Email address"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="colleague@company.com"
          />
          <Select
            label="Role"
            options={ROLES}
            value={inviteRole}
            onChange={setInviteRole}
          />
          <div className="bg-[var(--surface-2)] rounded-xl p-3">
            <p className="text-xs text-[var(--text-muted)]">
              They'll receive an email invitation to join{" "}
              <strong className="text-[var(--text-primary)]">
                {activeWorkspace?.name}
              </strong>
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
