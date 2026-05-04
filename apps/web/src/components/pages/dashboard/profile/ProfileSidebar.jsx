"use client";
import { Camera, ChevronRight, LogOut } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PROFILE_TABS } from "./ProfileShared";

const isUrl = (v) =>
  typeof v === "string" &&
  (v.startsWith("http") || v.startsWith("/") || v.startsWith("blob:"));

export default function ProfileSidebar({
  currentUser,
  form,
  activeTab,
  setActiveTab,
  logout,
  onAvatarChange,
}) {
  const fileRef = useRef(null);

  return (
    <aside className="lg:w-64 shrink-0 space-y-4">
      <Card className="text-center">
        <div className="relative inline-block mb-4">
          <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center text-white text-2xl font-bold mx-auto">
            {isUrl(currentUser?.avatar) ? (
              <Image
                src={currentUser.avatar}
                alt={currentUser?.name ?? ""}
                width={80}
                height={80}
                className="object-cover"
                unoptimized={currentUser.avatar.startsWith("blob:")}
              />
            ) : (
              currentUser?.avatar
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-7 h-7 bg-[var(--accent)] rounded-lg flex items-center justify-center shadow-md hover:bg-[var(--accent-hover)] transition-colors"
          >
            <Camera className="w-3.5 h-3.5 text-white" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onAvatarChange?.(file);
              e.target.value = "";
            }}
          />
        </div>

        <h3 className="font-semibold text-[var(--text-primary)]">
          {form.name}
        </h3>
        <p className="text-sm text-[var(--text-muted)]">{form.role}</p>
        <div className="flex items-center justify-center gap-1.5 mt-1.5">
          <div className="w-2 h-2 rounded-full bg-[var(--success)]" />
          <span className="text-xs text-[var(--success)] font-medium">
            Online
          </span>
        </div>

        {/* <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-[var(--border)]">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl p-2.5 text-center" style={{ backgroundColor: s.bg }}>
              <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[10px] text-[var(--text-muted)] leading-tight mt-0.5">{s.label}</p>
            </div>
          ))}
        </div> */}
      </Card>

      <Card className="p-2">
        <nav className="space-y-0.5">
          {PROFILE_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left",
                activeTab === tab.id
                  ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                  : "text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]",
              )}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && (
                <ChevronRight className="w-3.5 h-3.5 ml-auto" />
              )}
            </button>
          ))}
        </nav>
      </Card>

      <Card className="p-3">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] transition-all"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </Card>
    </aside>
  );
}
