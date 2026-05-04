"use client";
import {
  LayoutDashboard,
  Building2,
  Target,
  CheckSquare,
  Megaphone,
  ChevronDown,
  Plus,
  Settings,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Input } from "../ui/Input";
import { Modal } from "./modal";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/workspace", icon: Building2, label: "Workspace" },
  { href: "/dashboard/goals", icon: Target, label: "Goals" },
  { href: "/dashboard/tasks", icon: CheckSquare, label: "Tasks" },
  { href: "/dashboard/announcements", icon: Megaphone, label: "Announcements" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const {
    currentUser,
    activeWorkspace,
    workspaces,
    setActiveWorkspace,
    sidebarOpen,
    toggleSidebar,
    mobileSidebarOpen,
    toggleMobileSidebar,
    logout,
    users,
  } = useAppStore();

  const { createWorkspace } = useAppStore();
  const [wsOpen, setWsOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const {
    formState: { isSubmitting: creating },
    handleSubmit: handleCreateSubmit,
    register: registerCreate,
    reset: resetCreate,
  } = useForm({ defaultValues: { name: "", description: "" } });
  const onlineUsers = users.filter((u) => u.online && u.id !== currentUser?.id);

  const handleCreateWorkspace = async (values) => {
    const result = await createWorkspace(values);
    if (result?.ok === false) {
      toast.error(result.error);
      return;
    }
    toast.success("Workspace created");
    resetCreate();
    setCreateOpen(false);
    setWsOpen(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full z-50 flex flex-col transition-all duration-300",
          "bg-[var(--sidebar-bg)]",
          sidebarOpen ? "w-60" : "w-16",
          // Mobile
          "lg:translate-x-0",
          mobileSidebarOpen
            ? "translate-x-0 w-60"
            : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5">
          {(sidebarOpen || mobileSidebarOpen) && (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">TH</span>
              </div>
              <span className="font-semibold text-[var(--sidebar-text)] text-sm truncate">
                Team Hub
              </span>
            </div>
          )}
          {!sidebarOpen && !mobileSidebarOpen && (
            <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center mx-auto">
              <span className="text-white text-xs font-bold">TH</span>
            </div>
          )}

          {/* Mobile close */}
          <button
            onClick={toggleMobileSidebar}
            className="lg:hidden p-1 rounded-lg hover:bg-white/10 text-[var(--sidebar-muted)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Workspace switcher */}
        {(sidebarOpen || mobileSidebarOpen) && (
          <div className="px-3 py-3 border-b border-white/5">
            <button
              onClick={() => setWsOpen(!wsOpen)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[var(--sidebar-hover)] transition-colors cursor-pointer"
            >
              <div
                className="w-5 h-5 rounded-md flex-shrink-0"
                style={{ backgroundColor: activeWorkspace?.color }}
              />
              <span className="text-sm text-[var(--sidebar-text)] flex-1 text-left truncate">
                {activeWorkspace?.name}
              </span>
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 text-[var(--sidebar-muted)] transition-transform",
                  wsOpen && "rotate-180",
                )}
              />
            </button>

            {wsOpen && (
              <div className="mt-1 bg-[var(--sidebar-hover)] rounded-xl overflow-hidden border border-white/5">
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      setActiveWorkspace(ws);
                      setWsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-white/5",
                      ws.id === activeWorkspace?.id
                        ? "text-[var(--sidebar-text)]"
                        : "text-[var(--sidebar-muted)]",
                    )}
                  >
                    <div
                      className="w-4 h-4 rounded flex-shrink-0"
                      style={{ backgroundColor: ws.color }}
                    />
                    <span className="flex-1 text-left truncate">{ws.name}</span>
                    <span className="text-xs opacity-50">{ws.plan}</span>
                  </button>
                ))}
                <div className="border-t border-white/5 p-1">
                  <button
                    onClick={() => {
                      setWsOpen(false);
                      setCreateOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-[var(--sidebar-muted)] hover:text-[var(--sidebar-text)] rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> New Workspace
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {(sidebarOpen || mobileSidebarOpen) && (
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--sidebar-muted)] px-3 pb-1.5">
              Navigation
            </p>
          )}
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const active =
              pathname === href ||
              (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => mobileSidebarOpen && toggleMobileSidebar()}
              >
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 my-1 py-2.5 rounded-xl transition-all duration-150",
                    active
                      ? "bg-[var(--sidebar-active)] text-white"
                      : "text-[var(--sidebar-muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-text)]",
                    !sidebarOpen && !mobileSidebarOpen && "justify-center",
                  )}
                >
                  <Icon className="w-4.5 h-4.5 flex-shrink-0" size={18} />
                  {(sidebarOpen || mobileSidebarOpen) && (
                    <span className="text-sm font-medium">{label}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Online team members */}
        {(sidebarOpen || mobileSidebarOpen) && onlineUsers.length > 0 && (
          <div className="px-3 py-3 border-t border-white/5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--sidebar-muted)] px-3 mb-2">
              Online Now
            </p>
            <div className="space-y-1">
              {onlineUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-2 px-3 py-1.5"
                >
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback>
                        {user?.name?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-[var(--success)] rounded-full border border-[var(--sidebar-bg)]" />
                  </div>
                  <span className="text-xs text-[var(--sidebar-muted)] truncate">
                    {user.name.split(" ")[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User + actions */}
        <div className="border-t border-white/5 p-3">
          <div
            className={cn(
              "flex items-center gap-2.5",
              !sidebarOpen && !mobileSidebarOpen && "justify-center",
            )}
          >
            <Avatar>
              <AvatarImage src={currentUser?.avatar} />
              <AvatarFallback>
                {currentUser?.name?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {(sidebarOpen || mobileSidebarOpen) && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[var(--sidebar-text)] truncate">
                  {currentUser?.name}
                </p>
                <p className="text-[10px] text-[var(--sidebar-muted)] truncate">
                  {currentUser?.role}
                </p>
              </div>
            )}
            {(sidebarOpen || mobileSidebarOpen) && (
              <div className="flex gap-1">
                <Link href="/dashboard/profile">
                  <button className="p-1.5 rounded-lg hover:bg-white/10 text-(--sidebar-muted) hover:text-(--sidebar-text) transition-colors">
                    <Settings className="w-3.5 h-3.5" />
                  </button>
                </Link>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-(--sidebar-muted) hover:text-(--sidebar-text) transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Collapse toggle (desktop) */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex absolute cursor-pointer -right-3 top-20 w-6 h-6 bg-(--surface) border border-border rounded-full items-center justify-center shadow-sm hover:bg-(--surface-2) transition-colors z-10"
        >
          {sidebarOpen ? (
            <ChevronsLeft className="w-3 h-3 text-(--text-muted)" />
          ) : (
            <ChevronsRight className="w-3 h-3 text-(--text-muted)" />
          )}
        </button>
      </aside>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create New Workspace"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              loading={creating}
              onClick={handleCreateSubmit(handleCreateWorkspace)}
            >
              Create Workspace
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Workspace name"
            {...registerCreate("name", { required: true })}
            placeholder="e.g. Marketing Team"
          />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--text-primary)]">
              Description
            </label>
            <textarea
              rows={3}
              {...registerCreate("description")}
              placeholder="What is this workspace for?"
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none"
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
