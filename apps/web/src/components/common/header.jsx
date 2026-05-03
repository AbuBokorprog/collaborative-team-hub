"use client";
import { Bell, Sun, Moon, Menu, X, Check, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar } from "../ui/avatar";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { useNotificationStore } from "@/store/useNotificationStore";

const TYPE_ICONS = {
  MENTION: "💬",
  TASK_ASSIGNED: "✅",
  TASK_STATUS_CHANGED: "🔄",
  ANNOUNCEMENT: "📢",
  GOAL_COMPLETED: "🎯",
  WORKSPACE_INVITED: "🏢",
  PROMOTED_TO_MANAGER: "⭐",
  REMOVED_FROM_WORKSPACE: "🚪",
  DEADLINE_REMINDER: "⏰",
  SYSTEM: "🔔",
  // legacy lowercase keys
  mention: "💬",
  task: "✅",
  goal: "🎯",
  comment: "💭",
  announcement: "📢",
};

function formatNotifTime(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function Header({ title, subtitle }) {
  const { currentUser, theme, toggleTheme, toggleMobileSidebar } = useAppStore();
  const {
    notifications,
    unreadCount,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationStore();

  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  return (
    <header className="sticky top-0 z-30 bg-(--background)/80 backdrop-blur-md border-b border-border px-4 lg:px-6 h-14 flex items-center gap-4">
      {/* Mobile menu toggle */}
      <button
        onClick={toggleMobileSidebar}
        className="lg:hidden p-2 rounded-xl hover:bg-(--surface-2) text-(--text-muted)"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-foreground truncate">{title}</h1>
        {subtitle && (
          <p className="text-xs text-(--text-muted) truncate hidden sm:block">{subtitle}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Theme */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl hover:bg-(--surface-2) text-(--text-muted) hover:text-foreground transition-colors"
        >
          {theme === "dark" ? (
            <Sun className="w-4.5 h-4.5" size={18} />
          ) : (
            <Moon className="w-4.5 h-4.5" size={18} />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-xl hover:bg-(--surface-2) text-(--text-muted) hover:text-foreground transition-colors"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
            )}
          </button>

          {notifOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-80 bg-(--surface) border border-border rounded-2xl shadow-(--shadow-lg) z-50 animate-slide-in overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">Notifications</h3>
                    {unreadCount > 0 && (
                      <p className="text-xs text-(--text-muted)">{unreadCount} unread</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-accent hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                    <button onClick={() => setNotifOpen(false)} className="text-(--text-muted)">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 && (
                    <div className="p-8 text-center">
                      <p className="text-2xl mb-2">🔔</p>
                      <p className="text-sm text-(--text-muted)">No notifications yet</p>
                    </div>
                  )}
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => !n.read && markAsRead(n.id)}
                      className={cn(
                        "flex items-start gap-3 p-4 hover:bg-(--surface-2) transition-colors border-b border-border last:border-0 cursor-pointer group/notif",
                        !n.read && "bg-accent/5",
                      )}
                    >
                      <div className="relative shrink-0 mt-0.5">
                        <span className="text-xl leading-none">
                          {TYPE_ICONS[n.type] || "🔔"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        {n.title && (
                          <p className="text-xs font-medium text-foreground leading-snug">
                            {n.title}
                          </p>
                        )}
                        <p className="text-xs text-(--text-secondary) leading-snug mt-0.5">
                          {n.body || n.text}
                        </p>
                        <p className="text-[10px] text-(--text-muted) mt-1">
                          {formatNotifTime(n.createdAt || n.time)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover/notif:opacity-100 transition-opacity shrink-0">
                        {!n.read && (
                          <button
                            onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                            className="p-1 rounded-md hover:bg-(--surface-2) text-accent"
                            title="Mark as read"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                          className="p-1 rounded-md hover:bg-(--surface-2) text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      {!n.read && (
                        <div className="w-2 h-2 bg-accent rounded-full shrink-0 mt-1.5" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-3 border-t border-border">
                  <button className="w-full text-center text-xs text-accent hover:underline">
                    View all notifications
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Avatar */}
        <div className="pl-1">
          <Avatar user={currentUser} size="sm" showOnline />
        </div>
      </div>
    </header>
  );
}
