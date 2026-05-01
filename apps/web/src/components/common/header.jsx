"use client";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { cn, formatDate } from "@/lib/utils";
import { Bell, Search, Sun, Moon, Menu, X } from "lucide-react";
import { Avatar } from "../ui/avatar";

export default function Header({ title, subtitle }) {
  const {
    currentUser,
    theme,
    toggleTheme,
    notifications,
    markAllRead,
    toggleMobileSidebar,
    sidebarOpen,
  } = useAppStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  const notifIcons = {
    mention: "💬",
    task: "✅",
    goal: "🎯",
    comment: "💭",
    announcement: "📢",
  };

  return (
    <header className="sticky top-0 z-30 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border)] px-4 lg:px-6 h-14 flex items-center gap-4">
      {/* Mobile menu toggle */}
      <button
        onClick={toggleMobileSidebar}
        className="lg:hidden p-2 rounded-xl hover:bg-[var(--surface-2)] text-[var(--text-muted)]"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-[var(--text-primary)] truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-[var(--text-muted)] truncate hidden sm:block">
            {subtitle}
          </p>
        )}
      </div>

      {/* Search bar */}
      <div
        className={cn(
          "hidden md:flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl px-3 py-2 transition-all duration-200",
          searchOpen ? "w-64" : "w-48 cursor-pointer",
        )}
      >
        <Search className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
        <input
          placeholder="Search..."
          onFocus={() => setSearchOpen(true)}
          onBlur={() => setSearchOpen(false)}
          className="bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none w-full"
        />
        {searchOpen && (
          <kbd className="text-[10px] text-[var(--text-muted)] border border-[var(--border)] rounded px-1">
            ⌘K
          </kbd>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Theme */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl hover:bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
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
            className="relative p-2 rounded-xl hover:bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--accent)] rounded-full" />
            )}
          </button>

          {notifOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setNotifOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-80 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-[var(--shadow-lg)] z-50 animate-slide-in overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                  <div>
                    <h3 className="font-semibold text-sm text-[var(--text-primary)]">
                      Notifications
                    </h3>
                    {unread > 0 && (
                      <p className="text-xs text-[var(--text-muted)]">
                        {unread} unread
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {unread > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-[var(--accent)] hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setNotifOpen(false)}
                      className="text-[var(--text-muted)]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        "flex items-start gap-3 p-4 hover:bg-[var(--surface-2)] transition-colors border-b border-[var(--border)] last:border-0",
                        !n.read && "bg-[var(--accent-soft)]/30",
                      )}
                    >
                      <div className="relative flex-shrink-0">
                        <Avatar user={n.avatar} size="sm" />
                        <span className="absolute -bottom-1 -right-1 text-base leading-none">
                          {notifIcons[n.type]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[var(--text-primary)] leading-snug">
                          {n.text}
                        </p>
                        <p className="text-[10px] text-[var(--text-muted)] mt-1">
                          {n.time}
                        </p>
                      </div>
                      {!n.read && (
                        <div className="w-2 h-2 bg-[var(--accent)] rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-[var(--border)]">
                  <button className="w-full text-center text-xs text-[var(--accent)] hover:underline">
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
